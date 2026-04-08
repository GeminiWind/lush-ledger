"use client";

import Link from "next/link";
import { useState } from "react";
import { monthKey, startOfMonthDate } from "@/lib/date";
import { formatCurrency } from "@/lib/format";
import { useNamespacedTranslation } from "@/features/i18n/useNamespacedTranslation";
import type {
  MonthlyPrioritySetting,
  SavingsRemainderAllocationEligibilitySummary,
} from "@/lib/savings-remainder-allocation";

const toNumber = (value: unknown) => Number(value ?? 0);
const monthKeyOf = (value: Date) => monthKey(startOfMonthDate(value));

type Props = {
  language: string;
  currency: string;
  monthStart: Date;
  isRemainderAllocationVisible: boolean;
  savingsPlans: Array<{
    id: string;
    name: string;
    status: string;
    monthlyContribution: unknown;
  }>;
  monthlyPrioritySettings: MonthlyPrioritySetting[];
  remainderAllocationSummary: SavingsRemainderAllocationEligibilitySummary;
};

export default function MonthlySavingsPlanCard({
  language,
  currency,
  monthStart,
  isRemainderAllocationVisible,
  savingsPlans,
  monthlyPrioritySettings,
  remainderAllocationSummary,
}: Props) {
  const t = useNamespacedTranslation("atelier", language);

  const savingsByPlan = savingsPlans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    target: toNumber(plan.monthlyContribution),
  }));

  const [currentMonthSettings, setCurrentMonthSettings] = useState<MonthlyPrioritySetting[]>(
    monthlyPrioritySettings,
  );
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [draftPercent, setDraftPercent] = useState<string>("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);

  const savingsByPlanId = new Map(savingsByPlan.map((plan) => [plan.id, plan]));
  const settingRows = currentMonthSettings
    .map((setting) => {
      const plan = savingsByPlanId.get(setting.savingsPlanId);
      if (!plan) {
        return null;
      }
      return {
        ...plan,
        savingsPlanId: setting.savingsPlanId,
        percent: setting.priorityPercent,
      };
    })
    .filter((item): item is { id: string; name: string; target: number; savingsPlanId: string; percent: number } => Boolean(item))
    .sort((a, b) => b.percent - a.percent || b.target - a.target);

  const configuredPlanIds = new Set(currentMonthSettings.map((item) => item.savingsPlanId));
  const eligiblePlans = savingsPlans.filter((plan) => plan.status === "active" || plan.status === "funded");

  const getPlanStatusLabel = (status: string) => {
    if (status === "funded") {
      return t("savingsPlanStatusFunded");
    }

    return t("savingsPlanStatusActive");
  };

  const getAllocationSourceLabel = (source: string | null | undefined) => {
    if (source === "replay") {
      return t("atelierAllocationSourceReplay");
    }
    if (source === "cron") {
      return t("atelierAllocationSourceCron");
    }

    return null;
  };

  const formatAllocationTraceLine = (transactionId: string, source: string | null | undefined) => {
    const sourceLabel = getAllocationSourceLabel(source);
    const sourceSuffix = sourceLabel ? ` • ${sourceLabel}` : "";
    return `${t("atelierAllocationTraceLabel")} ${transactionId}${sourceSuffix}`;
  };

  const normalizeSettings = (settings: MonthlyPrioritySetting[]) => {
    const cleaned = settings.filter((item) => Number.isFinite(item.priorityPercent) && item.priorityPercent > 0);
    const total = cleaned.reduce((sum, item) => sum + item.priorityPercent, 0);
    if (total <= 0) {
      return [];
    }
    return cleaned.map((item) => ({
      savingsPlanId: item.savingsPlanId,
      priorityPercent: Number(((item.priorityPercent / total) * 100).toFixed(4)),
    }));
  };

  const persistSettings = async (nextSettings: MonthlyPrioritySetting[]) => {
    setIsSavingSettings(true);
    const normalized = normalizeSettings(nextSettings);

    try {
      const response = await fetch("/api/savings/remainder-allocation/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: monthKeyOf(monthStart),
          settings: normalized,
        }),
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const persisted = Array.isArray(data?.settings) ? (data.settings as MonthlyPrioritySetting[]) : normalized;
      setCurrentMonthSettings(persisted);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const updateSettingPercent = async (planId: string) => {
    const current = currentMonthSettings.find((item) => item.savingsPlanId === planId);
    if (!current) {
      return;
    }

    const nextPercent = Number(draftPercent);
    if (!Number.isFinite(nextPercent) || nextPercent < 0) {
      return;
    }

    const others = currentMonthSettings.filter((item) => item.savingsPlanId !== planId);
    const otherTotal = others.reduce((sum, item) => sum + item.priorityPercent, 0);
    const remaining = Math.max(100 - nextPercent, 0);
    const normalizedOthers =
      others.length === 0
        ? []
        : others.map((item) => ({
            ...item,
            priorityPercent:
              otherTotal > 0 ? (item.priorityPercent / otherTotal) * remaining : remaining / others.length,
          }));

    await persistSettings([{ ...current, priorityPercent: nextPercent }, ...normalizedOthers]);
    setEditingPlanId(null);
    setDraftPercent("");
  };

  const removeSettingPlan = async (planId: string) => {
    const remainingPlans = currentMonthSettings.filter((item) => item.savingsPlanId !== planId);
    await persistSettings(remainingPlans);
  };

  const addPlanToSettings = async (planId: string) => {
    const existing = currentMonthSettings;
    if (existing.some((item) => item.savingsPlanId === planId)) {
      return;
    }
    const hasAny = existing.length > 0;
    const nextSettings = hasAny
      ? [
          ...existing.map((item) => ({
            ...item,
            priorityPercent: item.priorityPercent * 0.9,
          })),
          { savingsPlanId: planId, priorityPercent: 10 },
        ]
      : [{ savingsPlanId: planId, priorityPercent: 100 }];

    await persistSettings(nextSettings);
    setIsAddPlanOpen(false);
  };

  const savingsPlanNameById = new Map(savingsPlans.map((plan) => [plan.id, plan.name]));
  const latestRun = remainderAllocationSummary.latestRun;
  const latestRunEntries = latestRun?.entries ?? [];

  return (
    <article className="rounded-[2rem] bg-white p-8 shadow-[0_24px_48px_-12px_rgba(27,54,65,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-[var(--font-manrope)] text-xl font-bold">{t("atelierMonthlySavingsPlan")}</h2>
          <p className="text-xs text-[#49636f]">{t("atelierAutomaticVaultAllocation")}</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            savings
          </span>
        </div>
      </div>

      <div className="mt-7 space-y-5">
        {!isRemainderAllocationVisible ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            {t("atelierAllocationUnavailable")}
          </p>
        ) : null}

        <div className="border-b border-[#dce8ef] pb-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f8793]">
              {t("atelierAutoTransferStatus")}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                isRemainderAllocationVisible ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-500"
              }`}
            >
              {isRemainderAllocationVisible ? t("atelierOn") : t("atelierOff")}
            </span>
          </div>
          <p className="text-[11px] italic leading-relaxed text-[#6f8793]">{t("atelierAutoTransferDescription")}</p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8aa2b0]">{t("atelierAllocationBreakdown")}</p>
          {settingRows.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-[#6f8793]">{t("atelierNoSavingsPlansYet")}</p>
              <button
                type="button"
                onClick={() => setIsAddPlanOpen((prev) => !prev)}
                disabled={isSavingSettings}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#2e7d32] transition-opacity hover:opacity-80"
              >
                <span className="material-symbols-outlined rounded-full bg-emerald-50 p-1 text-[16px]">add</span>
                {t("atelierAddSavingPlan")}
              </button>
              {isAddPlanOpen ? (
                <div className="space-y-2 rounded-xl border border-[#dce8ef] bg-white p-3">
                  <p className="text-xs font-semibold text-[#49636f]">{t("atelierSelectSavingPlanToAdd")}</p>
                  {eligiblePlans.length === 0 ? (
                    <p className="text-xs text-[#8aa2b0]">{t("atelierNoEligiblePlanToAdd")}</p>
                  ) : (
                    <ul className="space-y-2">
                      {eligiblePlans.map((plan) => {
                        const alreadyAdded = configuredPlanIds.has(plan.id);
                        return (
                        <li key={plan.id}>
                          <button
                            type="button"
                            onClick={() => void addPlanToSettings(plan.id)}
                            disabled={alreadyAdded}
                            className="w-full rounded-lg border border-[#dce8ef] px-3 py-2 text-left text-sm text-[#1b3641] transition hover:border-[#9ed2ab] hover:bg-[#f3fbf6] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span>{plan.name}</span>
                            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f8793]">
                              {getPlanStatusLabel(plan.status)}
                            </span>
                            {alreadyAdded ? (
                              <span className="ml-2 text-xs font-semibold text-[#6f8793]">{t("atelierPlanAlreadyAdded")}</span>
                            ) : null}
                          </button>
                        </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <ul className="space-y-3">
              {settingRows.slice(0, 4).map((plan) => (
                <li key={plan.savingsPlanId} className="flex items-center justify-between text-sm">
                  <span className="text-[#49636f]">{plan.name}</span>
                  <div className="flex items-center gap-2" title={formatCurrency(plan.target, currency)}>
                    {editingPlanId === plan.savingsPlanId ? (
                      <>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={draftPercent}
                          onChange={(event) => setDraftPercent(event.target.value)}
                          className="w-16 rounded-md border border-[#c7dce9] px-2 py-1 text-right text-xs font-bold text-[#1b3641]"
                        />
                        <span className="text-xs font-bold text-[#1b3641]">%</span>
                        <button
                          type="button"
                          className="text-[#8aa2b0] transition-colors hover:text-[#2e7d32]"
                          onClick={() => void updateSettingPercent(plan.savingsPlanId)}
                          disabled={isSavingSettings}
                        >
                          <span className="material-symbols-outlined text-[15px]">check</span>
                        </button>
                        <button
                          type="button"
                          className="text-[#8aa2b0] transition-colors hover:text-[#49636f]"
                          onClick={() => {
                            setEditingPlanId(null);
                            setDraftPercent("");
                          }}
                          disabled={isSavingSettings}
                        >
                          <span className="material-symbols-outlined text-[15px]">close</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-[#1b3641]">{Math.round(plan.percent)}%</span>
                        <button
                          type="button"
                          aria-label={t("atelierEditSavingPlanAriaTemplate").replace("{name}", plan.name)}
                          className="text-[#8aa2b0] transition-colors hover:text-[#2e7d32]"
                          onClick={() => {
                            setEditingPlanId(plan.savingsPlanId);
                            setDraftPercent(String(Math.round(plan.percent)));
                          }}
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      aria-label={t("atelierDeleteSavingPlanAriaTemplate").replace("{name}", plan.name)}
                      className="text-[#8aa2b0] transition-colors hover:text-[#a73b21]"
                      onClick={() => void removeSettingPlan(plan.savingsPlanId)}
                      disabled={isSavingSettings}
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                  </div>
                </li>
              ))}
              <li className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPlanOpen((prev) => !prev)}
                  disabled={isSavingSettings}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#2e7d32] transition-opacity hover:opacity-80"
                >
                  <span className="material-symbols-outlined rounded-full bg-emerald-50 p-1 text-[16px]">add</span>
                  {t("atelierAddSavingPlan")}
                </button>
                {isAddPlanOpen ? (
                  <div className="mt-2 space-y-2 rounded-xl border border-[#dce8ef] bg-white p-3">
                    <p className="text-xs font-semibold text-[#49636f]">{t("atelierSelectSavingPlanToAdd")}</p>
                    {eligiblePlans.length === 0 ? (
                      <p className="text-xs text-[#8aa2b0]">{t("atelierNoEligiblePlanToAdd")}</p>
                    ) : (
                      <ul className="space-y-2">
                        {eligiblePlans.map((plan) => {
                          const alreadyAdded = configuredPlanIds.has(plan.id);
                          return (
                          <li key={plan.id}>
                            <button
                              type="button"
                              onClick={() => void addPlanToSettings(plan.id)}
                              disabled={alreadyAdded}
                              className="w-full rounded-lg border border-[#dce8ef] px-3 py-2 text-left text-sm text-[#1b3641] transition hover:border-[#9ed2ab] hover:bg-[#f3fbf6] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <span>{plan.name}</span>
                              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f8793]">
                                {getPlanStatusLabel(plan.status)}
                              </span>
                              {alreadyAdded ? (
                                <span className="ml-2 text-xs font-semibold text-[#6f8793]">{t("atelierPlanAlreadyAdded")}</span>
                              ) : null}
                            </button>
                          </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : null}
              </li>
            </ul>
          )}

          {settingRows.length === 0 ? (
            <Link href="/app/savings" className="inline-flex text-xs font-semibold text-[#2e7d32] underline-offset-2 hover:underline">
              {t("atelierOpenSavingsForMorePlans")}
            </Link>
          ) : null}
          <p className="text-[10px] leading-relaxed text-[#6f8793]">{t("atelierAllocationDynamicHint")}</p>
        </div>

        {isRemainderAllocationVisible ? (
          <div className="space-y-3 rounded-2xl border border-[#d8eaf5] bg-[#f4faff] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f8793]">
                {t("atelierAllocationSummaryTitle")}
              </p>
              {latestRun ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                  {latestRun.month}
                </span>
              ) : null}
            </div>

            {latestRun ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8aa2b0]">
                      {t("atelierAllocationTransferred")}
                    </p>
                    <p className="font-[var(--font-manrope)] text-lg font-bold text-[#1b3641]">
                      {formatCurrency(latestRun.totalTransferred, currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8aa2b0]">
                      {t("atelierAllocationUnallocated")}
                    </p>
                    <p className="font-[var(--font-manrope)] text-lg font-bold text-[#49636f]">
                      {formatCurrency(latestRun.unallocatedRemainder, currency)}
                    </p>
                  </div>
                </div>

                {latestRunEntries.length > 0 ? (
                  <ul className="space-y-2">
                    {latestRunEntries.slice(0, 3).map((entry) => (
                      <li key={`${entry.savingsPlanId}-${entry.transactionId ?? "none"}`} className="flex items-center justify-between text-xs">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#1b3641]">
                            {savingsPlanNameById.get(entry.savingsPlanId) ?? entry.savingsPlanId}
                          </p>
                          {entry.transactionId ? (
                            <p className="text-[10px] text-[#6f8793]">
                              {formatAllocationTraceLine(entry.transactionId, entry.allocationTriggerSource)}
                            </p>
                          ) : null}
                        </div>
                        <span className="font-semibold text-[#2e7d32]">{formatCurrency(entry.appliedAmount, currency)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#6f8793]">{t("atelierAllocationNoEntries")}</p>
                )}

                {latestRun.unallocatedReason === "exceeds_eligible_need" ? (
                  <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    {t("atelierAllocationExcessRemainderMessage")} {formatCurrency(latestRun.unallocatedRemainder, currency)}.
                  </p>
                ) : null}

                {latestRun.status === "no_op_zero_remainder" ? (
                  <p className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-700">{t("atelierAllocationNoopZeroRemainder")}</p>
                ) : null}
              </>
            ) : (
              <p className="text-xs text-[#6f8793]">{t("atelierAllocationPendingMonthEnd")}</p>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}
