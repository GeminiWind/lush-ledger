import { SettingsPageView } from "@/features/settings";
import { getCurrentUser } from "@/lib/user";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const language = user.settings?.language || "en-US";

  return (
    <SettingsPageView
      language={language}
      initialValues={{
        name: user.name || "",
        email: user.email,
        currency: user.settings?.currency || "VND",
        language: user.settings?.language || "en-US",
        theme: user.settings?.theme || "light",
      }}
    />
  );
}
