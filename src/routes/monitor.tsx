import { createFileRoute } from "@tanstack/react-router";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell, Badge, Card, Progress, SectionTitle } from "@/components/AppShell";
import { weeklyChecks, weeklyHealth } from "@/lib/farm-data";

export const Route = createFileRoute("/monitor")({
  head: () => ({
    meta: [
      { title: "เฝ้าระวังความสมบูรณ์พืชรายสัปดาห์ — สวนอัจฉริยะ" },
      { name: "description", content: "ติดตามคะแนนความสมบูรณ์ของพืชทุกสัปดาห์ เห็นแนวโน้มขึ้นลงและสัญญาณเตือนก่อนพืชเสียหายหนัก" },
      { property: "og:title", content: "เฝ้าระวังความสมบูรณ์พืชรายสัปดาห์ — สวนอัจฉริยะ" },
      { property: "og:description", content: "ตรวจสุขภาพพืชทุกสัปดาห์ แก้ปัญหาได้ทันก่อนสาย" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MonitorPage,
});

function MonitorPage() {
  return (
    <AppShell title="เฝ้าระวังรายสัปดาห์" subtitle="ตรวจครั้งล่าสุด 5 ส.ค. 2569">
      <SectionTitle>แนวโน้ม 5 สัปดาห์</SectionTitle>
      <Card>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyHealth}>
              <XAxis dataKey="w" tickLine={false} axisLine={false} fontSize={10} />
              <YAxis domain={[50, 100]} width={26} tickLine={false} axisLine={false} fontSize={10} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="durian" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="mangosteen" stroke="var(--chart-3)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="longan" stroke="var(--chart-2)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <SectionTitle>ผลตรวจรายแปลง</SectionTitle>
      <div className="space-y-3">
        {weeklyChecks.map((c) => (
          <Card key={c.id}>
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{c.plot}</p>
                <p className="text-xs text-muted-foreground">{c.next}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{c.score}</p>
                <p
                  className={`text-[11px] ${c.trend >= 0 ? "text-primary" : "text-destructive"}`}
                >
                  {c.trend >= 0 ? "▲" : "▼"} {Math.abs(c.trend)} จากสัปดาห์ก่อน
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={c.score} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone={c.score >= 80 ? "good" : c.score >= 70 ? "warn" : "bad"}>{c.status}</Badge>
              {c.issues.map((i) => (
                <span key={i} className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                  {i}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-primary/30 bg-primary/10">
        <p className="text-sm font-semibold">แจ้งเตือนอัตโนมัติทุกสัปดาห์</p>
        <p className="mt-1 text-xs text-muted-foreground">
          ระบบส่งข้อความสรุปสุขภาพพืชทุกวันจันทร์ 07:00 น. พร้อมเตือนทันทีเมื่อคะแนนลดลงเกิน 5 จุด
        </p>
        <button className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground active:scale-[0.99]">
          บันทึกผลตรวจสัปดาห์นี้
        </button>
      </Card>
    </AppShell>
  );
}
