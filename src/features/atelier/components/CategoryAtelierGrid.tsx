"use client";

import { useNamespacedTranslation } from "@/features/i18n/useNamespacedTranslation";
import { formatCurrency } from "@/lib/format";
import type { CategoryAtelierGridProps } from "@/features/atelier/types";

const iconToneByIndex = [
  "bg-emerald-50 text-emerald-800",
  "bg-blue-50 text-blue-800",
  "bg-orange-50 text-orange-800",
] as const;

const statusMetaByKey = {
  healthy: {
    className: "text-[#2E7D32]",
    meterClass: "bg-[#2E7D32]",
    badgeClass: "bg-emerald-50 text-[#2E7D32]",
    icon: "check_circle",
  },
  warning: {
    className: "text-[#b35a00]",
    meterClass: "bg-amber-700",
    badgeClass: "bg-amber-50 text-[#b35a00]",
    icon: "warning",
  },
  overspent: {
    className: "text-[#a73b21]",
    meterClass: "bg-[#a73b21]",
    badgeClass: "bg-[#ffe9e4] text-[#a73b21]",
    icon: "error",
  },
  pending: {
    className: "text-[var(--color-on-surface-variant)]",
    meterClass: "bg-[var(--color-outline-variant)]",
    badgeClass: "bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)]",
    icon: "hourglass_top",
  },
} as const;

export default function CategoryAtelierGrid({
  categories,
  currency,
  language,
  riskLabels,
  pendingLabel,
}: CategoryAtelierGridProps) {
  const t = useNamespacedTranslation("atelier", language);

  return (
    <div className="space-y-[var(--spacing-6)]">
      <h2 className="font-[var(--font-display)] text-[var(--font-headline-md)] font-bold text-[var(--color-on-surface)]">
        {t("atelierCategoryAtelier")}
      </h2>

      <div className="grid gap-[var(--spacing-4)] md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category, index) => {
          const statusMeta = statusMetaByKey[category.status];
          const statusLabel = category.status === "pending" ? pendingLabel : riskLabels[category.status];
          const toneClass = iconToneByIndex[index % iconToneByIndex.length];
          const usedPercent = Math.max(0, Math.min(100, Math.round(category.usagePercent)));
          const warningToggleClass = category.warningEnabled ? "bg-[#2E7D32]" : "bg-gray-300";

          return (
            <article
              key={category.id}
              className="group flex h-full flex-col justify-between rounded-3xl bg-[var(--card-bg)] p-[var(--spacing-6)] shadow-[var(--shadow-ambient)] transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/5"
            >
              <div>
                <div className="mb-[var(--spacing-6)] flex items-start justify-between gap-[var(--spacing-3)]">
                  <div className="flex items-center gap-[var(--spacing-4)]">
                    <div className={`grid h-14 w-14 place-items-center rounded-2xl transition-colors ${toneClass}`}>
                      <span className="material-symbols-outlined text-3xl">{category.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-[var(--font-display)] text-lg font-bold text-[var(--color-on-surface)]">{category.name}</h3>
                      <p className="text-[var(--font-label-sm)] font-medium text-[var(--color-on-surface-variant)]">
                        {t("atelierMonthlyLimit")}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[var(--color-outline-variant)]">edit_square</span>
                </div>

                <div className="mb-[var(--spacing-6)] space-y-[var(--spacing-3)]">
                  <div className="flex items-end justify-between gap-[var(--spacing-3)]">
                    <p className="font-[var(--font-display)] text-2xl font-extrabold text-[var(--color-on-surface)]">
                      {formatCurrency(category.limit, currency)}
                    </p>
                    <span className={`rounded px-[var(--spacing-2)] py-[var(--spacing-1)] text-[var(--font-label-sm)] font-bold ${statusMeta.badgeClass}`}>
                      {usedPercent}% {t("atelierUsed")}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-container-low)]">
                    <div className={`h-full rounded-full ${statusMeta.meterClass}`} style={{ width: `${usedPercent}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                    <span>{t("atelierSpent")} {formatCurrency(category.spent, currency)}</span>
                    <span
                      className={`inline-flex items-center gap-[var(--spacing-1)] ${statusMeta.className}`}
                      aria-label={`${category.name} ${statusLabel}`}
                    >
                      <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                        {statusMeta.icon}
                      </span>
                      <span>{statusLabel}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-[var(--spacing-2)] border-t border-[color:rgba(155,182,196,0.15)] pt-[var(--spacing-4)]">
                <div className="flex items-center justify-between gap-[var(--spacing-3)]">
                  <div className="flex items-center gap-[var(--spacing-2)]">
                    <span className="material-symbols-outlined text-[16px] text-[var(--color-on-surface-variant)]">
                      {category.warningEnabled ? "notifications" : "notifications_off"}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                      {t("atelierOverExpenseWarning")}
                    </span>
                  </div>
                  <span className={`relative block h-6 w-11 rounded-full ${warningToggleClass}`} aria-hidden="true">
                    <span
                      className={`absolute top-[2px] h-5 w-5 rounded-full bg-white transition-all ${category.warningEnabled ? "left-[22px]" : "left-[2px]"}`}
                    />
                  </span>
                </div>
                <div className="flex items-center justify-between gap-[var(--spacing-3)] text-[var(--font-label-sm)] text-[var(--color-on-surface-variant)]">
                  <span>
                    {t("atelierWarnAt")}: <strong className="text-[var(--color-on-surface)]">{category.warnAt}%</strong> {t("atelierWarnAtLimitContext")}
                  </span>
                  <span>
                    {t("atelierKeepLimitNextMonth")}: {" "}
                    <strong className="text-[var(--color-on-surface)]">{category.carryNextMonth ? t("atelierEnabled") : t("atelierDisabled")}</strong>
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
