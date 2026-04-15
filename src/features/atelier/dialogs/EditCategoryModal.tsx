"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useFormik } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNamespacedTranslation } from "@/features/i18n/useNamespacedTranslation";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/format";
import {
  updateCategoryWithParsedError,
  type UpdateCategoryError,
} from "@/features/atelier/services";
import type {
  EditCategoryModalProps,
  UpdateCategoryPayload,
} from "@/features/atelier/types";

const iconChoices = [
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
] as const;

type EditCategoryFormValues = {
  name: string;
  monthlyLimit: string;
};

type ErrorPresentation = {
  topLevelError: string | null;
  nameError: string | null;
  monthlyLimitError: string | null;
  warnAtError: string | null;
};

const isUpdateCategoryError = (value: unknown): value is UpdateCategoryError => {
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

export const mapUpdateCategoryErrorToPresentation = (
  error: UpdateCategoryError,
  t: (key: string) => string,
): ErrorPresentation => {
  const nameError = error.fieldErrors.name
    ? normalizeDuplicateNameError(error.fieldErrors.name, t("atelierCategoryNameDuplicate"))
    : null;
  const monthlyLimitError = error.fieldErrors.monthlyLimit || null;
  const warnAtError = error.fieldErrors.warnAt || null;

  if (error.status >= 500 && !nameError && !monthlyLimitError && !warnAtError) {
    return {
      topLevelError: t("atelierEditCategoryRecoverable"),
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

export const validateWarnAtForUpdate = (
  warningEnabled: boolean,
  warnAt: string,
  t: (key: string) => string,
) => {
  if (!warningEnabled) {
    return null;
  }

  const warnAtValue = Number(warnAt);
  if (!Number.isInteger(warnAtValue) || warnAtValue < 1 || warnAtValue > 100) {
    return t("atelierWarnAtValidation");
  }

  return null;
};

export const runUpdateCategoryErrorEffects = ({
  mutationError,
  t,
  setFieldError,
  setFieldTouched,
  setWarnAtFieldError,
  setTopLevelError,
}: {
  mutationError: unknown;
  t: (key: string) => string;
  setFieldError: (field: "name" | "monthlyLimit", value: string) => void;
  setFieldTouched: (field: "name" | "monthlyLimit", touched?: boolean, shouldValidate?: boolean) => unknown;
  setWarnAtFieldError: (value: string | null) => void;
  setTopLevelError: (value: string | null) => void;
}) => {
  if (!isUpdateCategoryError(mutationError)) {
    setTopLevelError(t("atelierEditCategoryRecoverable"));
    return;
  }

  const presentation = mapUpdateCategoryErrorToPresentation(mutationError, t);

  if (presentation.nameError) {
    setFieldError("name", presentation.nameError);
    setFieldTouched("name", true, false);
  }

  if (presentation.monthlyLimitError) {
    setFieldError("monthlyLimit", presentation.monthlyLimitError);
    setFieldTouched("monthlyLimit", true, false);
  }

  setWarnAtFieldError(presentation.warnAtError);
  setTopLevelError(presentation.topLevelError);
};

export const shouldDismissModalOnKey = (key: string) => key === "Escape";

export const dismissEditModalFromBackdrop = (closeModal: () => void) => {
  closeModal();
};

export const runDismissEditModalEffects = ({
  close,
  resetForm,
  clearTopLevelError,
  clearWarnAtFieldError,
  resetLocalState,
}: {
  close: () => void;
  resetForm: () => void;
  clearTopLevelError: () => void;
  clearWarnAtFieldError: () => void;
  resetLocalState: () => void;
}) => {
  clearTopLevelError();
  clearWarnAtFieldError();
  resetForm();
  resetLocalState();
  close();
};

export const runUpdateCategorySuccessEffects = async ({
  notifySuccess,
  invalidateAtelier,
  refresh,
  close,
}: {
  notifySuccess: () => void;
  invalidateAtelier: () => Promise<unknown>;
  refresh: () => void;
  close: () => void;
}) => {
  notifySuccess();
  await invalidateAtelier();
  refresh();
  close();
};

const localStateFromCategory = (category: EditCategoryModalProps["category"]) => ({
  keepNextMonth: category?.carryNextMonth ?? true,
  warningEnabled: category?.warningEnabled ?? true,
  warnAt: String(category?.warnAt ?? 80),
  selectedIcon: ((category?.icon as (typeof iconChoices)[number]) || iconChoices[0]) as (typeof iconChoices)[number],
});

export default function EditCategoryModal({
  category,
  currency,
  language,
  activeMonth,
  isOpen,
  onClose,
}: EditCategoryModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useNamespacedTranslation("atelier", language);

  const [error, setError] = useState<string | null>(null);
  const [warnAtFieldError, setWarnAtFieldError] = useState<string | null>(null);
  const [keepNextMonth, setKeepNextMonth] = useState(category?.carryNextMonth ?? true);
  const [warningEnabled, setWarningEnabled] = useState(category?.warningEnabled ?? true);
  const [warnAt, setWarnAt] = useState(String(category?.warnAt ?? 80));
  const [selectedIcon, setSelectedIcon] = useState<(typeof iconChoices)[number]>(
    (category?.icon as (typeof iconChoices)[number]) || iconChoices[0],
  );

  const currencyHint = useMemo(() => {
    if (currency === "VND") {
      return t("atelierCurrencyHintVnd");
    }
    return t("atelierCurrencyHintTemplate").replace("{currency}", currency);
  }, [currency, t]);

  const formik = useFormik<EditCategoryFormValues>({
    initialValues: {
      name: category?.name ?? "",
      monthlyLimit: formatCurrencyInput(String(category?.limit ?? 0), currency),
    },
    enableReinitialize: true,
    validate: (values) => {
      const fieldErrors: { name?: string; monthlyLimit?: string } = {};
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
        if (!Number.isFinite(monthlyLimit) || monthlyLimit <= 0) {
          fieldErrors.monthlyLimit = t("atelierMonthlyLimitPositive");
        }
      }

      return fieldErrors;
    },
    onSubmit: async (values) => {
      if (!category) {
        return;
      }

      const warnAtError = validateWarnAtForUpdate(warningEnabled, warnAt, t);
      if (warnAtError) {
        setWarnAtFieldError(warnAtError);
        return;
      }

      setWarnAtFieldError(null);
      setError(null);

      const payload: UpdateCategoryPayload = {
        name: values.name.trim(),
        icon: selectedIcon,
        monthlyLimit: parseCurrencyInput(values.monthlyLimit),
        warningEnabled,
        warnAt: Number(warnAt || 80),
        keepLimitNextMonth: keepNextMonth,
      };

      updateCategoryMutation.mutate(payload);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (payload: UpdateCategoryPayload) => {
      if (!category) {
        throw new Error(t("atelierEditCategoryFailed"));
      }

      return updateCategoryWithParsedError(category.id, payload, t("atelierEditCategoryFailed"), {
        month: activeMonth,
      });
    },
    onSuccess: async () => {
      await runUpdateCategorySuccessEffects({
        notifySuccess: () => toast.success(t("atelierEditCategorySuccess")),
        invalidateAtelier: () => queryClient.invalidateQueries({ queryKey: ["atelier"] }),
        refresh: router.refresh,
        close: onClose,
      });
    },
    onError: (mutationError: unknown) => {
      runUpdateCategoryErrorEffects({
        mutationError,
        t,
        setFieldError: formik.setFieldError,
        setFieldTouched: formik.setFieldTouched,
        setWarnAtFieldError,
        setTopLevelError: setError,
      });
    },
  });

  const closeModal = useCallback(() => {
    const nextLocalState = localStateFromCategory(category);

    runDismissEditModalEffects({
      close: onClose,
      resetForm: formik.resetForm,
      clearTopLevelError: () => setError(null),
      clearWarnAtFieldError: () => setWarnAtFieldError(null),
      resetLocalState: () => {
        setKeepNextMonth(nextLocalState.keepNextMonth);
        setWarningEnabled(nextLocalState.warningEnabled);
        setWarnAt(nextLocalState.warnAt);
        setSelectedIcon(nextLocalState.selectedIcon);
      },
    });
  }, [category, formik.resetForm, onClose]);

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
  }, [closeModal, isOpen]);

  if (!isOpen || !category) {
    return null;
  }

  const modalBody = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color:rgba(27,54,65,var(--opacity-ghost-border))] p-[var(--spacing-4)] backdrop-blur-[var(--blur-glass)]"
      onMouseDown={() => dismissEditModalFromBackdrop(closeModal)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[var(--card-radius)] border border-[color:rgba(155,182,196,var(--opacity-ghost-border))] bg-[color:rgba(255,255,255,var(--opacity-glass))] shadow-[var(--shadow-ambient)]"
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
                aria-label={t("atelierActionCancel")}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <h2 className="font-[var(--font-display)] text-[length:var(--font-headline-md)] font-extrabold text-[var(--color-on-surface)]">
              {t("atelierUpdateCategory")}
            </h2>
            <p className="mt-[var(--spacing-2)] text-[length:var(--font-label-md)] text-[var(--color-on-surface)]">
              {t("atelierEditCategorySubtitle")}
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-[var(--spacing-6)]">
            <div className="space-y-[var(--spacing-2)]">
              <label className="block text-[length:var(--font-label-sm)] font-bold text-[var(--color-on-surface)]">
                {t("atelierCategoryNameLabel")} <span className="text-[var(--color-error)]">(*)</span>
              </label>
              <input
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder={t("atelierCategoryNamePlaceholder")}
                className="w-full rounded-[var(--input-radius)] bg-[var(--input-bg)] px-[var(--spacing-4)] py-[var(--spacing-4)] text-[length:var(--font-body-md)] text-[var(--color-on-surface)] outline-none ring-2 ring-transparent transition focus:[--tw-ring-color:var(--input-focus-border)]"
              />
              {formik.touched.name && formik.errors.name ? (
                <p className="text-[length:var(--font-label-sm)] text-[var(--color-error)]">{formik.errors.name}</p>
              ) : null}
            </div>

            <div className="space-y-[var(--spacing-2)]">
              <label className="block text-[length:var(--font-label-sm)] font-bold text-[var(--color-on-surface)]">
                {t("atelierIconography")} <span className="text-[var(--color-error)]">(*)</span>
              </label>
              <div className="rounded-[var(--radius-xl)] bg-[color:rgba(231,246,255,0.5)] p-[var(--spacing-4)]">
                <div className="grid grid-cols-5 gap-[var(--spacing-2)]">
                  {iconChoices.map((icon) => {
                    const selected = selectedIcon === icon;
                    return (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSelectedIcon(icon)}
                        className={`aspect-square rounded-[var(--radius-md)] transition hover:scale-105 active:scale-95 ${
                          selected
                            ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                            : "bg-[color:rgba(255,255,255,var(--opacity-glass))] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-lowest)]"
                        }`}
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
              <input
                name="monthlyLimit"
                value={formik.values.monthlyLimit}
                onChange={(event) => {
                  formik.setFieldValue("monthlyLimit", formatCurrencyInput(event.target.value, currency));
                }}
                onBlur={formik.handleBlur}
                className="w-full rounded-[var(--input-radius)] bg-[var(--input-bg)] px-[var(--spacing-4)] py-[var(--spacing-4)] text-[length:var(--font-body-md)] font-bold text-[var(--color-on-surface)] outline-none ring-2 ring-transparent transition focus:[--tw-ring-color:var(--input-focus-border)]"
              />
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

            <div className="space-y-[var(--spacing-3)] rounded-[var(--radius-xl)] bg-[color:rgba(231,246,255,0.5)] p-[var(--spacing-4)]">
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
                <div className="h-[var(--spacing-1)] flex-1 rounded-full bg-[var(--color-surface-container-highest)]">
                  <div
                    className="h-[var(--spacing-1)] rounded-full bg-[var(--color-primary)]"
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
                disabled={updateCategoryMutation.isPending}
                className="flex-1 rounded-[var(--btn-radius)] bg-[image:var(--gradient-primary)] px-[var(--btn-padding-x)] py-[var(--btn-padding-y)] font-[var(--font-display)] text-[length:var(--font-label-md)] font-bold text-[var(--color-on-primary)] shadow-[var(--shadow-ambient)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-[var(--opacity-glass)]"
              >
                {updateCategoryMutation.isPending ? t("atelierActionSaving") : t("atelierUpdateCategory")}
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
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return modalBody;
  }

  return createPortal(modalBody, document.body);
}
