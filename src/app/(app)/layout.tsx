import { requireUser } from "@/lib/user";

const navItems = [
  { href: "/app", label: "Overview" },
  { href: "/app/atelier", label: "Atelier" },
  { href: "/app/accounts", label: "Wallets" },
  { href: "/app/transactions", label: "Transactions" },
  { href: "/app/categories", label: "Categories" },
  { href: "/app/savings", label: "Savings" },
  { href: "/app/reports", label: "Reports" },
  { href: "/app/settings", label: "Settings" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
              Ledgerly
            </p>
            <p className="text-sm text-slate-400">{user.email}</p>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="rounded-full border border-slate-700 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-300 hover:border-amber-400 hover:text-amber-200">
              Logout
            </button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 pb-5 text-sm">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full border border-slate-800 bg-slate-900/50 px-4 py-2 text-slate-300 hover:border-amber-400 hover:text-amber-200"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
