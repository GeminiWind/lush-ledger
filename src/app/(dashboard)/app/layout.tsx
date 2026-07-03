import AppChrome from "@/components/layout/AppChrome";
import { getCurrentUser } from "@/lib/user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return <AppChrome userEmail={user.email} language={user.settings?.language || "en-US"}>{children}</AppChrome>;
}
