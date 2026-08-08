import { createFileRoute } from "@tanstack/react-router";
import { Bug, Camera, FlaskConical, Image as ImageIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { AppShell, Badge, Card, Progress, SectionTitle } from "@/components/AppShell";
import { diagnoseResult } from "@/lib/farm-data";

export const Route = createFileRoute("/diagnose")({
  head: () => ({
    meta: [
      { title: "AI วิเคราะห์โรคพืช — สวนอัจฉริยะ" },
      { name: "description", content: "ถ่ายรูปใบพืชเพื่อวิเคราะห์โรค แมลง และการขาดธาตุอาหาร พร้อมวิธีรักษา" },
      { property: "og:title", content: "AI วิเคราะห์โรคพืช — สวนอัจฉริยะ" },
      { property: "og:description", content: "วิเคราะห์โรคพืชจากรูปถ่ายพร้อมระดับความรุนแรงและวิธีรักษา" },
    ],
  }),
  component: DiagnosePage,
});

type State = "idle" | "loading" | "done";

function DiagnosePage() {
  const [state, setState] = useState<State>("idle");

  const run = () => {
    setState("loading");
    setTimeout(() => setState("done"), 1600);
  };

  return (
    <AppShell title="AI ตรวจโรคพืช" subtitle="ถ่ายรูปใบหรือผล แล้วให้ AI วิเคราะห์ให้">
      <Card className="flex flex-col items-center gap-3 border-dashed py-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary-soft text-3xl">
          🌿
        </span>
        <p className="text-sm text-muted-foreground">
          ถ่ายภาพให้เห็นใบชัดเจนในที่แสงสว่างเพียงพอ
        </p>
        <div className="flex w-full gap-2">
          <button
            onClick={run}
            className="bg-primary flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-primary-foreground"
          >
            <Camera className="size-4" /> ถ่ายรูป
          </button>
          <button
            onClick={run}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold"
          >
            <ImageIcon className="size-4" /> เลือกรูป
          </button>
        </div>
      </Card>

      {state === "loading" ? (
        <Card className="flex items-center gap-3">
          <Loader2 className="size-5 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">กำลังวิเคราะห์ภาพด้วย AI…</p>
        </Card>
      ) : null}

      {state === "done" ? (
        <>
          <SectionTitle>ผลการวิเคราะห์</SectionTitle>
          <Card>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{diagnoseResult.disease}</p>
                <p className="text-xs text-muted-foreground">
                  ความมั่นใจ {diagnoseResult.confidence}%
                </p>
              </div>
              <Badge tone="warn">ความรุนแรง: {diagnoseResult.severity}</Badge>
            </div>
            <div className="mt-3">
              <Progress value={diagnoseResult.confidence} />
            </div>
          </Card>

          <Card className="space-y-3">
            <div className="flex items-start gap-3">
              <Bug className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="text-sm font-medium">แมลงศัตรูพืช</p>
                <p className="text-xs text-muted-foreground">{diagnoseResult.pest}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FlaskConical className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="text-sm font-medium">ธาตุอาหาร</p>
                <p className="text-xs text-muted-foreground">{diagnoseResult.nutrient}</p>
              </div>
            </div>
          </Card>

          <SectionTitle>วิธีรักษาที่แนะนำ</SectionTitle>
          <Card>
            <ol className="space-y-3">
              {diagnoseResult.treatment.map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <p className="text-sm text-foreground/90">{t}</p>
                </li>
              ))}
            </ol>
          </Card>

          <button
            onClick={() => setState("idle")}
            className="w-full rounded-xl border border-border py-3 text-sm font-medium"
          >
            วิเคราะห์รูปใหม่
          </button>
        </>
      ) : null}

      <SectionTitle>ประวัติการวิเคราะห์</SectionTitle>
      <Card className="space-y-3">
        {[
          { d: "5 ส.ค. 2569", n: "ใบจุดสนิม (ทุเรียน)", s: "เบา" },
          { d: "28 ก.ค. 2569", n: "เพลี้ยไฟ (มังคุด)", s: "ปานกลาง" },
          { d: "19 ก.ค. 2569", n: "ขาดธาตุเหล็ก (ลำไย)", s: "เบา" },
        ].map((h) => (
          <div key={h.d} className="flex items-center justify-between">
            <div>
              <p className="text-sm">{h.n}</p>
              <p className="text-xs text-muted-foreground">{h.d}</p>
            </div>
            <Badge tone={h.s === "เบา" ? "good" : "warn"}>{h.s}</Badge>
          </div>
        ))}
      </Card>
    </AppShell>
  );
}