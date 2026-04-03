"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNamespacedTranslation } from "@/features/i18n/useNamespacedTranslation";
import { formatCurrency } from "@/lib/format";
import type { DeleteCategoryDialogProps } from "@/features/atelier/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
export default function DeleteCategoryDialog({ category, currency, language }: DeleteCategoryDialogProps) {
  const router = useRouter();
  const t = useNamespacedTranslation("atelier", language);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteCategoryMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t("atelier.atelierDeleteFailed"));
      }
    },
    onSuccess: async () => {
      toast.success(t("atelier.atelierDeleteSuccess"));
      close();
      await queryClient.invalidateQueries({ queryKey: ["atelier"] });
      router.refresh();
    },
    onError: (mutationError: unknown) => {
      setError(mutationError instanceof Error ? mutationError.message : t("atelier.atelierDeleteFailed"));
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setError(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    setError(null);
  };

  const onDelete = async () => {
    setError(null);
    deleteCategoryMutation.mutate();
  };

  return (
    <>
        <button
          type="button"
          aria-label={t("atelier.atelierDeleteAriaTemplate").replace("{name}", category.name)}
          onClick={() => {
            setOpen(true);
            setError(null);
        }}
        className="rounded-full bg-[#fff1ed] p-2 text-[#a73b21] transition hover:bg-[#ffdcd2]"
      >
        <span className="material-symbols-outlined text-base">delete</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[#1b3641]/40 p-6 backdrop-blur-md"
          onMouseDown={close}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-[0_24px_64px_rgba(27,54,65,0.2)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="h-2 bg-[#a73b21]" />

            <div className="space-y-8 p-10">
              <div className="space-y-4">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#fd795a]/20">
                  <span
                    className="material-symbols-outlined scale-125 text-[#a73b21]"
                    style={{ fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24' }}
                  >
                    warning
                  </span>
                </div>

                <h2 className="font-[var(--font-manrope)] text-3xl font-extrabold leading-tight tracking-tight text-[#1b3641]">
                  {t("atelier.atelierDeleteTitleTemplate").replace("{name}", category.name)}
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-[#49636f]">{t("atelier.atelierDeleteBodyLine1")}</p>
                <p className="text-sm leading-relaxed text-[#49636f]">{t("atelier.atelierDeleteBodyLine2")}</p>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#e7f6ff] p-5">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#49636f]">history</span>
                  <span className="text-sm font-semibold text-[#49636f]">{t("atelier.atelierAccumulatedValue")}</span>
                </div>
                <span className="font-[var(--font-manrope)] font-bold text-[#1b3641]">
                  {formatCurrency(category.spent, currency)}
                </span>
              </div>

              {error ? (
                <p className="mb-3 rounded-xl border border-[#f8cfc4] bg-[#fff3ef] px-4 py-2 text-xs text-[#a73b21]">{error}</p>
              ) : null}

              <div className="flex flex-col gap-3 pt-4">
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={deleteCategoryMutation.isPending}
                  className="w-full rounded-xl bg-[#a73b21] py-4 text-lg font-extrabold text-[#fff7f6] shadow-[0_4px_12px_rgba(167,59,33,0.3)] transition hover:brightness-110 disabled:opacity-70"
                >
                  {deleteCategoryMutation.isPending ? t("atelier.atelierDeleteCategoryDeleting") : t("atelier.atelierDeleteCategoryAction")}
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="w-full rounded-xl bg-transparent py-4 text-lg font-bold text-[#49636f] transition hover:bg-[#d4ecf9]"
                >
                  {t("atelier.atelierKeepCategory")}
                </button>
              </div>
            </div>

            <div className="flex justify-center border-t border-[#9bb6c4]/20 bg-[#e7f6ff] px-10 py-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#647e8c]">{t("atelier.atelierSecurityProtocol")}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
