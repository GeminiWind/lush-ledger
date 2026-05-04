import { describe, expect, it } from "vitest";
import { asDayLabel, groupLedgerTransactions } from "@/features/ledger/date-grouping";

const translator = ((key: string) => {
  if (key === "ledgerToday") {
    return "Today";
  }
  if (key === "ledgerYesterday") {
    return "Yesterday";
  }
  return key;
}) as ((key: string) => string) & Record<string, string>;

const atUtc = (value: string) => new Date(`${value}T00:00:00.000Z`);

const makeTx = (id: string, value: string | Date) => ({
  id,
  date: value instanceof Date ? value : new Date(`${value}T12:00:00.000Z`),
});

describe("ledger page date grouping integration", () => {
  it("renders Today group first for same-day transactions", () => {
    const now = atUtc("2026-05-04");
    const groups = groupLedgerTransactions(
      [makeTx("older", "2026-05-01"), makeTx("today-a", "2026-05-04"), makeTx("today-b", "2026-05-04")],
      "en-US",
      translator,
      now,
    );

    expect(groups[0]?.label).toBe("Today");
    expect(groups[0]?.items.map((item) => item.id)).toEqual(["today-a", "today-b"]);
  });

  it("renders Yesterday group directly after Today when present", () => {
    const now = atUtc("2026-05-04");
    const groups = groupLedgerTransactions(
      [makeTx("older", "2026-05-01"), makeTx("y", "2026-05-03"), makeTx("t", "2026-05-04")],
      "en-US",
      translator,
      now,
    );

    expect(groups.map((group) => group.label)).toEqual(["Today", "Yesterday", "May 01"]);
  });

  it("hides Yesterday group when no yesterday transactions exist", () => {
    const now = atUtc("2026-05-04");
    const groups = groupLedgerTransactions(
      [makeTx("today", "2026-05-04"), makeTx("older", "2026-05-01")],
      "en-US",
      translator,
      now,
    );

    expect(groups.map((group) => group.label)).toEqual(["Today", "May 01"]);
  });

  it("keeps Today then Yesterday order after refreshed results", () => {
    const now = atUtc("2026-05-04");
    const initialGroups = groupLedgerTransactions(
      [makeTx("older", "2026-05-01"), makeTx("today", "2026-05-04")],
      "en-US",
      translator,
      now,
    );
    const refreshedGroups = groupLedgerTransactions(
      [makeTx("yesterday", "2026-05-03"), makeTx("today-2", "2026-05-04")],
      "en-US",
      translator,
      now,
    );

    expect(initialGroups.map((group) => group.label)).toEqual(["Today", "May 01"]);
    expect(refreshedGroups.map((group) => group.label)).toEqual(["Today", "Yesterday"]);
  });

  it("renders older transactions under locale-formatted date headers", () => {
    const now = atUtc("2026-05-04");
    const groups = groupLedgerTransactions(
      [makeTx("o1", "2026-04-30"), makeTx("o2", "2026-04-29")],
      "en-US",
      translator,
      now,
    );

    expect(groups.map((group) => group.label)).toEqual(["April 30", "April 29"]);
  });

  it("uses locale-specific labels for older groups", () => {
    const now = atUtc("2026-05-04");
    const label = asDayLabel(atUtc("2026-04-30"), "vi-VN", translator, now);

    expect(label).toContain("30");
    expect(label.toLowerCase()).toContain("tháng");
  });

  it("skips invalid or missing date values from grouping", () => {
    const now = atUtc("2026-05-04");
    const groups = groupLedgerTransactions(
      [makeTx("valid", "2026-05-04"), makeTx("invalid", new Date(""))],
      "en-US",
      translator,
      now,
    );

    expect(groups).toHaveLength(1);
    expect(groups[0]?.items.map((item) => item.id)).toEqual(["valid"]);
  });
});
