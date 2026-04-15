"use client";

import { useRouter } from "next/navigation";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useFormik } from "formik";
import { useNamespacedTranslation } from "@/features/i18n/useNamespacedTranslation";
import { formatCurrencyInput, getCurrencyInputSuggestions, parseCurrencyInput } from "@/lib/format";
import type { AddCategoryModalProps } from "@/features/atelier/types";
import {
  createCategoryWithParsedError,
  type CreateCategoryError,
} from "@/features/atelier/services";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

const allIconChoices = [
  "restaurant",
  "shopping_bag",
  "commute",
  "fitness_center",
  "work",
  "home",
  "payments",
  "celebration",
  "school",
  "flight",
];

type AddCategoryFormValues = {
  name: string;
  monthlyLimit: string;
};

type ValidationResult = {
  fieldErrors: {
    name?: string;
    monthlyLimit?: string;
  };
  warnAtError: string | null;
};

type ErrorPresentation = {
  topLevelError: string | null;
  nameError: string | null;
  monthlyLimitError: string | null;
  warnAtError: string | null;
};

const isCreateCategoryError = (value: unknown): value is CreateCategoryError => {
  return Boolean(
    value &&
      typeof value === "object" &&
      "message" in value &&
      "fieldErrors" in value &&
      "status" in value,
  );
};

const normalizeDuplicateNameError = (value: string, duplicateLabel: string) => {
  return value.toLowerCase().includes("already exists") ? duplicateLabel : value;
};

export const validateAddCategoryForm = (
  values: AddCategoryFormValues,
  warningEnabled: boolean,
  warnAt: string,
  t: (key: string) => string,
): ValidationResult => {
  const fieldErrors: ValidationResult["fieldErrors"] = {};
  const trimmedName = values.name.trim();

  if (!trimmedName) {
    fieldErrors.name = t("atelierCategoryNameRequired");
  } else if (trimmedName.length > 50) {
    fieldErrors.name = t("atelierCategoryNameTooLong");
  }

  if (!values.monthlyLimit.trim()) {
    fieldErrors.monthlyLimit = t("atelierMonthlyLimitRequired");
  } else {
    const monthlyLimit = parseCurrencyInput(values.monthlyLimit);
    if (!Number.isFinite(monthlyLimit) || monthlyLimit < 0) {
      fieldErrors.monthlyLimit = t("atelierMonthlyLimitNonNegative");
    }
  }

  if (!warningEnabled) {
    return { fieldErrors, warnAtError: null };
  }

  const warnAtValue = Number(warnAt);
  if (!Number.isInteger(warnAtValue) || warnAtValue < 1 || warnAtValue > 100) {
    return {
      fieldErrors,
      warnAtError: t("atelierWarnAtValidation"),
    };
  }

  return { fieldErrors, warnAtError: null };
};

export const shouldDismissModalOnKey = (key: string) => key === "Escape";

export const dismissModalFromBackdrop = (closeModal: () => void) => {
  closeModal();
};

export const runCreateCategorySuccessEffects = ({
  resetUiState,
  resetForm,
  setIsOpen,
  notifySuccess,
  refresh,
}: {
  resetUiState: () => void;
  resetForm: () => void;
  setIsOpen: (value: boolean) => void;
  notifySuccess: () => void;
  refresh: () => void;
}) => {
  resetUiState();
  resetForm();
  setIsOpen(false);
  notifySuccess();
  startTransition(() => {
    refresh();
  });
};

export const mapCreateCategoryErrorToPresentation = (
  error: CreateCategoryError,
  t: (key: string) => string,
): ErrorPresentation => {
  const nameError = error.fieldErrors.name
    ? normalizeDuplicateNameError(error.fieldErrors.name, t("atelierCategoryNameDuplicate"))
    : null;

  const monthlyLimitError = error.fieldErrors.monthlyLimit || null;
  const warnAtError = error.fieldErrors.warnAt || null;

  if (error.status >= 500 && !nameError && !monthlyLimitError && !warnAtError) {
    return {
      topLevelError: t("atelierCreateCategoryRecoverable"),
      nameError,
      monthlyLimitError,
      warnAtError,
    };
  }

  return {
    topLevelError: error.message,
    nameError,
    monthlyLimitError,
    warnAtError,
  };
};

export default function AddCategoryModal({ currency, language, initialOpen = false }: AddCategoryModalProps) {
  const router = useRouter();
  const t = useNamespacedTranslation("atelier", language);
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [error, setError] = useState<string | null>(null);
  const [warnAtFieldError, setWarnAtFieldError] = useState<string | null>(null);
  const [keepNextMonth, setKeepNextMonth] = useState(true);
  const [warningEnabled, setWarningEnabled] = useState(true);
  const [warnAt, setWarnAt] = useState("80");
  const [selectedIcon, setSelectedIcon] = useState(allIconChoices[0]);

  const currencyHint = useMemo(() => {
    if (currency === "VND") {
      return t("atelierCurrencyHintVnd");
    }
    return t("atelierCurrencyHintTemplate").replace("{currency}", currency);
  }, [currency, t]);

  const resetUiState = useCallback(() => {
    setError(null);
    setWarnAtFieldError(null);
    setKeepNextMonth(true);
    setWarningEnabled(true);
    setWarnAt("80");
    setSelectedIcon(allIconChoices[0]);
  }, []);

  const formik = useFormik<AddCategoryFormValues>({
    initialValues: {
      name: "",
      monthlyLimit: "0",
    },
    validate: (values) => {
      const validation = validateAddCategoryForm(values, warningEnabled, warnAt, t);
      return validation.fieldErrors;
    },
    onSubmit: async (values) => {
      const validation = validateAddCategoryForm(values, warningEnabled, warnAt, t);
      if (validation.warnAtError) {
        setWarnAtFieldError(validation.warnAtError);
        return;
      }

      setWarnAtFieldError(null);
      setError(null);
      createCategoryMutation.mutate(values);
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (values: AddCategoryFormValues) => {
      return createCategoryWithParsedError(
        {
          name: values.name.trim(),
          icon: selectedIcon,
          monthlyLimit: parseCurrencyInput(values.monthlyLimit),
          keepLimitNextMonth: keepNextMonth,
          warningEnabled,
          warnAt: Number(warnAt || 80),
        },
        t("atelierCreateCategoryFailed"),
      );
    },
    onSuccess: () => {
      runCreateCategorySuccessEffects({
        resetUiState,
        resetForm: formik.resetForm,
        setIsOpen,
        notifySuccess: () => toast.success(t("atelierCreateCategorySuccess")),
        refresh: router.refresh,
      });
    },
    onError: (mutationError: unknown) => {
      if (!isCreateCategoryError(mutationError)) {
        setError(t("atelierCreateCategoryRecoverable"));
        return;
      }

      const presentation = mapCreateCategoryErrorToPresentation(mutationError, t);

      if (presentation.nameError) {
        formik.setFieldError("name", presentation.nameError);
        formik.setFieldTouched("name", true, false);
      }

      if (presentation.monthlyLimitError) {
        formik.setFieldError("monthlyLimit", presentation.monthlyLimitError);
        formik.setFieldTouched("monthlyLimit", true, false);
      }

      setWarnAtFieldError(presentation.warnAtError);
      setError(presentation.topLevelError);
    },
  });

  const monthlyLimitSuggestions = useMemo(() => {
    return getCurrencyInputSuggestions(formik.values.monthlyLimit, currency);
  }, [currency, formik.values.monthlyLimit]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    resetUiState();
    formik.resetForm();
  }, [formik, resetUiState]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (shouldDismissModalOnKey(event.key)) {
        closeModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeModal]);

  const modalBody = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color:rgba(27,54,65,var(--opacity-ghost-border))] p-[var(--spacing-4)] backdrop-blur-[var(--blur-glass)]"
      onMouseDown={() => dismissModalFromBackdrop(closeModal)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[var(--card-radius)] border border-[color:rgba(155,182,196,var(--opacity-ghost-border))] bg-[color:rgba(255,255,255,var(--opacity-glass))] shadow-[0_32px_64px_-12px_rgba(27,54,65,0.12)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="p-[var(--spacing-8)]">
          <div className="mb-[var(--spacing-6)]">
            <div className="mb-[var(--spacing-2)] flex items-center justify-between">
              <span className="font-[var(--font-display)] text-[length:var(--font-label-sm)] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                Lush Ledger
              </span>
              <button
                type="button"
                onClick={closeModal}
                className="grid h-10 w-10 place-items-center rounded-full text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]"
                aria-label={t("atelierDiscard")}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <h2 className="font-[var(--font-display)] text-[length:var(--font-headline-md)] font-extrabold text-[var(--color-on-surface)]">
              {t("atelierCreateNewCategory")}
            </h2>
            <p className="mt-[var(--spacing-2)] text-[length:var(--font-label-md)] text-[var(--color-on-surface)]">
              {t("atelierCategorySegment")}
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-[var(--spacing-6)]">
            <div className="space-y-[var(--spacing-2)]">
              <label className="block text-[length:var(--font-label-sm)] font-bold text-[var(--color-on-surface)]">
                {t("atelierCategoryNameLabel")} <span className="text-[var(--color-error)]">(*)</span>
              </label>
              <div className="relative">
                <input
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder={t("atelierCategoryNamePlaceholder")}
                  className="w-full rounded-[var(--input-radius)] bg-[var(--input-bg)] px-[var(--spacing-4)] py-[var(--spacing-4)] pr-16 text-[length:var(--font-body-md)] text-[var(--color-on-surface)] outline-none ring-2 ring-transparent transition focus:[--tw-ring-color:var(--input-focus-border)]"
                />
                <div className="pointer-events-none absolute right-[var(--spacing-4)] top-1/2 -translate-y-1/2 text-[var(--color-primary)]">
                  <span className="material-symbols-outlined">{selectedIcon}</span>
                </div>
              </div>
              {formik.touched.name && formik.errors.name ? (
                <p className="text-[length:var(--font-label-sm)] text-[var(--color-error)]">{formik.errors.name}</p>
              ) : null}
            </div>

            <div className="space-y-[var(--spacing-2)]">
              <label className="block text-[length:var(--font-label-sm)] font-bold text-[var(--color-on-surface)]">
                {t("atelierIconography")} <span className="text-[var(--color-error)]">(*)</span>
              </label>
              <div className="max-h-56 overflow-y-auto rounded-[var(--radius-xl)] border border-[color:rgba(155,182,196,var(--opacity-ghost-border))] bg-[color:rgba(231,246,255,0.5)] p-[var(--spacing-4)]">
                <div className="grid grid-cols-5 gap-[var(--spacing-2)]">
                  {allIconChoices.map((icon) => {
                    const selected = selectedIcon === icon;

                    return (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSelectedIcon(icon)}
                        className={`aspect-square rounded-[var(--radius-md)] transition hover:scale-105 active:scale-95 ${
                          selected
                            ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[0_4px_12px_rgba(0,111,29,0.2)]"
                            : "bg-[color:rgba(255,255,255,var(--opacity-glass))] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-lowest)]"
                        }`}
                        title={icon}
                        aria-label={t("atelierSelectIconAriaTemplate").replace("{icon}", icon)}
                      >
                        <span className="material-symbols-outlined text-2xl">{icon}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-[var(--spacing-2)]">
              <label className="block text-[length:var(--font-label-sm)] font-bold text-[var(--color-on-surface)]">
                {t("atelierMonthlySpendingLimit")} <span className="text-[var(--color-error)]">(*)</span>
              </label>
              <div className="relative">
                <span className="absolute left-[var(--spacing-4)] top-1/2 -translate-y-1/2 text-[length:var(--font-label-md)] font-bold text-[var(--color-on-surface)]">
                  {currency === "VND" ? "VND" : currency}
                </span>
                <input
                  name="monthlyLimit"
                  type="text"
                  value={formik.values.monthlyLimit}
                  onChange={(event) => {
                    formik.setFieldValue("monthlyLimit", formatCurrencyInput(event.target.value, currency));
                  }}
                  onBlur={formik.handleBlur}
                  className="w-full rounded-[var(--input-radius)] bg-[var(--input-bg)] py-[var(--spacing-4)] pl-20 pr-[var(--spacing-4)] text-[length:var(--font-body-md)] font-bold text-[var(--color-on-surface)] outline-none ring-2 ring-transparent transition focus:[--tw-ring-color:var(--input-focus-border)]"
                />
              </div>

              {monthlyLimitSuggestions.length ? (
                <div className="flex flex-wrap items-center gap-[var(--spacing-2)]">
                  {monthlyLimitSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.value}
                      type="button"
                      onClick={() => {
                        formik.setFieldValue("monthlyLimit", formatCurrencyInput(String(suggestion.value), currency));
                      }}
                      className="rounded-full bg-[var(--color-surface-container-low)] px-[var(--spacing-3)] py-[var(--spacing-1)] text-[length:var(--font-label-sm)] font-bold text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-highest)]"
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              ) : null}

              {formik.touched.monthlyLimit && formik.errors.monthlyLimit ? (
                <p className="text-[length:var(--font-label-sm)] text-[var(--color-error)]">{formik.errors.monthlyLimit}</p>
              ) : null}

              <p className="text-[length:var(--font-label-sm)] italic text-[var(--color-on-surface)]">{currencyHint}</p>
            </div>

            <div className="space-y-[var(--spacing-2)] rounded-[var(--radius-xl)] bg-[var(--color-surface-container-low)] p-[var(--spacing-4)]">
              <div className="flex items-center justify-between gap-[var(--spacing-4)]">
                <span className="text-[length:var(--font-label-md)] font-bold text-[var(--color-on-surface)]">
                  {t("atelierKeepLimitNextMonth")}
                </span>
                <button
                  type="button"
                  onClick={() => setKeepNextMonth((value) => !value)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    keepNextMonth ? "bg-[var(--color-primary)]" : "bg-[var(--color-outline-variant)]"
                  }`}
                  aria-pressed={keepNextMonth}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-[var(--color-surface-container-lowest)] transition ${
                      keepNextMonth ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              <p className="text-[length:var(--font-label-sm)] text-[var(--color-on-surface)]">
                {t("atelierKeepLimitNextMonthHint")}
              </p>
            </div>

            <div className="space-y-[var(--spacing-3)] rounded-[var(--radius-xl)] border border-[color:rgba(155,182,196,var(--opacity-ghost-border))] bg-[color:rgba(231,246,255,0.5)] p-[var(--spacing-4)]">
              <div className="flex items-center justify-between gap-[var(--spacing-4)]">
                <div>
                  <p className="text-[length:var(--font-label-md)] font-bold text-[var(--color-on-surface)]">
                    {t("atelierOverExpenseWarning")}
                  </p>
                  <p className="text-[length:var(--font-label-sm)] text-[var(--color-on-surface)]">
                    {t("atelierWarningHint")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setWarningEnabled((value) => !value);
                    setWarnAtFieldError(null);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    warningEnabled ? "bg-[var(--color-primary)]" : "bg-[var(--color-outline-variant)]"
                  }`}
                  aria-pressed={warningEnabled}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-[var(--color-surface-container-lowest)] transition ${
                      warningEnabled ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center gap-[var(--spacing-3)]">
                <div className="h-[4px] flex-1 rounded-full bg-[var(--color-surface-container-highest)]">
                  <div
                    className="h-[4px] rounded-full bg-[var(--color-primary)]"
                    style={{ width: `${Math.max(0, Math.min(100, Number(warnAt || 0)))}%` }}
                  />
                </div>
                <input
                  value={`${warnAt}%`}
                  onChange={(event) => {
                    setWarnAt(event.target.value.replace(/[^0-9]/g, "").slice(0, 3));
                    setWarnAtFieldError(null);
                  }}
                  disabled={!warningEnabled}
                  className="w-20 rounded-[var(--input-radius)] bg-[var(--color-surface-container-lowest)] px-[var(--spacing-2)] py-[var(--spacing-2)] text-center text-[length:var(--font-label-md)] font-bold text-[var(--color-on-surface)] outline-none ring-2 ring-transparent transition focus:[--tw-ring-color:var(--input-focus-border)] disabled:opacity-[var(--opacity-glass)]"
                />
                <span className="text-[length:var(--font-label-sm)] font-bold uppercase text-[var(--color-on-surface)]">
                  {t("atelierWarnAt")}
                </span>
              </div>

              {warnAtFieldError ? (
                <p className="text-[length:var(--font-label-sm)] text-[var(--color-error)]">{warnAtFieldError}</p>
              ) : null}
            </div>

            {error ? (
              <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-container-low)] px-[var(--spacing-4)] py-[var(--spacing-3)] text-[length:var(--font-label-md)] text-[var(--color-error)]">
                {error}
              </div>
            ) : null}

            <div className="flex items-center gap-[var(--spacing-4)]">
                <button
                  type="submit"
                  disabled={createCategoryMutation.isPending}
                  className="flex-1 rounded-[var(--btn-radius)] bg-[image:var(--gradient-primary)] px-[var(--btn-padding-x)] py-[var(--btn-padding-y)] font-[var(--font-display)] text-[length:var(--font-label-md)] font-bold text-[var(--color-on-primary)] shadow-[0_8px_24px_rgba(0,111,29,0.25)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-[var(--opacity-glass)]"
                >
                {createCategoryMutation.isPending ? t("atelierAddingCategory") : t("atelierAddCategory")}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[length:var(--font-label-md)] font-bold text-[var(--color-on-surface-variant)] transition hover:text-[var(--color-error)]"
              >
                {t("atelierDiscard")}
              </button>
            </div>
          </form>
        </div>

        <div className="h-[4px] w-full bg-[image:var(--gradient-primary)]" />
      </div>
    </div>
  );

  const modalNode = !isOpen
    ? null
    : typeof document === "undefined"
      ? modalBody
      : createPortal(modalBody, document.body);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group flex h-full w-full min-h-[220px] flex-col items-center justify-center rounded-[var(--card-radius)] bg-[var(--card-bg)] p-[var(--spacing-6)] shadow-[var(--shadow-ambient)] transition duration-300 hover:bg-[var(--color-surface-container-low)]"
      >
        <div className="mb-[var(--spacing-3)] grid h-12 w-12 place-items-center rounded-full bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] transition group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-on-primary)]">
          <span className="material-symbols-outlined text-2xl">add</span>
        </div>
        <span className="font-[var(--font-display)] text-[length:var(--font-body-md)] font-bold text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)]">
          {t("atelierAddNewCategory")}
        </span>
      </button>

      {modalNode}
    </>
  );
}
