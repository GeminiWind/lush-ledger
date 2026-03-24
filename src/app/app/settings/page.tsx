import { requireUser } from "@/lib/user";
import { getDictionary } from "@/lib/i18n";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const user = await requireUser();
  const language = user.settings?.language || "en-US";
  const t = getDictionary(language);

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-2">
          <span className="inline-block rounded-full bg-[#91f78e]/45 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#005e17]">
            {t.settingsTag}
          </span>
          <h1 className="font-[var(--font-manrope)] text-5xl font-black leading-tight tracking-tight text-[#1b3641]">
            {t.settingsTitleLine1}
            <br />
            <span className="text-[#006f1d]">{t.settingsTitleLine2}</span>
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-[#49636f]">
          {t.settingsIntro}
        </p>
      </section>

      <SettingsForm
        language={language}
        initialValues={{
          name: user.name || "",
          email: user.email,
          currency: user.settings?.currency || "VND",
          language: user.settings?.language || "en-US",
          theme: user.settings?.theme || "light",
        }}
      />
    </div>
  );
}
