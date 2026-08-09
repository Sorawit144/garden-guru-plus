import { createFileRoute } from "@tanstack/react-router";
import { Droplets, Sun, Wind } from "lucide-react";
import { AppShell, Badge, Card, SectionTitle } from "@/components/AppShell";
import { stageAlerts, weather } from "@/lib/farm-data";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "สภาพอากาศสวน — สวนอัจฉริยะ" },
      { name: "description", content: "อุณหภูมิ ฝน ความชื้น ลม ค่า UV และการแจ้งเตือนฝนสำหรับพื้นที่สวนของคุณ" },
      { property: "og:title", content: "สภาพอากาศสวน — สวนอัจฉริยะ" },
      { property: "og:description", content: "พยากรณ์อากาศรายชั่วโมงและ 5 วัน พร้อมเตือนฝนตกหนัก" },
    ],
  }),
  component: WeatherPage,
});

function WeatherPage() {
  const w = weather.now;
  return (
    <AppShell title="สภาพอากาศ" subtitle="ตำบลบางกะปิ · อัปเดตเมื่อ 5 นาทีที่แล้ว">
      <Card className="bg-primary border-0 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-5xl font-bold">{w.temp}°</p>
            <p className="mt-1 text-sm text-primary-foreground/85">{w.condition}</p>
          </div>
          <span className="text-6xl">🌦️</span>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {[
            { l: "ความชื้น", v: `${w.humidity}%` },
            { l: "ลม", v: `${w.wind}` },
            { l: "UV", v: `${w.uv}` },
            { l: "ฝน", v: `${w.rainChance}%` },
          ].map((i) => (
            <div key={i.l} className="rounded-xl bg-white/15 py-2">
              <p className="text-sm font-bold">{i.v}</p>
              <p className="text-[11px] text-primary-foreground/80">{i.l}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex items-start gap-3 border-primary/30 bg-primary/10">
        <span className="text-xl">⛈️</span>
        <div>
          <p className="text-sm font-semibold">แจ้งเตือนฝน</p>
          <p className="text-xs text-muted-foreground">
            คาดว่าฝนตกหนักช่วง 15:00–18:00 น. ควรงดฉีดพ่นสารและเก็บอุปกรณ์เข้าที่ร่ม
          </p>
        </div>
      </Card>

      <SectionTitle>เตือนก่อนลงมือทำงาน</SectionTitle>
      <div className="space-y-3">
        {stageAlerts.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-lg">
                {a.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{a.stage}</p>
                  <Badge tone={a.tone}>{a.verdict}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {a.plot} · {a.when}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{a.detail}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle>รายชั่วโมง</SectionTitle>
      <Card>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {weather.hourly.map((h) => (
            <div key={h.t} className="min-w-16 rounded-xl bg-muted/60 px-3 py-2 text-center">
              <p className="text-[11px] text-muted-foreground">{h.t}</p>
              <p className="text-sm font-semibold">{h.temp}°</p>
              <p className="text-[11px] text-primary">{h.rain}%</p>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle>พยากรณ์ 5 วัน</SectionTitle>
      <Card className="space-y-3">
        {weather.daily.map((d) => (
          <div key={d.d} className="flex items-center gap-3">
            <span className="w-20 text-sm">{d.d}</span>
            <span className="text-lg">{d.icon}</span>
            <span className="flex-1 text-xs text-primary">ฝน {d.rain}%</span>
            <span className="text-sm font-medium">
              {d.hi}° <span className="text-muted-foreground">{d.lo}°</span>
            </span>
          </div>
        ))}
      </Card>

      <SectionTitle>ผลต่อการทำสวน</SectionTitle>
      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <Droplets className="size-5 text-primary" />
          <p className="text-sm">งดรดน้ำวันนี้ ประหยัดน้ำได้ประมาณ 4,500 ลิตร</p>
        </div>
        <div className="flex items-center gap-3">
          <Wind className="size-5 text-primary" />
          <p className="text-sm">ลมปานกลาง ยังฉีดพ่นได้ในช่วงเช้าตรู่</p>
        </div>
        <div className="flex items-center gap-3">
          <Sun className="size-5 text-primary" />
          <p className="text-sm">UV สูง ควรทำงานกลางแจ้งก่อน 10:00 น.</p>
        </div>
      </Card>
    </AppShell>
  );
}