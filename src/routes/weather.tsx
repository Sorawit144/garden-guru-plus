import { createFileRoute } from "@tanstack/react-router";
import { Droplets, Sun, Wind, RefreshCw, Compass } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { AppShell, Badge, Card, SectionTitle } from "@/components/AppShell";
import { stageAlerts } from "@/lib/farm-data";
import { usePlots } from "@/hooks/usePlots";

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

// ฟังก์ชันแกะพิกัด Latitude, Longitude จากสตริง GPS
function parseCoordinates(gpsStr: string) {
  const match = gpsStr.match(/(-?\d+\.\d+).*?,\s*(-?\d+\.\d+)/);
  if (match && match[1] && match[2]) {
    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2]),
    };
  }
  return { lat: 12.6086, lng: 102.1035 }; // พิกัดจันทบุรีตั้งต้น
}

function WeatherPage() {
  const { plots } = usePlots();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // เลือกพิกัดอิงตามแปลงแรกของผู้ใช้ (หรือจันทบุรี)
  const coords = useMemo(() => {
    if (plots && plots.length > 0 && plots[0]) {
      return parseCoordinates(plots[0].gps);
    }
    return { lat: 12.6086, lng: 102.1035 };
  }, [plots]);

  const activePlotName = useMemo(() => {
    if (plots && plots.length > 0 && plots[0]) {
      return plots[0].name;
    }
    return "พื้นที่แปลงหลัก (จันทบุรี)";
  }, [plots]);

  useEffect(() => {
    let active = true;
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,uv_index&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
        );
        const data = await res.json();
        if (!active) return;

        const current = data.current;
        const weatherCode = current.weather_code;

        // แมปโมดูล Weather Code ของ Open-Meteo กับคำไทยและอีโมจิ
        const codeMap: Record<number, { text: string; emoji: string }> = {
          0: { text: "แดดจัด ฟ้าใส", emoji: "☀️" },
          1: { text: "ฟ้าโปร่ง", emoji: "🌤️" },
          2: { text: "มีเมฆบางส่วน", emoji: "⛅" },
          3: { text: "มีเมฆครึ้ม", emoji: "☁️" },
          45: { text: "มีหมอกหนา", emoji: "🌫️" },
          48: { text: "มีหมอกและน้ำค้างแข็ง", emoji: "🌫️" },
          51: { text: "ฝนตกปรอยๆ", emoji: "🌧️" },
          53: { text: "ฝนตกปรอยๆ", emoji: "🌧️" },
          55: { text: "ฝนตกปรอยๆ หนาแน่น", emoji: "🌧️" },
          61: { text: "ฝนตกเบาบาง", emoji: "🌧️" },
          63: { text: "ฝนตกปานกลาง", emoji: "🌧️" },
          65: { text: "ฝนตกหนัก", emoji: "🌧️" },
          80: { text: "ฝนไล่ช้างตกเบา", emoji: "🌦️" },
          81: { text: "ฝนไล่ช้างตกปานกลาง", emoji: "🌦️" },
          82: { text: "ฝนไล่ช้างตกหนัก", emoji: "🌦️" },
          95: { text: "พายุฝนฟ้าคะนอง", emoji: "⛈️" },
          96: { text: "พายุฟ้าคะนองพร้อมลูกเห็บตก", emoji: "⛈️" },
          99: { text: "พายุฟ้าคะนองพร้อมลูกเห็บตกหนัก", emoji: "⛈️" },
        };

        const currentInfo = codeMap[weatherCode] || { text: "มีเมฆบางส่วน", emoji: "⛅" };

        // ดึง 6 ชั่วโมงถัดไป
        const hourly = [];
        const now = new Date();
        const currentHourIndex = data.hourly.time.findIndex((t: string) => {
          const d = new Date(t);
          return d.getHours() === now.getHours() && d.getDate() === now.getDate();
        }) || 0;

        for (let i = 0; i < 6; i++) {
          const idx = currentHourIndex + i;
          if (data.hourly.time[idx]) {
            const timeStr = new Date(data.hourly.time[idx]).toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            });
            hourly.push({
              t: timeStr,
              temp: Math.round(data.hourly.temperature_2m[idx]),
              rain: data.hourly.precipitation_probability[idx] || 0,
            });
          }
        }

        // ดึงพยากรณ์ล่วงหน้า 5 วัน
        const daily = [];
        const days = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสฯ", "ศุกร์", "เสาร์"];
        for (let i = 0; i < 5; i++) {
          if (data.daily.time[i]) {
            const dateObj = new Date(data.daily.time[i]);
            const isToday = i === 0;
            const isTomorrow = (d: Date) => {
              const tom = new Date();
              tom.setDate(tom.getDate() + 1);
              return d.getDate() === tom.getDate() && d.getMonth() === tom.getMonth();
            };
            const dayLabel = isToday ? "วันนี้" : isTomorrow(dateObj) ? "พรุ่งนี้" : days[dateObj.getDay()];
            const code = data.daily.weather_code[i];
            const info = codeMap[code] || { text: "มีเมฆบางส่วน", emoji: "⛅" };

            daily.push({
              d: dayLabel,
              hi: Math.round(data.daily.temperature_2m_max[i]),
              lo: Math.round(data.daily.temperature_2m_min[i]),
              rain: data.daily.precipitation_probability_max[i] || 0,
              icon: info.emoji,
            });
          }
        }

        setWeatherData({
          temp: Math.round(current.temperature_2m),
          condition: currentInfo.text,
          emoji: currentInfo.emoji,
          humidity: current.relative_humidity_2m,
          wind: current.wind_speed_10m,
          uv: current.uv_index || 0,
          rainChance: hourly[0]?.rain || 0,
          hourly,
          daily,
        });
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch weather: ", err);
        setLoading(false);
      }
    };

    fetchWeather();
    return () => {
      active = false;
    };
  }, [coords]);

  if (loading || !weatherData) {
    return (
      <AppShell title="สภาพอากาศ" subtitle="กำลังโหลดข้อมูลสภาพอากาศจริง...">
        <div className="flex h-64 flex-col items-center justify-center gap-2">
          <RefreshCw className="size-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground">เชื่อมต่อดาวเทียมตรวจพยากรณ์อากาศ...</p>
        </div>
      </AppShell>
    );
  }

  const w = weatherData;

  return (
    <AppShell title="สภาพอากาศ" subtitle={`อิงตามแปลง: ${activePlotName}`}>
      <Card className="bg-primary border-0 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-5xl font-bold">{w.temp}°</p>
            <p className="mt-1 text-sm text-primary-foreground/85">{w.condition}</p>
          </div>
          <span className="text-6xl">{w.emoji}</span>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {[
            { l: "ความชื้น", v: `${w.humidity}%` },
            { l: "ลม", v: `${Math.round(w.wind)} กม/ชม` },
            { l: "ดัชนี UV", v: `${Math.round(w.uv)}` },
            { l: "ฝนวันนี้", v: `${w.rainChance}%` },
          ].map((i) => (
            <div key={i.l} className="rounded-xl bg-white/15 py-2">
              <p className="text-sm font-bold">{i.v}</p>
              <p className="text-[10px] text-primary-foreground/80">{i.l}</p>
            </div>
          ))}
        </div>
      </Card>

      {w.rainChance > 50 ? (
        <Card className="flex items-start gap-3 border-primary/30 bg-primary/10">
          <span className="text-xl">⛈️</span>
          <div>
            <p className="text-sm font-semibold">แจ้งเตือนฝน</p>
            <p className="text-xs text-muted-foreground">
              มีโอกาสเกิดฝนตกสูง ({w.rainChance}%) ในพื้นที่สวนของคุณ ควรงดฉีดพ่นเคมีภัณฑ์เพราะจะโดนน้ำฝนชะล้าง
            </p>
          </div>
        </Card>
      ) : (
        <Card className="flex items-start gap-3 border-emerald-500/30 bg-emerald-500/10">
          <span className="text-xl">☀️</span>
          <div>
            <p className="text-sm font-semibold">สภาพอากาศเหมาะสม</p>
            <p className="text-xs text-muted-foreground">
              ท้องฟ้าแจ่มใส ลมสงบ เหมาะสมกับการใส่ปุ๋ย รดน้ำ และฉีดบำรุงทางใบ
            </p>
          </div>
        </Card>
      )}

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
          {w.hourly.map((h: any, idx: number) => (
            <div key={idx} className="min-w-16 rounded-xl bg-muted/60 px-3 py-2 text-center">
              <p className="text-[11px] text-muted-foreground">{h.t}</p>
              <p className="text-sm font-semibold">{h.temp}°</p>
              <p className="text-[11px] text-primary">ฝน {h.rain}%</p>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle>พยากรณ์ 5 วัน</SectionTitle>
      <Card className="space-y-3">
        {w.daily.map((d: any, idx: number) => (
          <div key={idx} className="flex items-center gap-3">
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
          <p className="text-sm">
            {w.rainChance > 50
              ? "งดรดน้ำในวันนี้ ประหยัดน้ำและพลังงานเครื่องสูบได้ทันที"
              : "ควรเปิดระบบสปริงเกอร์รดน้ำช่วงเช้า/เย็น ตามปกติ"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Wind className="size-5 text-primary" />
          <p className="text-sm">
            {w.wind > 15
              ? `ลมแรงประมาณ ${Math.round(w.wind)} กม/ชม หลีกเลี่ยงการฉีดพ่นยาเพื่อกันละอองฟุ้งกระจาย`
              : `ลมสงบโชยอ่อน (${Math.round(w.wind)} กม/ชม) ฉีดพ่นบำรุงพืชทางใบได้เหมาะสม`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Sun className="size-5 text-primary" />
          <p className="text-sm">
            {w.uv > 6
              ? `UV ระดับสูง (${Math.round(w.uv)}) เกษตรกรควรสวมหมวกและทำกิจกรรมในร่มหลังเวลา 10:00 น.`
              : `UV ระดับต่ำถึงปานกลาง ทำงานกลางแจ้งได้ยาวขึ้น`}
          </p>
        </div>
      </Card>
    </AppShell>
  );
}