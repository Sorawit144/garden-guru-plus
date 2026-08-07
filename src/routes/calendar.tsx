import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AppShell, Badge, Card, SectionTitle } from "@/components/AppShell";
import { calendarTasks } from "@/lib/farm-data";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "ปฏิทินงานสวน — สวนอัจฉริยะ" },
      { name: "description", content: "ตารางงานใส่ปุ๋ย รดน้ำ ฉีดยา และเก็บเกี่ยว พร้อมการแจ้งเตือน" },
      { property: "og:title", content: "ปฏิทินงานสวน — สวนอัจฉริยะ" },
      { property: "og:description", content: "วางแผนงานเกษตรรายวันและรับแจ้งเตือนอัตโนมัติ" },
    ],
  }),
  component: CalendarPage,
});

const typeTone: Record<string, "good" | "warn" | "info" | "muted"> = {
  รดน้ำ: "info",
  ใส่ปุ๋ย: "good",
  ฉีดยา: "warn",
  เก็บเกี่ยว: "muted",
};

function CalendarPage() {
  return (
    <AppShell title="ปฏิทินงาน" subtitle="สิงหาคม 2569">
      <Card>
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarTasks.map((d, i) => (
            <div
              key={d.date}
              className={`rounded-xl py-2 ${i === 0 ? "gradient-leaf text-primary-foreground" : "bg-muted/50"}`}
            >
              <p className="text-[10px] opacity-80">{d.day}</p>
              <p className="text-sm font-semibold">{d.date}</p>
              <div className="mt-1 flex justify-center gap-0.5">
                {d.tasks.map((_, k) => (
                  <span
                    key={k}
                    className={`size-1.5 rounded-full ${i === 0 ? "bg-white/80" : "bg-primary/60"}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <button className="gradient-leaf flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-primary-foreground">
        <Plus className="size-4" /> เพิ่มงานใหม่
      </button>

      {calendarTasks
        .filter((d) => d.tasks.length > 0)
        .map((d) => (
          <div key={d.date} className="space-y-2">
            <SectionTitle>
              {d.day} {d.date} ส.ค.
            </SectionTitle>
            {d.tasks.map((t) => (
              <Card key={t.title} className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-lg">
                  {t.type === "รดน้ำ" ? "💧" : t.type === "ใส่ปุ๋ย" ? "🌿" : t.type === "ฉีดยา" ? "🧴" : "🧺"}
                </span>
                <p className="flex-1 text-sm font-medium">{t.title}</p>
                <Badge tone={typeTone[t.type] ?? "muted"}>{t.type}</Badge>
              </Card>
            ))}
          </div>
        ))}
    </AppShell>
  );
}