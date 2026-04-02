"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSettings, resolveUserSetting } from "@/features/settings/services/settings-client";

export const useUserSetting = () => {
  const query = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
  });

  const setting = resolveUserSetting(query.data);

  return {
    ...query,
    ...setting,
    setting,
  };
};
