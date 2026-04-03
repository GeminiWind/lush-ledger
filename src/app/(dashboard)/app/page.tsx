import { DashboardPageView } from "@/features/dashboard";
import { getDashboardData } from "@/lib/dashboard";
import { requireUser } from "@/lib/user";

export default async function DashboardPage() {
  const user = await requireUser();
  const language = user.settings?.language || "en-US";
  const currency = user.settings?.currency ?? "VND";
  const data = await getDashboardData(user.id);

  return (
    <DashboardPageView
      language={language}
      currency={currency}
      data={data}
    />
  );
}
