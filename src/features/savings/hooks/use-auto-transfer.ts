"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Allocation = {
  savingsPlanId: string;
  percentage: number;
};

type RuleResponse = {
  enabled: boolean;
  allocations: Allocation[];
  allocationTotalPercentage: number;
  eligiblePlans: Array<{
    id: string;
    name: string;
    status: string;
    remainingTargetAmount: number;
  }>;
};

type LatestRun = {
  monthStart: string;
  timezone: string;
  status: "applied" | "skipped";
  remainderAmount: number;
  allocationTotalPercentage: number;
  skipReason: string | null;
  planResults: Array<{
    savingsPlanId: string;
    configuredPercentage: number;
    calculatedAmount: number;
    appliedAmount: number;
    status: "applied" | "skipped";
    skipReason: string | null;
    transactionId: string | null;
  }>;
};

const parseError = async (response: Response, fallback: string) => {
  try {
    const data = (await response.json()) as { error?: string; errors?: Record<string, string> };
    if (data.error) {
      return data.error;
    }
    if (data.errors) {
      const firstError = Object.values(data.errors)[0];
      if (firstError) {
        return firstError;
      }
    }
    return fallback;
  } catch {
    return fallback;
  }
};

const fetchRule = async () => {
  const response = await fetch("/api/savings/auto-transfer", { method: "GET" });
  if (!response.ok) {
    throw new Error(await parseError(response, "Unable to load auto-transfer settings."));
  }
  return (await response.json()) as RuleResponse;
};

const fetchLatestRun = async () => {
  const response = await fetch("/api/savings/auto-transfer/latest-run", { method: "GET" });
  if (!response.ok) {
    throw new Error(await parseError(response, "Unable to load latest auto-transfer run."));
  }

  const body = (await response.json()) as { latestRun: LatestRun | null };
  return body.latestRun;
};

const updateRule = async (payload: { enabled: boolean; allocations: Allocation[] }) => {
  const response = await fetch("/api/savings/auto-transfer", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { errors?: Record<string, string> };
    const error = new Error(Object.values(data.errors || {})[0] || "Unable to save auto-transfer settings.");
    (error as Error & { errors?: Record<string, string> }).errors = data.errors;
    throw error;
  }

  return response.json();
};

export const useAutoTransferRule = () => {
  return useQuery({
    queryKey: ["savings", "auto-transfer", "rule"],
    queryFn: fetchRule,
  });
};

export const useAutoTransferLatestRun = () => {
  return useQuery({
    queryKey: ["savings", "auto-transfer", "latest-run"],
    queryFn: fetchLatestRun,
  });
};

export const useUpdateAutoTransferRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRule,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["savings", "auto-transfer", "rule"] }),
        queryClient.invalidateQueries({ queryKey: ["savings", "auto-transfer", "latest-run"] }),
        queryClient.invalidateQueries({ queryKey: ["savings"] }),
      ]);
    },
  });
};
