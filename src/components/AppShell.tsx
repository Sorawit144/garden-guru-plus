import { Link } from "@tanstack/react-router";
import { Bell, Home, LayoutGrid, Leaf, MessageCircle, ScanLine } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { to: "/", label: "หน้าหลัก", icon: Home, exact: true },
  { to: "/plots", label: "แปลง", icon: Leaf, exact: false },
  { to: "/diagnose", label: "ตรวจโรค", icon: ScanLine, exact: false },
  { to: "/assistant", label: "ผู้ช่วย AI", icon: MessageCircle, exact: false },
  { to: "/more", label: "เมนู", icon: LayoutGrid, exact: false },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-secondary/40">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background shadow-[var(--shadow-soft)]">
        <header className="sticky top-0 z-20 bg-primary px-5 pt-6 pb-6 text-primary-foreground">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight">{title}</h1>
              {subtitle ? (
                <p className="mt-1 text-sm text-primary-foreground/80">{subtitle}</p>
              ) : null}
            </div>
            <Link
              to="/notifications"
              className="relative rounded-full bg-white/15 p-2.5 transition-colors hover:bg-white/25"
              aria-label="การแจ้งเตือน"
            >
              <Bell className="size-5" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-warning" />
            </Link>
          </div>
        </header>

        <main className="flex-1 space-y-4 px-4 pt-4 pb-28">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
          <ul className="flex items-stretch justify-between gap-1 rounded-[1.75rem] border border-border/70 bg-card/85 p-2 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.03] backdrop-blur-2xl">
            {navItems.map((item) => (
              <li key={item.to} className="min-w-0 flex-1">
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  aria-label={item.label}
                  className="group relative flex flex-col items-center gap-1.5 rounded-[1.35rem] px-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-all duration-300 hover:bg-muted/60 active:scale-95 data-[status=active]:bg-primary data-[status=active]:text-primary-foreground data-[status=active]:shadow-[var(--shadow-card)]"
                >
                  <item.icon
                    className="size-5 shrink-0 transition-transform duration-300 group-data-[status=active]:-translate-y-0.5 group-data-[status=active]:scale-110"
                    strokeWidth={2}
                  />
                  <span className="w-full truncate text-center leading-none tracking-tight">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`surface-card p-4 ${className}`}>{children}</div>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-1 pt-2">
      <h2 className="text-base font-semibold text-foreground">{children}</h2>
      {action}
    </div>
  );
}

export function Badge({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "good" | "warn" | "bad" | "info";
}) {
  const tones: Record<string, string> = {
    muted: "bg-muted text-muted-foreground",
    good: "bg-primary text-primary-foreground",
    warn: "bg-primary-soft text-primary",
    bad: "bg-destructive/15 text-destructive",
    info: "bg-primary-soft text-primary",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
    </div>
  );
}

export const baht = (n: number) =>
  `${n < 0 ? "-" : ""}฿${Math.abs(n).toLocaleString("th-TH")}`;