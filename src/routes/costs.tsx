import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { AppShell, Card, SectionTitle, baht } from "@/components/AppShell";
import { costBreakdown, monthlyFinance, transactions } from "@/lib/farm-data";

export const Route = createFileRoute("/costs")({
  head: () => ({
    meta: [
      { title: "จัดการต้นทุน — สวนอัจฉริยะ" },
      { name: "description", content: "บันทึกรายรับ รายจ่าย ต้นทุน กำไร และวิเคราะห์โครงสร้างต้นทุนของสวน" },
      { property: "og:title", content: "จัดการต้นทุน — สวนอัจฉริยะ" },
      { property: "og:description", content: "ดูรายรับรายจ่ายและกำไรของสวนแบบรายเดือน" },
    ],
  }),
  component: CostsPage,
});

function CostsPage() {
  const income = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const cost = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);

  return (
    <AppShell title="ต้นทุนและรายได้" subtitle="สิงหาคม 2569">
      <div className="grid grid-cols-3 gap-2">
        <Card className="text-center">
          <p className="text-[11px] text-muted-foreground">รายรับ</p>
          <p className="text-sm font-bold text-primary">{baht(income)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-[11px] text-muted-foreground">รายจ่าย</p>
          <p className="text-sm font-bold text-destructive">{baht(cost)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-[11px] text-muted-foreground">กำไร</p>
          <p className="text-sm font-bold">{baht(income + cost)}</p>
        </Card>
      </div>

      <SectionTitle>รายรับ-รายจ่าย 6 เดือน</SectionTitle>
      <Card>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyFinance}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip
                formatter={(v: number) => baht(v)}
                contentStyle={{ borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="income" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="cost" fill="var(--color-sun)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <SectionTitle>วิเคราะห์โครงสร้างต้นทุน</SectionTitle>
      <Card>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={costBreakdown} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                {costBreakdown.map((c) => (
                  <Cell key={c.name} fill={c.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => baht(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {costBreakdown.map((c) => (
            <div key={c.name} className="flex items-center gap-2 text-xs">
              <span className="size-2.5 rounded-full" style={{ background: c.color }} />
              {c.name} · {baht(c.value)}
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle>รายการล่าสุด</SectionTitle>
      <Card className="space-y-3">
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-sm">
              {t.amount > 0 ? "💵" : "🧾"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{t.title}</p>
              <p className="text-xs text-muted-foreground">
                {t.date} · {t.category}
              </p>
            </div>
            <span
              className={`text-sm font-semibold ${t.amount > 0 ? "text-primary" : "text-destructive"}`}
            >
              {baht(t.amount)}
            </span>
          </div>
        ))}
      </Card>
    </AppShell>
  );
}