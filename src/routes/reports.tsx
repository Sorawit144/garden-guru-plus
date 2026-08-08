import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { AppShell, Card, SectionTitle, baht } from "@/components/AppShell";
import { monthlyFinance, reports } from "@/lib/farm-data";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "รายงานสรุป — สวนอัจฉริยะ" },
      { name: "description", content: "ออกรายงาน PDF และ Excel พร้อมกราฟสรุปผลการดำเนินงานรายเดือน" },
      { property: "og:title", content: "รายงานสรุป — สวนอัจฉริยะ" },
      { property: "og:description", content: "สรุปรายเดือน ต้นทุน ผลผลิต และสุขภาพพืชในรูปแบบรายงาน" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <AppShell title="รายงาน" subtitle="สรุปผลการดำเนินงานของสวน">
      <SectionTitle>กราฟสรุปรายเดือน</SectionTitle>
      <Card>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyFinance}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip formatter={(v: number) => baht(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="income" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <SectionTitle>รายงานที่พร้อมดาวน์โหลด</SectionTitle>
      {reports.map((r) => (
        <Card key={r.id}>
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-lg">
              {r.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{r.title}</p>
              <p className="text-xs text-muted-foreground">{r.desc}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2 text-xs font-medium">
              <FileText className="size-4 text-destructive" /> PDF
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2 text-xs font-medium">
              <FileSpreadsheet className="size-4 text-primary" /> Excel
            </button>
          </div>
        </Card>
      ))}
    </AppShell>
  );
}