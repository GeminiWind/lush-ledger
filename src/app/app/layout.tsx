import AppChrome from "@/app/app/AppChrome";
import { requireUser } from "@/lib/user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return <AppChrome userEmail={user.email} language={user.settings?.language || "en-US"}>{children}</AppChrome>;
}
