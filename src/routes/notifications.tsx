import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Badge, Card, SectionTitle } from "@/components/AppShell";
import { notifications } from "@/lib/farm-data";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "การแจ้งเตือน — สวนอัจฉริยะ" },
      { name: "description", content: "แจ้งเตือนงานที่ต้องทำ โรคระบาด ฝน ลมแรง ดินแห้ง และรอบใส่ปุ๋ย" },
      { property: "og:title", content: "การแจ้งเตือน — สวนอัจฉริยะ" },
      { property: "og:description", content: "รับแจ้งเตือนเหตุการณ์สำคัญในสวนแบบเรียลไทม์" },
    ],
  }),
  component: NotificationsPage,
});

const icons: Record<string, string> = {
  โรคระบาด: "🦠",
  ฝน: "🌧️",
  ดินแห้ง: "🌵",
  ใส่ปุ๋ย: "🌿",
  ลมแรง: "💨",
};

function NotificationsPage() {
  return (
    <AppShell title="การแจ้งเตือน" subtitle={`${notifications.length} รายการ`}>
      <SectionTitle>วันนี้</SectionTitle>
      {notifications.map((n) => (
        <Card key={n.id} className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-lg">
            {icons[n.type] ?? "🔔"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{n.title}</p>
              <Badge tone={n.level === "สูง" ? "bad" : n.level === "กลาง" ? "warn" : "muted"}>
                {n.level}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {n.type} · {n.time}
            </p>
          </div>
        </Card>
      ))}

      <SectionTitle>ตั้งค่าการแจ้งเตือน</SectionTitle>
      <Card className="space-y-3">
        {["งานที่ต้องทำ", "โรคระบาดในพื้นที่", "ฝนตก/ลมแรง", "ความชื้นดินต่ำ", "รอบใส่ปุ๋ย"].map((s) => (
          <div key={s} className="flex items-center justify-between">
            <p className="text-sm">{s}</p>
            <span className="flex h-6 w-11 items-center rounded-full bg-primary p-1">
              <span className="ml-auto size-4 rounded-full bg-card" />
            </span>
          </div>
        ))}
      </Card>
    </AppShell>
  );
}