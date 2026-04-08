import { NextRequest } from "next/server";

export type MonthEndJobRequestInput = {
  month?: string;
  authorization?: string;
};

export const createMonthEndJobRequest = (
  input: MonthEndJobRequestInput = {},
): NextRequest => {
  const monthParam = input.month ? `?month=${encodeURIComponent(input.month)}` : "";
  const request = new NextRequest(
    `http://localhost/api/internal/jobs/month-end-remainder-allocation${monthParam}`,
    {
      method: "POST",
      headers: {
        ...(input.authorization ? { authorization: input.authorization } : {}),
        "content-type": "application/json",
      },
      body: JSON.stringify(input.month ? { month: input.month } : {}),
    },
  );

  return request;
};
