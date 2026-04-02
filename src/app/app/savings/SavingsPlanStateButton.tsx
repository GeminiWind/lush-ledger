"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getDictionary } from "@/lib/i18n";

type Props = {
  language: string;
  planId: string;
  planName: string;
  status: string;
};

const reasonOptionKeys = [
  "savingsPlanCancelReasonPriorities",
  "savingsPlanCancelReasonGoalElsewhere",
  "savingsPlanCancelReasonNeedLiquidity",
  "savingsPlanCancelReasonOther",
] as const;

export default function SavingsPlanStateButton({ language, planId, planName, status }: Props) {
  const t = getDictionary(language);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<(typeof reasonOptionKeys)[number]>(reasonOptionKeys[0]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const canCancel = status === "active" || status === "funded";
  const nextStatus = "cancelled";
  const reasonLabel = t[reason];

  const subtitle = useMemo(() => {
    return t.savingsPlanCancelDialogSubtitle.replace("{plan}", `\u201c${planName}\u201d`);
  }, [planName, t.savingsPlanCancelDialogSubtitle]);

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

  const updateStateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/savings/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          cancellationReason: reasonLabel,
          cancellationNote: additionalNotes.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t.savingsPlanStatusUpdateFailed);
      }
    },
    onSuccess: async () => {
      setOpen(false);
      setAdditionalNotes("");
      setReason(reasonOptionKeys[0]);
      setError(null);
      toast.success(t.savingsPlanStatusUpdateSuccess);
      await queryClient.invalidateQueries({ queryKey: ["savings"] });
      router.refresh();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : t.savingsPlanStatusUpdateFailed;
      setError(message);
      toast.error(message);
    },
  });

  if (!canCancel) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError(null);
        }}
        disabled={updateStateMutation.isPending}
        className="flex items-center justify-center rounded-xl bg-[#d4ecf9] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#49636f] transition-all hover:bg-[#f8cfc4] hover:text-[#a73b21] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {t.savingsPlanCancelAction}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b3641]/10 p-4 backdrop-blur-sm"
          onMouseDown={() => {
            setOpen(false);
            setError(null);
          }}
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-[#9bb6c4]/20 bg-white shadow-[0_32px_64px_rgba(27,54,65,0.12)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-[#fd795a]/40 to-[#a73b21]" />
            <div className="p-8">
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#fd795a]/10 text-[#a73b21]">
                  <span className="material-symbols-outlined text-3xl">cancel</span>
                </div>
                <h2 className="font-[var(--font-manrope)] text-2xl font-bold tracking-tight text-[#1b3641]">
                  {t.savingsPlanCancelDialogTitle}
                </h2>
                <p className="mt-2 text-sm text-[#49636f]">{subtitle}</p>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setError(null);
                  }}
                  className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-[#49636f] transition hover:bg-[#d4ecf9]"
                  aria-label={t.savingsPlanCloseAria}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-sm font-bold text-[#1b3641]">{t.savingsPlanCancelReasonLabel}</label>
                  <div className="grid grid-cols-1 gap-2">
                    {reasonOptionKeys.map((optionKey) => (
                      <label
                        key={optionKey}
                        className="group flex cursor-pointer items-center rounded-xl bg-[#e7f6ff] p-4 transition-all duration-200 hover:bg-[#d4ecf9]"
                      >
                        <input
                          type="radio"
                          name="cancel-reason"
                          checked={reason === optionKey}
                          onChange={() => setReason(optionKey)}
                          className="h-5 w-5 border-[#9bb6c4] bg-white text-[#a73b21] focus:ring-[#a73b21]"
                        />
                        <span className="ml-3 text-sm font-medium text-[#1b3641] transition-colors group-hover:text-[#49636f]">
                          {t[optionKey]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-bold text-[#1b3641]">{t.savingsPlanCancelNotesLabel}</label>
                  <textarea
                    value={additionalNotes}
                    onChange={(event) => setAdditionalNotes(event.target.value)}
                    placeholder={t.savingsPlanCancelNotesPlaceholder}
                    rows={3}
                    className="w-full rounded-xl bg-[#e7f6ff] p-4 text-sm text-[#1b3641] placeholder:text-[#49636f]/60 outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/20"
                  />
                </div>
              </div>

              <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#9bb6c4]/15 bg-[#e7f6ff]/60 p-4">
                <span className="material-symbols-outlined text-xl text-[#006f1d]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  info
                </span>
                <p className="text-xs font-medium leading-relaxed text-[#49636f]">
                  <span className="font-bold text-[#1b3641]">{t.savingsPlanCancelInfoTitle}:</span> {t.savingsPlanCancelInfoBody}
                </p>
              </div>

              {error ? <p className="mt-4 rounded-lg bg-[#fd795a]/15 px-4 py-3 text-sm text-[#791903]">{error}</p> : null}

              <div className="mt-10 flex flex-col gap-3 sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => updateStateMutation.mutate()}
                  disabled={updateStateMutation.isPending}
                  className="flex-1 rounded-xl bg-gradient-to-br from-[#a73b21] to-[#791903] px-6 py-3.5 font-[var(--font-manrope)] text-sm font-bold text-[#fff7f6] shadow-lg shadow-[#a73b21]/20 transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updateStateMutation.isPending ? t.savingsPlanCancelConfirming : t.savingsPlanCancelConfirm}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setError(null);
                  }}
                  className="flex-1 rounded-xl bg-[#d4ecf9] px-6 py-3.5 font-[var(--font-manrope)] text-sm font-bold text-[#1b3641] transition-all hover:bg-[#cbe7f6] active:scale-95"
                >
                  {t.savingsPlanCancelKeep}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
