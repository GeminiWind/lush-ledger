import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AtelierPageView from "@/features/atelier/pages/AtelierPageView";
import AddCategoryModal, {
  dismissModalFromBackdrop,
  mapCreateCategoryErrorToPresentation,
  runCreateCategorySuccessEffects,
  shouldDismissModalOnKey,
  validateAddCategoryForm,
} from "@/features/atelier/dialogs/AddCategoryModal";
import { createCategoryWithParsedError } from "@/features/atelier/services";

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

describe("Atelier create category modal integration", () => {
  it("opens modal from Add New Category card on /app/atelier", () => {
    const html = renderWithQueryClient(
      <AtelierPageView
        language="en-US"
        currency="VND"
        selectedMonth="2026-04"
        monthOptions={["2026-04"]}
        monthStart={new Date("2026-04-01T00:00:00.000Z")}
        monthValidationError={null}
        listLoadError={null}
        listData={{ month: "2026-04", categories: [] }}
        monthTransactions={[]}
        monthlyCap={{ totalCap: 0, totalLimit: 0 }}
      />,
    );

    expect(html).toContain("atelierAddNewCategory");
  });

  it("renders create-category modal shell in open state", () => {
    const html = renderWithQueryClient(<AddCategoryModal currency="VND" language="en-US" initialOpen />);

    expect(html).toContain("atelierCreateNewCategory");
    expect(html).toContain("atelierAddCategory");
  });

  it("submits valid payload through service and returns category response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          category: {
            id: "cat_new",
            userId: "user_123",
            name: "Luxury Travel",
            icon: "flight",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const response = await createCategoryWithParsedError(
      {
        name: "Luxury Travel",
        icon: "flight",
        monthlyLimit: 5000000,
        keepLimitNextMonth: true,
        warningEnabled: true,
        warnAt: 80,
      },
      "Could not create category.",
    );

    expect(response.category.name).toBe("Luxury Travel");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/categories",
      expect.objectContaining({
        method: "POST",
      }),
    );

    vi.unstubAllGlobals();
  });

  it("shows field-level validation feedback for invalid values", () => {
    const t = (key: string) => key;
    const validation = validateAddCategoryForm(
      {
        name: "",
        monthlyLimit: "",
      },
      true,
      "110",
      t,
    );

    expect(validation.fieldErrors.name).toBe("atelierCategoryNameRequired");
    expect(validation.fieldErrors.monthlyLimit).toBe("atelierMonthlyLimitRequired");
    expect(validation.warnAtError).toBe("atelierWarnAtValidation");
  });

  it("maps duplicate-name conflict to inline name error while preserving other fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "Category name already exists.",
          errors: {
            name: "Category name already exists.",
          },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    let thrown: unknown;
    try {
      await createCategoryWithParsedError(
        {
          name: "Luxury Travel",
          icon: "flight",
          monthlyLimit: 5000000,
          keepLimitNextMonth: true,
          warningEnabled: true,
          warnAt: 80,
        },
        "Could not create category.",
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeTruthy();

    const presentation = mapCreateCategoryErrorToPresentation(
      thrown as {
        message: string;
        fieldErrors: Record<string, string>;
        status: number;
      },
      (key: string) => key,
    );

    expect(presentation.nameError).toBe("atelierCategoryNameDuplicate");
    expect(presentation.monthlyLimitError).toBeNull();
    expect(presentation.warnAtError).toBeNull();

    vi.unstubAllGlobals();
  });

  it("shows recoverable top-level feedback for non-validation failures", () => {
    const presentation = mapCreateCategoryErrorToPresentation(
      {
        message: "Internal Server Error",
        fieldErrors: {},
        status: 500,
      },
      (key: string) => key,
    );

    expect(presentation.topLevelError).toBe("atelierCreateCategoryRecoverable");
  });

  it("maps successful create to close + success feedback + list refresh", () => {
    const resetUiState = vi.fn();
    const resetForm = vi.fn();
    const setIsOpen = vi.fn();
    const notifySuccess = vi.fn();
    const refresh = vi.fn();

    runCreateCategorySuccessEffects({
      resetUiState,
      resetForm,
      setIsOpen,
      notifySuccess,
      refresh,
    });

    expect(resetUiState).toHaveBeenCalledTimes(1);
    expect(resetForm).toHaveBeenCalledTimes(1);
    expect(setIsOpen).toHaveBeenCalledWith(false);
    expect(notifySuccess).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("supports dismiss paths via Escape key and backdrop action", () => {
    expect(shouldDismissModalOnKey("Escape")).toBe(true);
    expect(shouldDismissModalOnKey("Enter")).toBe(false);

    const closeModal = vi.fn();
    dismissModalFromBackdrop(closeModal);
    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it("renders close and discard controls in modal actions", () => {
    const html = renderWithQueryClient(<AddCategoryModal currency="VND" language="en-US" initialOpen />);

    expect(html).toContain('aria-label="atelierDiscard"');
    expect(html).toContain("atelierDiscard");
  });
});
