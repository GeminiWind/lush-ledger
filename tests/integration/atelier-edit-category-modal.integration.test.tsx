import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { formatCurrencyInput } from "@/lib/format";
import AtelierPageView from "@/features/atelier/pages/AtelierPageView";
import EditCategoryModal, {
  dismissEditModalFromBackdrop,
  mapUpdateCategoryErrorToPresentation,
  runDismissEditModalEffects,
  runUpdateCategoryErrorEffects,
  runUpdateCategorySuccessEffects,
  shouldDismissModalOnKey,
  validateWarnAtForUpdate,
} from "@/features/atelier/dialogs/EditCategoryModal";
import { updateCategoryWithParsedError } from "@/features/atelier/services";

vi.mock("@/features/i18n/useNamespacedTranslation", () => ({
  useNamespacedTranslation: () => (key: string) => key,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/app/atelier",
  useSearchParams: () => new URLSearchParams("month=2026-04"),
}));

const renderWithQueryClient = (node: ReactElement) => {
  const queryClient = new QueryClient();
  return renderToStaticMarkup(<QueryClientProvider client={queryClient}>{node}</QueryClientProvider>);
};

describe("Atelier edit category modal integration", () => {
  it("opens edit modal from category row action with prefilled values", () => {
    const pageHtml = renderWithQueryClient(
      <AtelierPageView
        language="en-US"
        currency="VND"
        selectedMonth="2026-04"
        monthOptions={["2026-04"]}
        monthStart={new Date("2026-04-01T00:00:00.000Z")}
        monthValidationError={null}
        listLoadError={null}
        listData={{
          month: "2026-04",
          categories: [
            {
              id: "cat_001",
              name: "Dining & Leisure",
              icon: "restaurant",
              limit: 2000000,
              spent: 1000000,
              usagePercent: 50,
              warningEnabled: true,
              warnAt: 80,
              carryNextMonth: true,
              status: "healthy",
            },
          ],
        }}
        monthTransactions={[]}
        monthlyCap={{ totalCap: 0, totalLimit: 0 }}
      />,
    );

    expect(pageHtml).toContain('aria-label="atelierActionEdit Dining &amp; Leisure"');

    const modalHtml = renderWithQueryClient(
      <EditCategoryModal
        category={{
          id: "cat_001",
          name: "Dining & Leisure",
          icon: "restaurant",
          limit: 2000000,
          warningEnabled: true,
          warnAt: 80,
          carryNextMonth: true,
        }}
        currency="VND"
        language="en-US"
        activeMonth="2026-04"
        isOpen
        onClose={vi.fn()}
      />, 
    );

    expect(modalHtml).toContain("atelierUpdateCategory");
    expect(modalHtml).toContain('value="Dining &amp; Leisure"');
    expect(modalHtml).toContain(`value="${formatCurrencyInput("2000000", "VND")}"`);
  });

  it("submits valid update and triggers success-close-refresh flow", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          category: {
            id: "cat_001",
            name: "Dining",
            icon: "restaurant",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const payload = {
      name: "Dining",
      icon: "restaurant",
      monthlyLimit: 2500000,
      warningEnabled: true,
      warnAt: 80,
      keepLimitNextMonth: true,
    };

    const response = await updateCategoryWithParsedError("cat_001", payload, "Could not update category.", {
      month: "2026-04",
    });

    expect(response.category.name).toBe("Dining");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/categories/cat_001?month=2026-04",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    );

    const notifySuccess = vi.fn();
    const invalidateAtelier = vi.fn().mockResolvedValue(undefined);
    const refresh = vi.fn();
    const close = vi.fn();

    await runUpdateCategorySuccessEffects({
      notifySuccess,
      invalidateAtelier,
      refresh,
      close,
    });

    expect(notifySuccess).toHaveBeenCalledTimes(1);
    expect(invalidateAtelier).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });

  it("maps field-level validation errors without dismissing the dialog", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "Validation failed",
          errors: {
            name: "Category name already exists.",
            monthlyLimit: "Monthly limit must be greater than zero.",
            warnAt: "Warn threshold must be an integer from 1 to 100.",
          },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    let thrown: unknown;
    try {
      await updateCategoryWithParsedError(
        "cat_001",
        {
          name: "Dining",
          icon: "restaurant",
          monthlyLimit: 0,
          warningEnabled: true,
          warnAt: 101,
          keepLimitNextMonth: true,
        },
        "Could not update category.",
      );
    } catch (error) {
      thrown = error;
    }

    const close = vi.fn();
    const setFieldError = vi.fn();
    const setFieldTouched = vi.fn();
    const setWarnAtFieldError = vi.fn();
    const setTopLevelError = vi.fn();

    runUpdateCategoryErrorEffects({
      mutationError: thrown,
      t: (key: string) => key,
      setFieldError,
      setFieldTouched,
      setWarnAtFieldError,
      setTopLevelError,
    });

    expect(setFieldError).toHaveBeenCalledWith("name", "atelierCategoryNameDuplicate");
    expect(setFieldError).toHaveBeenCalledWith("monthlyLimit", "Monthly limit must be greater than zero.");
    expect(setWarnAtFieldError).toHaveBeenCalledWith("Warn threshold must be an integer from 1 to 100.");
    expect(setTopLevelError).toHaveBeenLastCalledWith("Validation failed");
    expect(close).not.toHaveBeenCalled();

    const warnAtValidationDisabled = validateWarnAtForUpdate(false, "101", (key: string) => key);
    expect(warnAtValidationDisabled).toBeNull();

    vi.unstubAllGlobals();
  });

  it("keeps payload stable across retries after a non-field error", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: "Temporary server issue",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            category: {
              id: "cat_001",
              name: "Dining Prime",
              icon: "restaurant",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

    vi.stubGlobal("fetch", fetchMock);

    const retryPayload = {
      name: "Dining Prime",
      icon: "restaurant",
      monthlyLimit: 3500000,
      warningEnabled: true,
      warnAt: 80,
      keepLimitNextMonth: true,
    };

    let thrown: unknown;
    try {
      await updateCategoryWithParsedError("cat_001", retryPayload, "Could not update category.");
    } catch (error) {
      thrown = error;
    }

    const presentation = mapUpdateCategoryErrorToPresentation(
      thrown as {
        message: string;
        fieldErrors: Record<string, string>;
        status: number;
      },
      (key: string) => key,
    );

    expect(presentation.topLevelError).toBe("atelierEditCategoryRecoverable");
    expect(presentation.nameError).toBeNull();

    const response = await updateCategoryWithParsedError("cat_001", retryPayload, "Could not update category.");

    expect(response.category.name).toBe("Dining Prime");
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/categories/cat_001",
      expect.objectContaining({ body: JSON.stringify(retryPayload) }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/categories/cat_001",
      expect.objectContaining({ body: JSON.stringify(retryPayload) }),
    );

    vi.unstubAllGlobals();
  });

  it("shows recoverable fallback for server errors without field-level details", () => {
    const presentation = mapUpdateCategoryErrorToPresentation(
      {
        message: "Internal server error",
        fieldErrors: {},
        status: 500,
      },
      (key: string) => key,
    );

    expect(presentation.topLevelError).toBe("atelierEditCategoryRecoverable");
    expect(presentation.nameError).toBeNull();
    expect(presentation.monthlyLimitError).toBeNull();
    expect(presentation.warnAtError).toBeNull();
  });

  it("dismisses without save via cancel and close button", () => {
    const html = renderWithQueryClient(
      <EditCategoryModal
        category={{
          id: "cat_001",
          name: "Dining & Leisure",
          icon: "restaurant",
          limit: 2000000,
          warningEnabled: true,
          warnAt: 80,
          carryNextMonth: true,
        }}
        currency="VND"
        language="en-US"
        activeMonth="2026-04"
        isOpen
        onClose={vi.fn()}
      />,
    );

    expect(html).toContain('aria-label="atelierActionCancel"');
    expect(html).toContain("atelierDiscard");

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const close = vi.fn();
    const resetForm = vi.fn();
    const clearTopLevelError = vi.fn();
    const clearWarnAtFieldError = vi.fn();
    const resetLocalState = vi.fn();

    runDismissEditModalEffects({
      close,
      resetForm,
      clearTopLevelError,
      clearWarnAtFieldError,
      resetLocalState,
    });

    expect(clearTopLevelError).toHaveBeenCalledTimes(1);
    expect(clearWarnAtFieldError).toHaveBeenCalledTimes(1);
    expect(resetForm).toHaveBeenCalledTimes(1);
    expect(resetLocalState).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it("dismisses without save via Escape and backdrop", () => {
    expect(shouldDismissModalOnKey("Escape")).toBe(true);
    expect(shouldDismissModalOnKey("Enter")).toBe(false);

    const closeModal = vi.fn();
    dismissEditModalFromBackdrop(closeModal);

    expect(closeModal).toHaveBeenCalledTimes(1);
  });
});
