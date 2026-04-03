"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSettings, resolveUserSetting } from "@/features/settings/services/settings-client";

export const useUserSetting = (enabled = true) => {
  const query = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
    enabled,
  });

  const setting = resolveUserSetting(query.data);

  return {
    ...query,
    ...setting,
    setting,
  };
};
