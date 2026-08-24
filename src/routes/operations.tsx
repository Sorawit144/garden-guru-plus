import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  CircleAlert,
  Filter,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell, Badge, Card, SectionTitle } from "@/components/AppShell";
import { useOrganizationPlan } from "@/hooks/useOrganizationPlan";
import { OPERATION_DECISIONS } from "@/lib/organization-data";
import { usePlots } from "@/hooks/usePlots";
import { toast } from "sonner";

export const Route = createFileRoute("/operations")({ component: OperationsPage });

type DecisionStatus = "pending" | "approved" | "deferred";

function OperationsPage() {
  const { tier } = useOrganizationPlan();
  const { plots } = usePlots();
  const [selectedPlot, setSelectedPlot] = useState("all");
  const [statuses, setStatuses] = useState<Record<string, DecisionStatus>>({});
  const decisions = useMemo(
    () =>
      OPERATION_DECISIONS.filter(
        (decision) => selectedPlot === "all" || decision.plotId === selectedPlot,
      ),
    [selectedPlot],
  );
  const plotName = (id: string) =>
    plots.find((plot) => plot.id === id)?.name ?? "แปลงที่ยังไม่ได้ระบุ";
  const updateStatus = (id: string, status: DecisionStatus) => {
    setStatuses((current) => ({ ...current, [id]: status }));
    toast.success(status === "approved" ? "อนุมัติรายการแล้ว" : "เลื่อนรายการเพื่อทบทวนแล้ว");
  };

  if (tier !== "promax")
    return (
      <AppShell title="ศูนย์ปฏิบัติการ 360" subtitle="ภาพรวมและการตัดสินใจของผู้จัดการ">
        <Card className="py-10 text-center">
          <LockKeyhole className="mx-auto mb-3 size-9 text-primary" />
          <p className="font-semibold">ศูนย์ปฏิบัติการ 360 สำหรับ Pro Max</p>
          <p className="mt-1 text-sm text-muted-foreground">
            อัปเกรดเป็น Pro Max เพื่อดูข้อมูลทุกแปลงและตัดสินใจอนุมัติงาน
          </p>
        </Card>
      </AppShell>
    );

  return (
    <AppShell
      title="ศูนย์ปฏิบัติการ 360"
      subtitle="มุมมองผู้จัดการ: แปลง ทีม ความเสี่ยง และการตัดสินใจ"
    >
      <Card className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Filter className="size-4 text-primary" />
          <p className="text-sm font-semibold">กรองตามแปลง</p>
        </div>
        <select
          value={selectedPlot}
          onChange={(event) => setSelectedPlot(event.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
        >
          <option value="all">ทุกแปลง</option>
          {plots.map((plot) => (
            <option key={plot.id} value={plot.id}>
              {plot.name}
            </option>
          ))}
        </select>
      </Card>
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">ต้องตัดสินใจ</p>
          <p className="mt-1 text-xl font-bold text-warning">
            {
              decisions.filter(
                (decision) => !statuses[decision.id] || statuses[decision.id] === "pending",
              ).length
            }
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">อนุมัติแล้ว</p>
          <p className="mt-1 text-xl font-bold text-primary">
            {Object.values(statuses).filter((status) => status === "approved").length}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">แปลงที่ดู</p>
          <p className="mt-1 text-xl font-bold">{selectedPlot === "all" ? plots.length : 1}</p>
        </Card>
      </div>
      <SectionTitle>รายการที่ผู้จัดการต้องตัดสินใจ</SectionTitle>
      <div className="space-y-3">
        {decisions.map((decision) => {
          const status = statuses[decision.id] ?? "pending";
          return (
            <Card key={decision.id} className="p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <CircleAlert className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{decision.title}</p>
                    <Badge tone={decision.priority === "สูง" ? "bad" : "warn"}>
                      {decision.priority}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {plotName(decision.plotId)} · {decision.team}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">{decision.detail}</p>
                  <p className="mt-2 text-xs font-medium text-primary">ผู้เสนอ: {decision.owner}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 border-t border-border pt-3">
                {status === "pending" ? (
                  <>
                    <button
                      onClick={() => updateStatus(decision.id, "approved")}
                      className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground"
                    >
                      <CheckCircle2 className="size-4" /> อนุมัติ
                    </button>
                    <button
                      onClick={() => updateStatus(decision.id, "deferred")}
                      className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-border py-2 text-xs font-semibold text-muted-foreground"
                    >
                      <RotateCcw className="size-4" /> ขอทบทวน
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-medium text-primary">
                    <ShieldCheck className="size-4" />
                    {status === "approved" ? "อนุมัติแล้ว" : "ส่งกลับให้ทบทวนแล้ว"}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
