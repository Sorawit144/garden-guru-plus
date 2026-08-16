import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  CloudSun,
  Droplets,
  Sparkles,
  Sprout,
  Tags,
} from "lucide-react";
import { AppShell, Badge, Card, Progress, SectionTitle, baht } from "@/components/AppShell";
import { BrandMark } from "@/components/BrandMark";
import { notifications, todayTasks, weather } from "@/lib/farm-data";
import { usePlots } from "@/hooks/usePlots";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "สวนอัจฉริยะ — แอปจัดการสวนด้วย AI" },
      {
        name: "description",
        content: "ภาพรวมสวน งานประจำวัน สภาพอากาศ และสรุปต้นทุน-รายได้ ในแอปเดียว",
      },
      { property: "og:title", content: "สวนอัจฉริยะ — แอปจัดการสวนด้วย AI" },
      {
        property: "og:description",
        content: "จัดการแปลง วิเคราะห์โรคพืชด้วย AI และวางแผนงานเกษตรได้ในที่เดียว",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { plots } = usePlots();
  const avgHealth =
    plots.length > 0 ? Math.round(plots.reduce((s, p) => s + p.health, 0) / plots.length) : 0;
  const area = plots.reduce((s, p) => s + p.area, 0);

  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loadTx = () => {
      const stored = localStorage.getItem("garden_guru_transactions");
      if (stored) {
        try {
          setTransactions(JSON.parse(stored));
        } catch (e) {}
      }
    };
    loadTx();
    window.addEventListener("transactions_updated", loadTx);
    return () => window.removeEventListener("transactions_updated", loadTx);
  }, []);

  const income = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const cost = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <AppShell title="สวัสดี ชาวสวน" subtitle="ศุกร์ที่ 7 สิงหาคม 2569">
      <Card className="relative overflow-hidden border-0 bg-primary px-5 py-5 text-primary-foreground shadow-[0_18px_30px_-20px_oklch(0.25_0.08_145_/_0.85)]">
        <div className="pointer-events-none absolute -right-8 -top-12 size-44 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-primary-foreground/80">สุขภาพสวนโดยรวม</p>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-4xl font-bold tracking-tight">{avgHealth}</span>
              <span className="mb-1 text-sm text-primary-foreground/85">/ 100 · ดี</span>
            </div>
          </div>
          <BrandMark size="md" className="border border-white/15 bg-white/15 shadow-none" />
        </div>
        <div className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-white/90" style={{ width: `${avgHealth}%` }} />
        </div>
        <div className="relative mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/10 py-2.5">
            <p className="text-lg font-bold">{plots.length}</p>
            <p className="text-[11px] text-primary-foreground/80">แปลง</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 py-2.5">
            <p className="text-lg font-bold">{area}</p>
            <p className="text-[11px] text-primary-foreground/80">ไร่</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 py-2.5">
            <p className="text-lg font-bold">{plots.reduce((s, p) => s + p.trees, 0)}</p>
            <p className="text-[11px] text-primary-foreground/80">ต้น</p>
          </div>
        </div>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-[15px] font-bold tracking-tight">ทางลัดสำหรับวันนี้</h2>
          <Link
            to="/more"
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary"
          >
            ทั้งหมด <ChevronRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              to: "/market" as const,
              icon: Tags,
              label: "ราคาตลาด",
              tone: "bg-amber-50 text-amber-700",
            },
            {
              to: "/disaster" as const,
              icon: Droplets,
              label: "ท่วม/แล้ง",
              tone: "bg-sky-50 text-sky-700",
            },
            {
              to: "/monitor" as const,
              icon: Sprout,
              label: "เฝ้าระวัง",
              tone: "bg-emerald-50 text-emerald-700",
            },
          ].map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="surface-card group flex min-h-24 flex-col items-center justify-center gap-2 p-3 transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span className={`flex size-10 items-center justify-center rounded-2xl ${q.tone}`}>
                <q.icon className="size-5" />
              </span>
              <span className="text-xs font-medium text-foreground">{q.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/weather">
          <Card className="h-full transition-transform duration-200 hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-muted-foreground">สภาพอากาศ</p>
              <CloudSun className="size-5 text-warning" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{weather.now.temp}°</p>
            <p className="text-xs text-muted-foreground">{weather.now.condition}</p>
            <p className="mt-3 text-xs font-semibold text-primary">
              โอกาสฝน {weather.now.rainChance}%
            </p>
          </Card>
        </Link>
        <Link to="/recommend">
          <Card className="h-full transition-transform duration-200 hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-muted-foreground">คำแนะนำ AI</p>
              <Sparkles className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-sm font-semibold leading-snug">ยังไม่ต้องรดน้ำ 💧</p>
            <p className="mt-1 text-xs text-muted-foreground">ใส่ปุ๋ยแปลงมังคุด</p>
            <p className="mt-3 inline-flex items-center gap-0.5 text-xs font-semibold text-primary">
              ดู 4 ข้อ <ArrowUpRight className="size-3.5" />
            </p>
          </Card>
        </Link>
      </div>

      <SectionTitle
        action={
          <Link to="/calendar" className="text-xs font-medium text-primary">
            ปฏิทินงาน
          </Link>
        }
      >
        งานที่ต้องทำวันนี้
      </SectionTitle>
      <Card className="space-y-3">
        {todayTasks.map((t) => (
          <div key={t.id} className="flex items-center gap-3">
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-sm ${
                t.done ? "bg-primary-soft text-primary" : "bg-muted"
              }`}
            >
              {t.type === "รดน้ำ" ? "💧" : t.type === "ใส่ปุ๋ย" ? "🌿" : "🧴"}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-sm font-medium ${t.done ? "text-muted-foreground line-through" : ""}`}
              >
                {t.title}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {t.time} · {t.plot}
              </p>
            </div>
            <Badge tone={t.done ? "good" : "warn"}>{t.done ? "เสร็จ" : "รอทำ"}</Badge>
          </div>
        ))}
      </Card>

      <SectionTitle
        action={
          <Link to="/plots" className="text-xs font-medium text-primary">
            ดูทั้งหมด
          </Link>
        }
      >
        แปลงของฉัน
      </SectionTitle>
      <div className="space-y-3">
        {plots.map((p) => (
          <Card key={p.id}>
            <div className="flex items-center gap-3">
              <BrandMark size="md" className="bg-primary-soft text-primary shadow-none" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.crop} · {p.trees} ต้น · {p.area} ไร่
                </p>
              </div>
              <span className="text-sm font-semibold text-primary">{p.health}%</span>
            </div>
            <div className="mt-3">
              <Progress value={p.health} />
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle
        action={
          <Link to="/costs" className="text-xs font-medium text-primary">
            รายละเอียด
          </Link>
        }
      >
        สรุปการเงินเดือนนี้
      </SectionTitle>
      <Card>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-muted-foreground">รายได้</p>
            <p className="text-sm font-bold text-primary">{baht(income)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">ต้นทุน</p>
            <p className="text-sm font-bold text-destructive">{baht(cost)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">กำไร</p>
            <p className="text-sm font-bold">{baht(income - cost)}</p>
          </div>
        </div>
      </Card>

      <SectionTitle
        action={
          <Link to="/notifications" className="text-xs font-medium text-primary">
            ทั้งหมด
          </Link>
        }
      >
        แจ้งเตือนล่าสุด
      </SectionTitle>
      <Card className="space-y-3">
        {notifications.slice(0, 3).map((n) => (
          <div key={n.id} className="flex items-start gap-3">
            <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm">{n.title}</p>
              <p className="text-xs text-muted-foreground">
                {n.type} · {n.time}
              </p>
            </div>
          </div>
        ))}
      </Card>
    </AppShell>
  );
}
