"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNamespacedTranslation } from "@/features/i18n/useNamespacedTranslation";
import { formatCurrency } from "@/lib/format";
import {
  deleteCategoryWithParsedError,
  type DeleteCategoryError,
  type DeleteCategorySuccess,
} from "@/features/atelier/services";
import type { DeleteCategoryDialogProps } from "@/features/atelier/types";

type DeleteErrorPresentation = {
  topLevelError: string;
};

type DeleteSuccessContractPresentation = {
  deletedCategoryId: string;
  reassignedToCategoryId: string;
};

export const shouldDismissDeleteModalOnKey = (key: string) => key === "Escape";

export const shouldDismissDeleteModal = (isPending: boolean) => !isPending;

export const shouldSubmitDeleteAgain = (isPending: boolean) => !isPending;

export const dismissDeleteModalFromBackdrop = (close: () => void) => {
  close();
};

export const mapDeleteCategoryErrorToPresentation = (
  error: DeleteCategoryError,
  t: (key: string) => string,
): DeleteErrorPresentation => {
  if (error.status === 500) {
    return { topLevelError: t("atelierDeleteFailed") };
  }

  if (error.status === 400 && error.fieldErrors.id) {
    return { topLevelError: error.fieldErrors.id };
  }

  if (error.status === 404) {
    return { topLevelError: error.message || t("atelierDeleteFailed") };
  }

  return { topLevelError: error.message || t("atelierDeleteFailed") };
};

export const mapDeleteCategorySuccessContract = (
  payload: DeleteCategorySuccess,
): DeleteSuccessContractPresentation | null => {
  if (!payload.ok || !payload.deletedCategoryId || !payload.reassignedToCategoryId) {
    return null;
  }

  return {
    deletedCategoryId: payload.deletedCategoryId,
    reassignedToCategoryId: payload.reassignedToCategoryId,
  };
};

type RunDeleteCategorySuccessEffectsOptions = {
  notifySuccess: () => void;
  close: () => void;
  invalidateAtelier: () => Promise<unknown>;
  refresh: () => void;
};

export const runDeleteCategorySuccessEffects = async ({
  notifySuccess,
  close,
  invalidateAtelier,
  refresh,
}: RunDeleteCategorySuccessEffectsOptions) => {
  notifySuccess();
  close();
  await invalidateAtelier();
  refresh();
};

export default function DeleteCategoryDialog({ category, currency, language }: DeleteCategoryDialogProps) {
  const router = useRouter();
  const t = useNamespacedTranslation("atelier", language);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const close = () => {
    setOpen(false);
    setError(null);
  };

  const deleteCategoryMutation = useMutation<DeleteCategorySuccess, DeleteCategoryError>({
    mutationFn: async () => deleteCategoryWithParsedError(category.id, t("atelierDeleteFailed")),
    onSuccess: async (payload) => {
      const mappedContract = mapDeleteCategorySuccessContract(payload);
      if (!mappedContract || mappedContract.deletedCategoryId !== category.id) {
        setError(t("atelierDeleteFailed"));
        return;
      }

      await runDeleteCategorySuccessEffects({
        notifySuccess: () => toast.success(t("atelierDeleteSuccess")),
        close,
        invalidateAtelier: () => queryClient.invalidateQueries({ queryKey: ["atelier"] }),
        refresh: router.refresh,
      });
    },
    onError: (mutationError) => {
      const presentation = mapDeleteCategoryErrorToPresentation(mutationError, t);
      setError(presentation.topLevelError);
      toast.error(presentation.topLevelError);
    },
  });

  useEffect(() => {
    if (!open || deleteCategoryMutation.isPending) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (shouldDismissDeleteModalOnKey(event.key)) {
        close();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteCategoryMutation.isPending, open]);

  return (
    <>
      <button
        type="button"
        aria-label={t("atelierDeleteAriaTemplate").replace("{name}", category.name)}
        onClick={() => {
          setOpen(true);
          setError(null);
        }}
        className="grid h-10 w-10 place-items-center rounded-full bg-[var(--color-surface-container-low)] text-[var(--color-error)] transition hover:bg-[var(--color-surface-container-highest)]"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[color:rgba(27,54,65,var(--opacity-ghost-border))] p-[var(--spacing-4)] backdrop-blur-[var(--blur-glass)]"
          onMouseDown={() => {
            if (shouldDismissDeleteModal(deleteCategoryMutation.isPending)) {
              dismissDeleteModalFromBackdrop(close);
            }
          }}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-[var(--card-radius)] bg-[var(--card-bg)] shadow-[var(--shadow-ambient)]"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("atelierDeleteTitleTemplate").replace("{name}", category.name)}
          >
            <div className="h-[var(--spacing-1)] bg-[var(--color-error)]" />

            <div className="space-y-[var(--spacing-8)] p-[var(--spacing-8)]">
              <div className="space-y-[var(--spacing-4)]">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={close}
                    disabled={deleteCategoryMutation.isPending}
                    className="grid h-10 w-10 place-items-center rounded-full text-[var(--color-on-surface-variant)] transition hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-on-surface)] disabled:opacity-[var(--opacity-glass)]"
                    aria-label={t("atelierActionCancel")}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="mb-[var(--spacing-6)] flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-container-low)]">
                  <span className="material-symbols-outlined scale-125 text-[var(--color-error)]" aria-hidden="true">
                    warning
                  </span>
                </div>

                <h2 className="font-[var(--font-display)] text-[var(--font-headline-md)] font-extrabold leading-tight tracking-tight text-[var(--color-on-surface)]">
                  {t("atelierDeleteTitleTemplate").replace("{name}", category.name)}
                </h2>
              </div>

              <div className="space-y-[var(--spacing-4)]">
                <p className="text-[var(--font-body-md)] leading-relaxed text-[var(--color-on-surface-variant)]">
                  {t("atelierDeleteBodyLine1")}
                </p>
                <p className="text-[var(--font-body-md)] leading-relaxed text-[var(--color-on-surface-variant)]">
                  {t("atelierDeleteBodyLine2")}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-[var(--card-radius)] bg-[var(--color-surface-container-low)] p-[var(--spacing-4)]">
                <div className="flex items-center gap-[var(--spacing-3)]">
                  <span className="material-symbols-outlined text-[var(--color-on-surface-variant)]">history</span>
                  <span className="text-[var(--font-label-md)] font-semibold text-[var(--color-on-surface-variant)]">{t("atelierAccumulatedValue")}</span>
                </div>
                <span className="font-[var(--font-display)] font-bold text-[var(--color-on-surface)]">
                  {formatCurrency(category.spent, currency)}
                </span>
              </div>

              {error ? (
                <p className="rounded-[var(--card-radius)] bg-[var(--color-surface-container-low)] px-[var(--spacing-4)] py-[var(--spacing-3)] text-[var(--font-label-sm)] text-[var(--color-error)]">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col gap-[var(--spacing-3)] pt-[var(--spacing-2)]">
                <button
                  type="button"
                  onClick={() => {
                    if (!shouldSubmitDeleteAgain(deleteCategoryMutation.isPending)) {
                      return;
                    }

                    setError(null);
                    deleteCategoryMutation.mutate();
                  }}
                  disabled={deleteCategoryMutation.isPending}
                  className="w-full rounded-[var(--btn-radius)] bg-[var(--color-error)] py-[var(--spacing-3)] font-[var(--font-display)] text-[18px] font-extrabold text-[var(--color-on-primary)] shadow-[var(--shadow-ambient)] transition hover:brightness-110 disabled:opacity-[var(--opacity-glass)]"
                >
                  {deleteCategoryMutation.isPending ? t("atelierDeleteCategoryDeleting") : t("atelierDeleteCategoryAction")}
                </button>
                <button
                  type="button"
                  onClick={close}
                  disabled={deleteCategoryMutation.isPending}
                  className="w-full rounded-[var(--btn-radius)] bg-transparent py-[var(--spacing-3)] font-[var(--font-display)] text-[18px] font-bold text-[var(--color-on-surface-variant)] transition hover:bg-[var(--color-surface-container-highest)] disabled:opacity-[var(--opacity-glass)]"
                >
                  {t("atelierKeepCategory")}
                </button>
              </div>
            </div>

            <div className="flex justify-center bg-[var(--color-surface-container-low)] px-[var(--spacing-8)] py-[var(--spacing-4)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">{t("atelierSecurityProtocol")}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
