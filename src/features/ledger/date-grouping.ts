import { addDaysDate, localeDateLabel, nowDate, sameDay, toISODate } from "@/lib/date";

export type LedgerTranslator = ((key: string) => string) & Record<string, string>;

type LedgerGroup<T> = {
  key: string;
  label: string;
  date: Date;
  items: T[];
};

const resolveLedgerLocale = (language: string) => (language === "vi-VN" ? "vi-VN" : "en-US");

const isValidDateValue = (value: Date) => !Number.isNaN(value.getTime());

export const asDayLabel = (value: Date, language: string, t: LedgerTranslator, today: Date = nowDate()) => {
  const locale = resolveLedgerLocale(language);
  const yesterday = addDaysDate(today, -1);

  if (sameDay(value, today)) {
    return t("ledgerToday");
  }
  if (sameDay(value, yesterday)) {
    return t("ledgerYesterday");
  }

  return localeDateLabel(value, locale, {
    month: "long",
    day: "2-digit",
  });
};

const asLedgerGroupRank = (value: Date, today: Date) => {
  if (sameDay(value, today)) {
    return 0;
  }
  if (sameDay(value, addDaysDate(today, -1))) {
    return 1;
  }
  return 2;
};

export const groupLedgerTransactions = <T extends { date: Date }>(
  transactions: T[],
  language: string,
  t: LedgerTranslator,
  today: Date = nowDate(),
) => {
  const groupedMap = new Map<string, LedgerGroup<T>>();

  transactions.forEach((transaction) => {
    if (!isValidDateValue(transaction.date)) {
      return;
    }

    const key = toISODate(transaction.date);
    if (!key) {
      return;
    }

    const currentGroup = groupedMap.get(key);
    if (currentGroup) {
      currentGroup.items.push(transaction);
      return;
    }

    groupedMap.set(key, {
      key,
      label: asDayLabel(transaction.date, language, t, today),
      date: transaction.date,
      items: [transaction],
    });
  });

  return Array.from(groupedMap.values()).sort((left, right) => {
    const rankDiff = asLedgerGroupRank(left.date, today) - asLedgerGroupRank(right.date, today);
    if (rankDiff !== 0) {
      return rankDiff;
    }
    return right.date.getTime() - left.date.getTime();
  });
};

export const ledgerLocale = resolveLedgerLocale;
