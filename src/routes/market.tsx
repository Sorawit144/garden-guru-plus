import { createFileRoute } from "@tanstack/react-router";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { AppShell, Badge, Card, SectionTitle } from "@/components/AppShell";
import { marketPrices, priceTrend, yieldForecast } from "@/lib/farm-data";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "ราคาผลผลิตวันนี้ — สวนอัจฉริยะ" },
      { name: "description", content: "ราคาทุเรียน มังคุด ลำไย ณ ปัจจุบันจากตลาดกลาง พร้อมแนวโน้มราคาและประเมินรายได้จากผลผลิตในสวน" },
      { property: "og:title", content: "ราคาผลผลิตวันนี้ — สวนอัจฉริยะ" },
      { property: "og:description", content: "ราคาตลาดล่าสุดช่วยตัดสินใจว่าจะขายวันไหนถึงคุ้มที่สุด" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketPage,
});

function MarketPage() {
  return (
    <AppShell title="ราคาตลาดวันนี้" subtitle="อัปเดต 7 ส.ค. 2569 · 08:00 น.">
      <Card className="bg-primary border-0 text-primary-foreground">
        <p className="text-sm text-primary-foreground/85">ทุเรียนหมอนทอง (ส่งออก)</p>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-4xl font-bold">฿128</span>
          <span className="mb-1 text-sm text-primary-foreground/85">/ กก. · ▲ 4.5%</span>
        </div>
        <p className="mt-2 text-xs text-primary-foreground/80">
          ราคาขึ้นต่อเนื่อง 3 วัน — เป็นจังหวะดีในการทยอยขายผลแก่จัด
        </p>
      </Card>

      <SectionTitle>แนวโน้มราคา 7 วัน</SectionTitle>
      <Card>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceTrend}>
              <XAxis dataKey="d" tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="durian" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="mangosteen" stroke="var(--chart-3)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-primary" /> ทุเรียน
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: "var(--chart-3)" }} /> มังคุด
          </span>
        </div>
      </Card>

      <SectionTitle>ราคาตามชนิดและเกรด</SectionTitle>
      <Card className="space-y-3">
        {marketPrices.map((m) => (
          <div key={m.id} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{m.name}</p>
              <p className="text-xs text-muted-foreground">
                {m.market} · {m.updated}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">฿{m.price}</p>
              <p
                className={`text-[11px] ${m.change > 0 ? "text-primary" : m.change < 0 ? "text-destructive" : "text-muted-foreground"}`}
              >
                {m.change > 0 ? "▲" : m.change < 0 ? "▼" : "—"} {Math.abs(m.change)}%
              </p>
            </div>
          </div>
        ))}
      </Card>

      <SectionTitle>ประเมินรายได้จากผลผลิตของคุณ</SectionTitle>
      <Card className="space-y-3">
        {yieldForecast.map((y) => (
          <div key={y.plot} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{y.plot}</p>
              <p className="text-xs text-muted-foreground">
                {y.kg.toLocaleString("th-TH")} กก. × ฿{y.pricePerKg}
              </p>
            </div>
            <span className="text-sm font-semibold text-primary">
              ฿{(y.kg * y.pricePerKg).toLocaleString("th-TH")}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-medium">รวมโดยประมาณ</span>
          <Badge tone="good">
            ฿{yieldForecast.reduce((s, y) => s + y.kg * y.pricePerKg, 0).toLocaleString("th-TH")}
          </Badge>
        </div>
      </Card>
    </AppShell>
  );
}
