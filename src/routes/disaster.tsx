import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Badge, Card, Progress, SectionTitle, baht } from "@/components/AppShell";
import { damageRecords, disasterAreas, disasterStatus } from "@/lib/farm-data";

export const Route = createFileRoute("/disaster")({
  head: () => ({
    meta: [
      { title: "น้ำท่วมและภัยแล้ง — สวนอัจฉริยะ" },
      { name: "description", content: "ติดตามระดับน้ำ ความชื้นดิน ความเสี่ยงน้ำท่วมและภัยแล้งในแปลงและพื้นที่รอบข้าง พร้อมบันทึกหลักฐานขอชดเชยความเสียหาย" },
      { property: "og:title", content: "น้ำท่วมและภัยแล้ง — สวนอัจฉริยะ" },
      { property: "og:description", content: "เฝ้าระวังภัยธรรมชาติและเก็บหลักฐานความเสียหายไว้ใช้ยื่นขอชดเชย" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DisasterPage,
});

function DisasterPage() {
  const s = disasterStatus;
  return (
    <AppShell title="น้ำท่วม & ภัยแล้ง" subtitle="ต.บางกะปิ · อัปเดตทุก 1 ชม.">
      <Card className="bg-primary border-0 text-primary-foreground">
        <p className="text-sm text-primary-foreground/85">สถานะพื้นที่ตอนนี้</p>
        <p className="mt-1 text-2xl font-bold">{s.level}</p>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {[
            { l: "ระดับน้ำ", v: `${s.waterLevel} ม.` },
            { l: "เปลี่ยนแปลง", v: `+${s.waterLevelChange} ม.` },
            { l: "ชื้นดิน", v: `${s.soilMoisture}%` },
            { l: "ฝน 7 วัน", v: `${s.rain7d} มม.` },
          ].map((i) => (
            <div key={i.l} className="rounded-xl bg-white/15 py-2">
              <p className="text-sm font-bold">{i.v}</p>
              <p className="text-[11px] text-primary-foreground/80">{i.l}</p>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle>ความเสี่ยงรายพื้นที่</SectionTitle>
      <div className="space-y-3">
        {disasterAreas.map((a) => (
          <Card key={a.id}>
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-lg">
                {a.status === "เสี่ยงแล้ง" ? "🌵" : a.status === "ปกติ" ? "✅" : "🌊"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{a.name}</p>
                <p className="truncate text-xs text-muted-foreground">{a.note}</p>
              </div>
              <Badge tone={a.risk > 60 ? "bad" : a.risk > 35 ? "warn" : "good"}>{a.status}</Badge>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Progress value={a.risk} />
              <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">{a.risk}%</span>
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle>บันทึกความเสียหาย (ใช้เป็นหลักฐาน)</SectionTitle>
      <div className="space-y-3">
        {damageRecords.map((d) => (
          <Card key={d.id}>
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-lg">
                📋
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{d.event}</p>
                <p className="text-xs text-muted-foreground">
                  {d.date} · {d.plot} · {d.area} ไร่
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  ภาพถ่ายพร้อมพิกัด {d.photos} รูป · ประเมินความเสียหาย{" "}
                  <span className="font-medium text-destructive">{baht(-d.loss)}</span>
                </p>
              </div>
              <Badge tone="info">{d.status}</Badge>
            </div>
          </Card>
        ))}
        <button className="w-full rounded-2xl border border-dashed border-primary/40 bg-primary-soft py-3 text-sm font-medium text-primary active:scale-[0.99]">
          + บันทึกความเสียหายใหม่ (ถ่ายรูป + พิกัด)
        </button>
      </div>

      <Card className="border-primary/30 bg-primary/10">
        <p className="text-sm font-semibold">เอกสารขอชดเชย</p>
        <p className="mt-1 text-xs text-muted-foreground">
          ระบบรวมภาพถ่าย พิกัด GPS วันเวลา และข้อมูลปริมาณฝน/ระดับน้ำ เป็นไฟล์ PDF
          สำหรับยื่นเกษตรอำเภอหรือบริษัทประกันได้ทันที
        </p>
        <button className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground active:scale-[0.99]">
          สร้างเอกสาร PDF
        </button>
      </Card>
    </AppShell>
  );
}
