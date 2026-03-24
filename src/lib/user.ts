import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const requireUser = async () => {
  const session = await getSessionFromCookies();
  if (!session?.sub) {
    redirect("/login");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { settings: true },
  });
  if (!user) {
    redirect("/login");
  }
  return user;
};
