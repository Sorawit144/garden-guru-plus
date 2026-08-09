import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Badge, Card, SectionTitle, baht } from "@/components/AppShell";
import { dronePresets, plots } from "@/lib/farm-data";

export const Route = createFileRoute("/fertilizer")({
  head: () => ({
    meta: [
      { title: "คำนวณปุ๋ยโดรน ลดต้นทุน — สวนอัจฉริยะ" },
      { name: "description", content: "คำนวณปริมาณปุ๋ยและน้ำที่เหมาะสมสำหรับพ่นด้วยโดรน ลดการใช้ปุ๋ยเคมีเกินจำเป็นและประหยัดต้นทุนต่อไร่" },
      { property: "og:title", content: "คำนวณปุ๋ยโดรน ลดต้นทุน — สวนอัจฉริยะ" },
      { property: "og:description", content: "ใส่พื้นที่และสูตรปุ๋ย ระบบคำนวณปริมาณต่อถังโดรนให้ทันที" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FertilizerPage,
});

const PRICE_PER_KG = 28;
const TANK_LITERS = 20;

function FertilizerPage() {
  const [presetId, setPresetId] = useState(dronePresets[0]!.id);
  const [area, setArea] = useState(8);
  const preset = dronePresets.find((p) => p.id === presetId)!;

  const total = Math.round(preset.ratePerRai * area * 10) / 10;
  const tanks = Math.max(1, Math.ceil((area * preset.ratePerRai) / 8));
  const perTank = Math.round((total / tanks) * 10) / 10;
  const water = tanks * TANK_LITERS;
  const cost = Math.round(total * PRICE_PER_KG);
  const manualCost = Math.round(total * 1.35 * PRICE_PER_KG) + area * 250;
  const saving = manualCost - cost;

  return (
    <AppShell title="คำนวณปุ๋ยโดรน" subtitle="ลดต้นทุนปุ๋ยเคมี ใช้พอดีกับความต้องการพืช">
      <Card className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">เลือกพืชและระยะการเจริญเติบโต</p>
          <div className="mt-2 space-y-2">
            {dronePresets.map((p) => (
              <button
                key={p.id}
                onClick={() => setPresetId(p.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                  p.id === presetId
                    ? "border-primary bg-primary-soft"
                    : "border-border bg-card"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {p.crop} · {p.stage}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    สูตร {p.formula} · {p.ratePerRai} กก./ไร่
                  </p>
                </div>
                {p.id === presetId ? <Badge tone="good">เลือกอยู่</Badge> : null}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">พื้นที่ที่จะพ่น</p>
            <p className="text-sm font-semibold text-primary">{area} ไร่</p>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            value={area}
            onChange={(e) => setArea(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--color-primary)]"
            aria-label="พื้นที่ (ไร่)"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {plots.map((p) => (
              <button
                key={p.id}
                onClick={() => setArea(p.area)}
                className="rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground"
              >
                {p.name} ({p.area} ไร่)
              </button>
            ))}
          </div>
        </div>
      </Card>

      <SectionTitle>ผลการคำนวณ</SectionTitle>
      <Card className="bg-primary border-0 text-primary-foreground">
        <p className="text-sm text-primary-foreground/85">ปุ๋ยที่ต้องใช้ทั้งหมด</p>
        <p className="mt-1 text-4xl font-bold">{total} กก.</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { l: "จำนวนเที่ยวบิน", v: `${tanks}` },
            { l: "ปุ๋ย/ถัง", v: `${perTank} กก.` },
            { l: "น้ำรวม", v: `${water} ล.` },
          ].map((i) => (
            <div key={i.l} className="rounded-xl bg-white/15 py-2">
              <p className="text-sm font-bold">{i.v}</p>
              <p className="text-[11px] text-primary-foreground/80">{i.l}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">ต้นทุนปุ๋ยแบบพ่นโดรน</span>
          <span className="font-semibold">{baht(cost)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">หว่านมือ (ปุ๋ยเกิน 35% + ค่าแรง)</span>
          <span className="font-semibold text-destructive">{baht(manualCost)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-medium">ประหยัดได้</span>
          <Badge tone="good">{baht(saving)}</Badge>
        </div>
      </Card>

      <Card className="border-primary/30 bg-primary/10">
        <p className="text-sm font-semibold">คำแนะนำการบิน</p>
        <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
          <li>• ความสูงบิน 2.5–3 ม. เหนือทรงพุ่ม ความเร็ว 3–4 ม./วินาที</li>
          <li>• พ่นช่วง 06:00–09:00 น. ลมต่ำกว่า 10 กม./ชม. ลดการปลิว</li>
          <li>• ผสมปุ๋ย {perTank} กก. ต่อน้ำ {TANK_LITERS} ลิตร คนให้ละลายหมดก่อนเติมถัง</li>
          <li>• เว้นระยะจากแหล่งน้ำอย่างน้อย 10 เมตร</li>
        </ul>
      </Card>
    </AppShell>
  );
}
