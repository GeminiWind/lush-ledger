"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getDictionary } from "@/lib/i18n";

type SavingsFilter = "active" | "completed" | "archived" | "cancelled";

type Props = {
  language: string;
  currentFilter: SavingsFilter;
  requestedPlanId?: string;
};

export default function SavingsFilterDropdown({ language, currentFilter, requestedPlanId }: Props) {
  const t = getDictionary(language);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const options = useMemo(
    () => [
      { value: "active" as const, label: t.savingsFilterActivePlans },
      { value: "completed" as const, label: t.savingsFilterCompletedPlans },
      { value: "archived" as const, label: t.savingsFilterArchivedPlans },
      { value: "cancelled" as const, label: t.savingsFilterCancelledPlans },
    ],
    [
      t.savingsFilterActivePlans,
      t.savingsFilterArchivedPlans,
      t.savingsFilterCancelledPlans,
      t.savingsFilterCompletedPlans,
    ],
  );

  const selectedLabel = options.find((option) => option.value === currentFilter)?.label || t.savingsFilterActivePlans;

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const onMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [open]);

  const onChoose = (value: SavingsFilter) => {
    setOpen(false);

    if (value === "cancelled") {
      router.push("/app/savings/cancelled");
      return;
    }

    const queryPlan = requestedPlanId ? `&plan=${requestedPlanId}` : "";
    router.push(`/app/savings?filter=${value}${queryPlan}`);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-[#9bb6c4]/20 bg-[#e7f6ff] px-4 py-2 shadow-sm"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#49636f]">{t.savingsActivePlanLabel}</span>
        <span className="font-[var(--font-manrope)] text-sm font-bold text-[#1b3641]">{selectedLabel}</span>
        <span className="material-symbols-outlined text-[18px] text-[#49636f]">expand_more</span>
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-xl border border-[#9bb6c4]/20 bg-white p-2 shadow-2xl">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChoose(option.value)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-[#e7f6ff]"
            >
              <span className={option.value === currentFilter ? "font-bold text-[#1b3641]" : "text-[#49636f]"}>{option.label}</span>
              {option.value === currentFilter ? <span className="material-symbols-outlined text-[16px] text-[#006f1d]">check_circle</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
