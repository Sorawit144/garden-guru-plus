import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  CloudSun,
  Droplets,
  GraduationCap,
  MapPin,
  Sparkles,
  Sprout,
  Tags,
  X,
} from "lucide-react";
import { AppShell, Badge, Card, Progress, SectionTitle } from "@/components/AppShell";
import { BrandMark } from "@/components/BrandMark";
import { todayTasks, weather } from "@/lib/farm-data";
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

  const [showTrainingShortcut, setShowTrainingShortcut] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("garden_guru_training_shortcut_closed") === "true")
      setShowTrainingShortcut(false);
  }, []);

  const closeTrainingShortcut = () => {
    setShowTrainingShortcut(false);
    localStorage.setItem("garden_guru_training_shortcut_closed", "true");
  };

  return (
    <AppShell title="สวัสดี ชาวสวน" subtitle="ศุกร์ที่ 7 สิงหาคม 2569">
      {showTrainingShortcut && (
        <div className="fixed right-3 bottom-28 z-40 flex items-center overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-[var(--shadow-card)]">
          <Link
            to="/training"
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-primary"
          >
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary-soft">
              <GraduationCap className="size-4" />
            </span>
            <span>โหมดฝึกสอน</span>
          </Link>
          <button
            onClick={closeTrainingShortcut}
            className="self-stretch border-l border-border px-2 text-muted-foreground hover:bg-muted"
            aria-label="ปิดปุ่มโหมดฝึกสอนถาวร"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
      <section className="farm-hero relative min-h-[340px] overflow-hidden rounded-[2rem] p-5 text-white shadow-[0_22px_36px_-24px_oklch(0.2_0.06_145_/_0.8)]">
        <div className="absolute -top-10 -right-12 size-52 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.12em] text-white/65">GARDEN JOURNAL · TODAY</p>
            <h2 className="mt-2 max-w-64 text-[1.7rem] font-bold leading-tight tracking-tight">
              สวนพร้อมเติบโต<br />อย่างมั่นใจ
            </h2>
          </div>
          <BrandMark size="md" className="bg-white/15 text-white shadow-none ring-1 ring-white/20" />
        </div>
        <div className="absolute inset-x-5 bottom-5">
          <div className="glass-panel rounded-3xl p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-white/70">สุขภาพสวนโดยรวม</p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-4xl font-bold tracking-tight">{avgHealth}</span>
                  <span className="mb-1 text-sm text-white/75">/ 100 · ดีมาก</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white/90">
                <MapPin className="size-3" /> 41.5 ไร่
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-amber-200" style={{ width: `${avgHealth}%` }} />
            </div>
          </div>
        </div>
      </section>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {[
          ["วันนี้", `${weather.now.temp}°`, CloudSun],
          ["แปลงทั้งหมด", `${plots.length} แปลง`, Sprout],
          ["งานค้าง", `${todayTasks.filter((t) => !t.done).length} งาน`, Sparkles],
        ].map(([label, value, Icon]) => {
          const StatusIcon = Icon as typeof CloudSun;
          return (
            <div key={String(label)} className="surface-card flex min-w-36 items-center gap-2.5 px-3.5 py-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                <StatusIcon className="size-4" />
              </span>
              <span>
                <span className="block text-[11px] text-muted-foreground">{label}</span>
                <span className="block text-sm font-bold">{value}</span>
              </span>
            </div>
          );
        })}
      </div>

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
        <div className="grid grid-cols-3 gap-2.5">
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
          <Card className="h-full bg-[linear-gradient(145deg,var(--color-card),var(--color-secondary))] transition-transform duration-200 hover:-translate-y-0.5">
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
          <Card className="h-full bg-[linear-gradient(145deg,var(--color-primary-soft),var(--color-card))] transition-transform duration-200 hover:-translate-y-0.5">
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

    </AppShell>
  );
}
