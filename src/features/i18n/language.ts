export type AppLanguage = "en-US" | "vi-VN" | "fr-FR" | "ja-JP";

export const normalizeLanguage = (value?: string | null): AppLanguage => {
  if (value === "vi-VN") return "vi-VN";
  if (value === "fr-FR") return "fr-FR";
  if (value === "ja-JP") return "ja-JP";
  return "en-US";
};
