"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNamespacedTranslation } from "@/features/i18n/useNamespacedTranslation";
import {
  useAutoTransferLatestRun,
  useAutoTransferRule,
  useUpdateAutoTransferRule,
} from "@/features/savings/hooks/use-auto-transfer";

type Props = {
  language: string;
  currency: string;
};

type AllocationRow = {
  savingsPlanId: string;
  percentage: string;
};

const toInt = (value: string) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
};

export default function AutoTransferSettings({ language }: Props) {
  const t = useNamespacedTranslation("atelier", language);
  const ruleQuery = useAutoTransferRule();
  const latestRunQuery = useAutoTransferLatestRun();
  const updateRuleMutation = useUpdateAutoTransferRule();

  const [draft, setDraft] = useState<{ enabled: boolean; allocations: AllocationRow[] } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditingAllocations, setIsEditingAllocations] = useState(false);

  const sourceEnabled = ruleQuery.data?.enabled || false;
  const sourceAllocations = useMemo(
    () =>
      ruleQuery.data?.allocations.length && ruleQuery.data.allocations.length > 0
        ? ruleQuery.data.allocations.map((item) => ({
            savingsPlanId: item.savingsPlanId,
            percentage: String(item.percentage),
          }))
        : [{ savingsPlanId: "", percentage: "" }],
    [ruleQuery.data],
  );

  const enabled = draft?.enabled ?? sourceEnabled;
  const allocations = draft?.allocations ?? sourceAllocations;
  const eligiblePlans = ruleQuery.data?.eligiblePlans || [];
  const latestRun = latestRunQuery.data;

  const setFromCurrent = (
    updater: (current: { enabled: boolean; allocations: AllocationRow[] }) => {
      enabled: boolean;
      allocations: AllocationRow[];
    },
  ) => {
    setDraft((prev) => {
      const base =
        prev || {
          enabled: sourceEnabled,
          allocations: sourceAllocations,
        };
      return updater(base);
    });
  };

  const allocationTotal = useMemo(
    () => allocations.reduce((sum, row) => sum + (Number.isFinite(toInt(row.percentage)) ? toInt(row.percentage) : 0), 0),
    [allocations],
  );

  const normalizedSourceAllocations = useMemo(
    () =>
      sourceAllocations.map((row) => ({
        savingsPlanId: row.savingsPlanId,
        percentage: Number(row.percentage || 0),
      })),
    [sourceAllocations],
  );

  const normalizedAllocations = useMemo(
    () =>
      allocations.map((row) => ({
        savingsPlanId: row.savingsPlanId,
        percentage: Number(row.percentage || 0),
      })),
    [allocations],
  );

  const hasAllocationChanges = useMemo(
    () => JSON.stringify(normalizedAllocations) !== JSON.stringify(normalizedSourceAllocations),
    [normalizedAllocations, normalizedSourceAllocations],
  );

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!enabled) {
      setErrors(nextErrors);
      return nextErrors;
    }

    const chosenPlanIds = new Set<string>();
    const nonEmptyRows = allocations.filter((row) => row.savingsPlanId || row.percentage);

    if (nonEmptyRows.length < 1) {
      nextErrors.allocations = t("atelierAutoTransferAtLeastOneAllocation");
    }

    allocations.forEach((row, index) => {
      if (!row.savingsPlanId) {
        nextErrors[`allocations.${index}.savingsPlanId`] = t("atelierAutoTransferPlanRequired");
      } else if (chosenPlanIds.has(row.savingsPlanId)) {
        nextErrors[`allocations.${index}.savingsPlanId`] = t("atelierAutoTransferPlanUnique");
      }
      chosenPlanIds.add(row.savingsPlanId);

      const percentage = toInt(row.percentage);
      if (!Number.isInteger(percentage) || percentage < 1 || percentage > 100) {
        nextErrors[`allocations.${index}.percentage`] = t("atelierAutoTransferPercentRange");
      }
    });

    if (allocationTotal < 1 || allocationTotal > 100) {
      nextErrors.allocationTotalPercentage = t("atelierAutoTransferTotalRange");
    }

    setErrors(nextErrors);
    return nextErrors;
  };

  const persistRule = (
    nextEnabled: boolean,
    nextAllocations: AllocationRow[],
    showToast = true,
    onSuccessCallback?: () => void,
  ) => {
    updateRuleMutation.mutate(
      {
        enabled: nextEnabled,
        allocations: nextAllocations
          .filter((row) => row.savingsPlanId && row.percentage)
          .map((row) => ({
            savingsPlanId: row.savingsPlanId,
            percentage: Number(row.percentage),
          })),
      },
      {
        onSuccess: () => {
          setDraft(null);
          onSuccessCallback?.();
          if (showToast) {
            toast.success(t("atelierAutoTransferSaveSuccess"));
          }
        },
        onError: (error: unknown) => {
          const message = error instanceof Error ? error.message : t("atelierAutoTransferSaveError");
          const fieldErrors = (error as Error & { errors?: Record<string, string> }).errors;
          if (fieldErrors) {
            setErrors(fieldErrors);
          }
          toast.error(message);
        },
      },
    );
  };

  const save = (onSuccess?: () => void) => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    persistRule(enabled, allocations, true, onSuccess);
  };

  return (
    <div className="flex flex-col rounded-[2rem] bg-white p-8 shadow-[0_24px_48px_-12px_rgba(27,54,65,0.08)]">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="font-[var(--font-manrope)] text-xl font-bold text-[#1b3641]">{t("atelierMonthlySavingsPlan")}</h3>
          <p className="text-xs font-medium text-[#49636f]">{t("atelierAutomaticVaultAllocation")}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>savings</span>
        </div>
      </div>

      {ruleQuery.isLoading ? (
        <p className="text-sm text-[#49636f]">{t("atelierAutoTransferLoading")}</p>
      ) : (
        <div className="flex-1 space-y-8">
          <div className="mb-6 border-b border-outline-variant/10 pb-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#49636f]">Auto-Transfer Status</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={enabled}
                  onChange={(event) => {
                    const nextEnabled = event.target.checked;
                    setFromCurrent((current) => ({ ...current, enabled: nextEnabled }));
                    persistRule(nextEnabled, allocations, false);
                  }}
                />
                <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#2E7D32] peer-checked:after:translate-x-full" />
              </label>
            </div>
            <p className="text-[9px] italic leading-relaxed text-[#647e8c] font-medium">
              <span className="material-symbols-outlined mr-1 inline-block align-middle text-[14px]">info</span>
              At the end of each month, any remaining unallocated funds will be automatically transferred to your savings plan based on this allocation breakdown.
            </p>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-widest text-[#647e8c]">Allocation Breakdown</label>
              <button
                type="button"
                disabled={updateRuleMutation.isPending}
                onClick={() => {
                  if (!isEditingAllocations) {
                    setIsEditingAllocations(true);
                    return;
                  }

                  if (hasAllocationChanges) {
                    save(() => {
                      setIsEditingAllocations(false);
                    });
                    return;
                  }

                  setDraft(null);
                  setErrors({});
                  setIsEditingAllocations(false);
                }}
                className="rounded-lg border border-[#cbe7f6] bg-[#f5fcff] px-3 py-1 text-xs font-bold text-[#1b3641] transition-all hover:border-[#9bb6c4] disabled:opacity-50"
              >
                {!isEditingAllocations
                  ? t("atelierActionEdit")
                  : hasAllocationChanges
                    ? updateRuleMutation.isPending
                      ? t("atelierActionSaving")
                      : t("atelierActionSave")
                    : t("atelierActionCancel")}
              </button>
            </div>
            <ul className="space-y-4">
              {allocations.map((row, index) => (
                <li key={`row-${index}`} className="group flex items-center justify-between gap-3">
                  <div className="relative min-w-0 flex-1">
                    <label className="sr-only" htmlFor={`allocation-plan-${index}`}>
                      {t("atelierAutoTransferPlanLabel")} <span className="text-[#a73b21]">(*)</span>
                    </label>
                    <select
                      id={`allocation-plan-${index}`}
                      value={row.savingsPlanId}
                      disabled={!enabled || !isEditingAllocations}
                      onChange={(event) => {
                        const next = [...allocations];
                        next[index] = { ...next[index], savingsPlanId: event.target.value };
                        setFromCurrent((current) => ({ ...current, allocations: next }));
                      }}
                      className="max-w-full appearance-none truncate border-none bg-transparent p-0 pr-5 text-sm font-medium text-[#49636f] focus:ring-0 disabled:opacity-70"
                    >
                      <option value="">{t("atelierAutoTransferPlanPlaceholder")}</option>
                      {eligiblePlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                    {isEditingAllocations ? (
                      <span className="material-symbols-outlined pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[16px] text-[#647e8c]">
                        expand_more
                      </span>
                    ) : null}
                    {errors[`allocations.${index}.savingsPlanId`] ? (
                      <p className="mt-1 text-xs italic text-[#a73b21]">{errors[`allocations.${index}.savingsPlanId`]}</p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-3" title={`${row.percentage || 0}%`}>
                    <div className="flex items-center gap-1">
                    <label className="sr-only" htmlFor={`allocation-percent-${index}`}>
                      {t("atelierAutoTransferPercentLabel")} <span className="text-[#a73b21]">(*)</span>
                    </label>
                    {isEditingAllocations ? (
                      <input
                        id={`allocation-percent-${index}`}
                        type="number"
                        min={1}
                        max={100}
                        disabled={!enabled}
                        value={row.percentage}
                        onChange={(event) => {
                          const next = [...allocations];
                          next[index] = { ...next[index], percentage: event.target.value };
                          setFromCurrent((current) => ({ ...current, allocations: next }));
                        }}
                        className="w-12 border-none bg-transparent p-0 text-right text-sm font-bold text-[#1b3641] focus:ring-0 disabled:opacity-70"
                      />
                    ) : (
                      <span className="w-12 text-right text-sm font-bold text-[#1b3641]">{row.percentage || 0}</span>
                    )}
                    <span className="text-sm font-bold text-[#1b3641]">%</span>
                    {isEditingAllocations ? (
                      <button
                        type="button"
                        disabled={!enabled}
                        onClick={() => {
                          if (allocations.length === 1) {
                            setFromCurrent((current) => ({ ...current, allocations: [{ savingsPlanId: "", percentage: "" }] }));
                            return;
                          }
                          setFromCurrent((current) => ({
                            ...current,
                            allocations: current.allocations.filter((_, rowIndex) => rowIndex !== index),
                          }));
                        }}
                        className="ml-1 text-[#9bb6c4] transition-colors hover:text-[#a73b21] disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined align-middle text-[14px] leading-none">delete</span>
                      </button>
                    ) : null}
                    </div>
                  </div>
                </li>
              ))}

              <li className="mt-2 flex items-center justify-between border-t border-outline-variant/10 pt-2">
                <button
                  type="button"
                  disabled={!enabled || !isEditingAllocations}
                  onClick={() =>
                    setFromCurrent((current) => ({
                      ...current,
                      allocations: [...current.allocations, { savingsPlanId: "", percentage: "" }],
                    }))
                  }
                  className="group flex items-center gap-2 text-sm font-bold text-[#2E7D32] transition-all hover:opacity-80 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined rounded-full bg-emerald-50 p-1 text-[18px] group-hover:bg-emerald-100">add</span>
                  <span>Add Saving Plan</span>
                </button>
                <span className="text-xs font-bold text-[#49636f]">{allocationTotal}%</span>
              </li>
            </ul>

            {errors.allocationTotalPercentage ? <p className="mt-2 text-xs italic text-[#a73b21]">{errors.allocationTotalPercentage}</p> : null}
            {errors.allocations ? <p className="mt-1 text-xs italic text-[#a73b21]">{errors.allocations}</p> : null}

            <div className="mt-4 flex items-start gap-2 px-1 opacity-70">
              <span className="material-symbols-outlined mt-0.5 text-[14px] text-[#647e8c]">info</span>
              <p className="text-[10px] leading-tight text-[#647e8c] font-medium">
                Allocation amounts are dynamic and recalculate automatically based on your current remaining unallocated funds.
              </p>
            </div>

            {latestRun ? (
              <p className="mt-4 text-[10px] font-medium text-[#647e8c]">
                Latest run: {latestRun.monthStart} ({latestRun.status})
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
