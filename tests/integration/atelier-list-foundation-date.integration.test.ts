import { describe, expect, it } from "vitest";

import {
  INVALID_MONTH_QUERY_MESSAGE,
  parseMonthQuery,
  resolveMonthRangeFromQuery,
  resolveTimezone,
} from "@/lib/date";

describe("atelier list foundational month helpers", () => {
  it("parses valid YYYY-MM month query", () => {
    const parsed = parseMonthQuery("2026-04");

    expect(parsed).toEqual({ ok: true, month: "2026-04" });
  });

  it("returns structured validation error for invalid month query", () => {
    const parsed = parseMonthQuery("2026-4");

    expect(parsed).toEqual({
      ok: false,
      errors: {
        month: INVALID_MONTH_QUERY_MESSAGE,
      },
    });
  });

  it("resolves timezone with fallback when input timezone is invalid", () => {
    const timezone = resolveTimezone("Not/A_Zone", "Asia/Ho_Chi_Minh");

    expect(timezone).toBe("Asia/Ho_Chi_Minh");
  });

  it("resolves selected month UTC range from user timezone", () => {
    const range = resolveMonthRangeFromQuery({
      month: "2026-04",
      timezone: "Asia/Ho_Chi_Minh",
    });

    expect(range.ok).toBe(true);
    if (!range.ok) {
      return;
    }

    expect(range.month).toBe("2026-04");
    expect(range.start.toISOString()).toBe("2026-03-31T17:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-04-30T16:59:59.999Z");
    expect(range.nextMonthStart.toISOString()).toBe("2026-04-30T17:00:00.000Z");
  });
});
