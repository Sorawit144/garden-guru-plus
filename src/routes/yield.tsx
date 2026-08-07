import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { AppShell, Card, Progress, SectionTitle, baht } from "@/components/AppShell";
import { yieldForecast, yieldTrend } from "@/lib/farm-data";

export const Route = createFileRoute("/yield")({
  head: () => ({
    meta: [
      { title: "คาดการณ์ผลผลิต — สวนอัจฉริยะ" },
      { name: "description", content: "AI คาดการณ์ปริมาณผลผลิต รายได้ และกำไรของแต่ละแปลงในฤดูกาลนี้" },
      { property: "og:title", content: "คาดการณ์ผลผลิต — สวนอัจฉริยะ" },
      { property: "og:description", content: "พยากรณ์ผลผลิตและรายได้ล่วงหน้าเพื่อวางแผนการขาย" },
    ],
  }),
  component: YieldPage,
});

function YieldPage() {
  const totalKg = yieldForecast.reduce((s, y) => s + y.kg, 0);
  const revenue = yieldForecast.reduce((s, y) => s + y.kg * y.pricePerKg, 0);
  const cost = 268000;

  return (
    <AppShell title="คาดการณ์ผลผลิต" subtitle="ฤดูกาล 2569 · อัปเดตรายสัปดาห์">
      <Card className="gradient-sun border-0 text-sun-foreground">
        <p className="text-sm opacity-80">ผลผลิตรวมที่คาดการณ์</p>
        <p className="text-4xl font-bold">{totalKg.toLocaleString("th-TH")} กก.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/30 p-2">
            <p className="text-[11px] opacity-80">รายได้คาดการณ์</p>
            <p className="text-sm font-bold">{baht(revenue)}</p>
          </div>
          <div className="rounded-xl bg-white/30 p-2">
            <p className="text-[11px] opacity-80">กำไรคาดการณ์</p>
            <p className="text-sm font-bold">{baht(revenue - cost)}</p>
          </div>
        </div>
      </Card>

      <SectionTitle>แนวโน้มผลผลิตย้อนหลัง</SectionTitle>
      <Card>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={yieldTrend}>
              <XAxis dataKey="year" tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip
                formatter={(v: number) => `${v.toLocaleString("th-TH")} กก.`}
                contentStyle={{ borderRadius: 12, fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="kg"
                stroke="var(--color-primary)"
                fill="var(--color-primary-soft)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground">* ปี 2569 เป็นค่าคาดการณ์จากโมเดล AI</p>
      </Card>

      <SectionTitle>แยกตามแปลง</SectionTitle>
      {yieldForecast.map((y) => (
        <Card key={y.plot}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{y.plot}</p>
            <p className="text-sm font-bold text-primary">{y.kg.toLocaleString("th-TH")} กก.</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            ราคาประเมิน {y.pricePerKg} บาท/กก. · รายได้ {baht(y.kg * y.pricePerKg)}
          </p>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>ความมั่นใจของโมเดล</span>
              <span>{y.confidence}%</span>
            </div>
            <Progress value={y.confidence} />
          </div>
        </Card>
      ))}
    </AppShell>
  );
}