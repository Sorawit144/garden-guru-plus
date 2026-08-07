import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Badge, Card, SectionTitle } from "@/components/AppShell";
import { recommendations } from "@/lib/farm-data";

export const Route = createFileRoute("/recommend")({
  head: () => ({
    meta: [
      { title: "คำแนะนำอัจฉริยะ — สวนอัจฉริยะ" },
      { name: "description", content: "AI แนะนำว่าวันนี้ควรรดน้ำ ใส่ปุ๋ย ฉีดยา หรือเก็บเกี่ยวหรือยัง" },
      { property: "og:title", content: "คำแนะนำอัจฉริยะ — สวนอัจฉริยะ" },
      { property: "og:description", content: "คำแนะนำการดูแลสวนรายวันจากข้อมูลอากาศและสภาพแปลง" },
    ],
  }),
  component: RecommendPage,
});

function RecommendPage() {
  return (
    <AppShell title="คำแนะนำอัจฉริยะ" subtitle="วิเคราะห์จากอากาศ ความชื้นดิน และอายุพืช">
      <SectionTitle>สรุปสำหรับวันนี้</SectionTitle>
      {recommendations.map((r) => (
        <Card key={r.id}>
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-xl">
              {r.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{r.title}</p>
                <Badge tone={r.tone as "good" | "warn" | "info"}>{r.answer}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{r.reason}</p>
            </div>
          </div>
        </Card>
      ))}

      <SectionTitle>ปัจจัยที่ AI ใช้ตัดสินใจ</SectionTitle>
      <Card className="grid grid-cols-2 gap-3">
        {[
          { l: "ความชื้นดิน", v: "68%" },
          { l: "โอกาสฝน 6 ชม.", v: "65%" },
          { l: "อุณหภูมิสูงสุด", v: "34°C" },
          { l: "ความเร็วลม", v: "12 กม./ชม." },
          { l: "รอบปุ๋ยล่าสุด", v: "21 วัน" },
          { l: "อายุผลทุเรียน", v: "108 วัน" },
        ].map((f) => (
          <div key={f.l} className="rounded-xl bg-muted/60 p-3">
            <p className="text-[11px] text-muted-foreground">{f.l}</p>
            <p className="text-sm font-semibold">{f.v}</p>
          </div>
        ))}
      </Card>
    </AppShell>
  );
}