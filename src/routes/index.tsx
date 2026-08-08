import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Badge, Card, Progress, SectionTitle, baht } from "@/components/AppShell";
import { notifications, plots, todayTasks, weather } from "@/lib/farm-data";

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
  const avgHealth = Math.round(plots.reduce((s, p) => s + p.health, 0) / plots.length);
  const area = plots.reduce((s, p) => s + p.area, 0);
  const income = 107500;
  const cost = 22700;

  return (
    <AppShell title="สวัสดี ชาวสวน 👋" subtitle="ศุกร์ที่ 7 สิงหาคม 2569">
      <Card className="bg-primary border-0 text-primary-foreground">
        <p className="text-sm text-primary-foreground/85">สุขภาพสวนโดยรวม</p>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-4xl font-bold">{avgHealth}</span>
          <span className="mb-1 text-sm text-primary-foreground/85">/ 100 · ดี</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-white/90" style={{ width: `${avgHealth}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/15 py-2">
            <p className="text-lg font-bold">{plots.length}</p>
            <p className="text-[11px] text-primary-foreground/80">แปลง</p>
          </div>
          <div className="rounded-xl bg-white/15 py-2">
            <p className="text-lg font-bold">{area}</p>
            <p className="text-[11px] text-primary-foreground/80">ไร่</p>
          </div>
          <div className="rounded-xl bg-white/15 py-2">
            <p className="text-lg font-bold">{plots.reduce((s, p) => s + p.trees, 0)}</p>
            <p className="text-[11px] text-primary-foreground/80">ต้น</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/weather">
          <Card className="h-full">
            <p className="text-xs text-muted-foreground">สภาพอากาศ</p>
            <p className="mt-1 text-2xl font-bold">{weather.now.temp}°</p>
            <p className="text-xs text-muted-foreground">{weather.now.condition}</p>
            <p className="mt-2 text-xs text-primary">โอกาสฝน {weather.now.rainChance}%</p>
          </Card>
        </Link>
        <Link to="/recommend">
          <Card className="h-full">
            <p className="text-xs text-muted-foreground">คำแนะนำ AI วันนี้</p>
            <p className="mt-1 text-sm font-semibold">ยังไม่ต้องรดน้ำ 💧</p>
            <p className="mt-1 text-xs text-muted-foreground">ควรใส่ปุ๋ยแปลงมังคุด</p>
            <p className="mt-2 text-xs text-primary">ดูทั้งหมด 4 ข้อ</p>
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
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-xl">
                {p.emoji}
              </span>
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
