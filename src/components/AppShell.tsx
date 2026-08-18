import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Bell, Home, LayoutGrid, Leaf, MessageCircle, ScanLine } from "lucide-react";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";
import { ThemeToggle } from "@/components/ThemeToggle";

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
  const router = useRouter();
  const location = useLocation();
  const showBackButton = location.pathname !== "/";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_100%,var(--color-primary-soft),transparent_43%),linear-gradient(135deg,var(--color-secondary),var(--color-background))]">
      <div className="app-frame mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-card/92 px-5 pt-[max(1.35rem,env(safe-area-inset-top))] pb-5 text-foreground backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="relative flex min-w-0 items-start gap-3">
              {showBackButton ? (
                <button
                  type="button"
                  onClick={() => router.history.back()}
                  className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-primary-soft text-primary transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  aria-label="ย้อนกลับ"
                >
                  <ArrowLeft className="size-5" />
                </button>
              ) : null}
              <BrandMark size="sm" className="mt-0.5 shadow-none" />
              <div className="min-w-0">
                <h1 className="text-[1.35rem] font-bold leading-tight tracking-tight">{title}</h1>
                {subtitle ? (
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="relative flex shrink-0 items-center gap-2">
              <ThemeToggle />
              <Link
                to="/notifications"
                className="relative rounded-2xl border border-border bg-primary-soft p-2.5 text-primary transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label="การแจ้งเตือน"
              >
                <Bell className="size-5" />
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-warning" />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-6 px-4 pt-5 pb-32">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
          <ul className="flex items-stretch justify-between gap-1 rounded-[1.5rem] border border-border bg-card/95 p-2 shadow-[var(--shadow-soft)] backdrop-blur-2xl">
            {navItems.map((item) => (
              <li key={item.to} className="min-w-0 flex-1">
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  aria-label={item.label}
                  className="group relative flex min-h-14 flex-col items-center justify-center gap-1.5 rounded-[1.15rem] px-1 py-2 text-[11px] font-medium text-muted-foreground transition-all duration-300 hover:bg-primary-soft active:scale-95 data-[status=active]:bg-primary data-[status=active]:text-primary-foreground data-[status=active]:shadow-[var(--shadow-card)]"
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

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`surface-card p-5 ${className}`}>{children}</div>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex min-h-7 items-center justify-between gap-3 px-1">
      <h2 className="border-l-3 border-primary pl-2.5 text-[15px] font-bold tracking-tight text-foreground">
        {children}
      </h2>
      {action ? <div className="shrink-0">{action}</div> : null}
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

export const baht = (n: number) => `${n < 0 ? "-" : ""}฿${Math.abs(n).toLocaleString("th-TH")}`;
