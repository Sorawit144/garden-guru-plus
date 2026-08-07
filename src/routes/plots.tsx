import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { AppShell, Badge, Card, Progress } from "@/components/AppShell";
import { plots } from "@/lib/farm-data";

export const Route = createFileRoute("/plots")({
  head: () => ({
    meta: [
      { title: "จัดการแปลง — สวนอัจฉริยะ" },
      { name: "description", content: "เพิ่มแปลงจาก GPS ดูชนิดพืช อายุ จำนวนต้น พื้นที่ และประวัติการดูแล" },
      { property: "og:title", content: "จัดการแปลง — สวนอัจฉริยะ" },
      { property: "og:description", content: "จัดการข้อมูลแปลงเพาะปลูกและประวัติการดูแลทั้งหมด" },
    ],
  }),
  component: PlotsPage,
});

function PlotsPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <AppShell title="จัดการแปลง" subtitle={`ทั้งหมด ${plots.length} แปลง · ${plots.reduce((s, p) => s + p.area, 0)} ไร่`}>
      <button className="gradient-leaf flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-card)]">
        <Plus className="size-4" /> เพิ่มแปลงจากตำแหน่ง GPS
      </button>

      {plots.map((p) => (
        <Card key={p.id}>
          <div className="flex items-start gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-2xl">
              {p.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.crop}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="size-3" /> {p.gps}
              </p>
            </div>
            <Badge tone={p.health > 80 ? "good" : p.health > 65 ? "warn" : "bad"}>
              {p.health > 80 ? "สมบูรณ์" : p.health > 65 ? "เฝ้าระวัง" : "ต้องดูแล"}
            </Badge>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-muted/60 p-2 text-center">
            <div>
              <p className="text-sm font-semibold">
                {Math.floor(p.ageMonths / 12)} ปี {p.ageMonths % 12} ด.
              </p>
              <p className="text-[11px] text-muted-foreground">อายุพืช</p>
            </div>
            <div>
              <p className="text-sm font-semibold">{p.trees}</p>
              <p className="text-[11px] text-muted-foreground">จำนวนต้น</p>
            </div>
            <div>
              <p className="text-sm font-semibold">{p.area} ไร่</p>
              <p className="text-[11px] text-muted-foreground">พื้นที่</p>
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>สุขภาพต้นไม้</span>
              <span>{p.health}%</span>
            </div>
            <Progress value={p.health} />
          </div>

          <p className="mt-3 text-xs text-muted-foreground">ล่าสุด: {p.lastCare}</p>

          <button
            onClick={() => setOpen(open === p.id ? null : p.id)}
            className="mt-3 w-full rounded-xl border border-border py-2 text-xs font-medium text-primary"
          >
            {open === p.id ? "ซ่อนประวัติการดูแล" : "ดูประวัติการดูแล"}
          </button>

          {open === p.id ? (
            <ul className="mt-3 space-y-3 border-l-2 border-primary-soft pl-3">
              {p.history.map((h, i) => (
                <li key={i}>
                  <p className="text-xs font-semibold">
                    {h.action} <span className="font-normal text-muted-foreground">· {h.date}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{h.note}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      ))}
    </AppShell>
  );
}