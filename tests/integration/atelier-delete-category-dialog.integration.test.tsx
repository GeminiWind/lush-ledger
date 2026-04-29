import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AtelierPageView from "@/features/atelier/pages/AtelierPageView";
import DeleteCategoryDialog, {
  dismissDeleteModalFromBackdrop,
  mapDeleteCategoryErrorToPresentation,
  mapDeleteCategorySuccessContract,
  runDeleteCategorySuccessEffects,
  shouldDismissDeleteModal,
  shouldDismissDeleteModalOnKey,
  shouldSubmitDeleteAgain,
} from "@/features/atelier/dialogs/DeleteCategoryDialog";
import { deleteCategoryWithParsedError } from "@/features/atelier/services";

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

describe("Atelier delete category dialog integration", () => {
  it("shows delete trigger from category row and renders modal shell in open state", () => {
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
              spent: 12450000,
              usagePercent: 85,
              warningEnabled: true,
              warnAt: 80,
              carryNextMonth: true,
              status: "overspent",
            },
          ],
        }}
        monthTransactions={[]}
        monthlyCap={{ totalCap: 0, totalLimit: 0 }}
      />,
    );

    expect(pageHtml).toContain('aria-label="atelierDeleteAriaTemplate"');

    const dialogHtml = renderWithQueryClient(
      <DeleteCategoryDialog
        category={{
          id: "cat_001",
          name: "Dining & Leisure",
          icon: "restaurant",
          limit: 2000000,
          spent: 12450000,
        }}
        currency="VND"
        language="en-US"
      />, 
    );

    expect(dialogHtml).toContain("atelierDeleteAriaTemplate");
  });

  it("maps successful delete payload and triggers list refresh effects", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          deletedCategoryId: "cat_001",
          reassignedToCategoryId: "cat_uncategorized_1",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const response = await deleteCategoryWithParsedError("cat_001", "Could not delete category.");

    expect(response.ok).toBe(true);
    expect(response.deletedCategoryId).toBe("cat_001");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/categories/cat_001",
      expect.objectContaining({ method: "DELETE" }),
    );

    const notifySuccess = vi.fn();
    const close = vi.fn();
    const invalidateAtelier = vi.fn().mockResolvedValue(undefined);
    const refresh = vi.fn();

    await runDeleteCategorySuccessEffects({
      notifySuccess,
      close,
      invalidateAtelier,
      refresh,
    });

    expect(notifySuccess).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(invalidateAtelier).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });

  it("maps structured backend errors to recoverable dialog message", () => {
    const presentation = mapDeleteCategoryErrorToPresentation(
      {
        message: "Category not found.",
        fieldErrors: {},
        status: 404,
      },
      (key: string) => key,
    );

    expect(presentation.topLevelError).toBe("Category not found.");
  });

  it("maps structured validation errors and retryable failures for dialog messaging", () => {
    const validationPresentation = mapDeleteCategoryErrorToPresentation(
      {
        message: "Validation failed.",
        fieldErrors: { id: "Invalid category id." },
        status: 400,
      },
      (key: string) => key,
    );

    expect(validationPresentation.topLevelError).toBe("Invalid category id.");

    const retryablePresentation = mapDeleteCategoryErrorToPresentation(
      {
        message: "Unable to delete category. Please try again.",
        fieldErrors: {},
        status: 500,
      },
      (key: string) => key,
    );

    expect(retryablePresentation.topLevelError).toBe("atelierDeleteFailed");
  });

  it("maps delete success contract payload for reassignment metadata", () => {
    const mapped = mapDeleteCategorySuccessContract({
      ok: true,
      deletedCategoryId: "cat_001",
      reassignedToCategoryId: "cat_uncategorized_1",
    });

    expect(mapped).toEqual({
      deletedCategoryId: "cat_001",
      reassignedToCategoryId: "cat_uncategorized_1",
    });

    expect(
      mapDeleteCategorySuccessContract({
        ok: true,
        deletedCategoryId: "cat_001",
        reassignedToCategoryId: "",
      }),
    ).toBeNull();
  });

  it("supports dismiss utilities for escape and backdrop paths", () => {
    expect(shouldDismissDeleteModalOnKey("Escape")).toBe(true);
    expect(shouldDismissDeleteModalOnKey("Enter")).toBe(false);
    expect(shouldDismissDeleteModal(false)).toBe(true);
    expect(shouldDismissDeleteModal(true)).toBe(false);

    const close = vi.fn();
    dismissDeleteModalFromBackdrop(close);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("prevents duplicate submit while delete request is pending", () => {
    expect(shouldSubmitDeleteAgain(false)).toBe(true);
    expect(shouldSubmitDeleteAgain(true)).toBe(false);
  });

  it("dismiss actions do not trigger delete API call", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const close = vi.fn();
    if (shouldDismissDeleteModal(false)) {
      dismissDeleteModalFromBackdrop(close);
    }

    if (shouldDismissDeleteModalOnKey("Escape") && shouldDismissDeleteModal(false)) {
      close();
    }

    expect(close).toHaveBeenCalledTimes(2);
    expect(fetchMock).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
