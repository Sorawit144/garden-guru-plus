import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
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
import { AppShell, Badge, Card, SectionTitle, baht } from "@/components/AppShell";
import { transactions as initialTransactions } from "@/lib/farm-data";
import { toast } from "sonner";

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
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"income" | "expense">("income");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [kg, setKg] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("garden_guru_transactions");
      if (stored) {
        try {
          setRows(JSON.parse(stored));
        } catch (e) {
          setRows(initialTransactions);
        }
      } else {
        localStorage.setItem("garden_guru_transactions", JSON.stringify(initialTransactions));
        setRows(initialTransactions);
      }
    }
  }, []);

  const income = rows.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const cost = rows.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);

  const save = () => {
    const n = Number(amount);
    if (!title.trim() || !n) {
      toast.error("กรุณากรอกรายการและจำนวนเงิน");
      return;
    }
    
    const thaiDate = new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short" });

    const newTx = {
      id: `new-${Date.now()}`,
      date: thaiDate,
      title: kg ? `${title} (${kg} กก.)` : title,
      category: kind === "income" ? "รายได้" : "ค่าใช้จ่าย",
      amount: kind === "income" ? n : -n,
    };

    const updated = [newTx, ...rows];
    setRows(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("garden_guru_transactions", JSON.stringify(updated));
      window.dispatchEvent(new Event("transactions_updated"));
    }

    setTitle("");
    setAmount("");
    setKg("");
    setOpen(false);
    toast.success("บันทึกรายการเรียบร้อยแล้ว");
  };

  // Recalculate monthly finance chart data dynamically
  const monthlyFinanceComputed = useMemo(() => {
    const augIncome = rows.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const augCost = rows.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

    return [
      { month: "มี.ค.", income: 42000, cost: 18000 },
      { month: "เม.ย.", income: 58000, cost: 21000 },
      { month: "พ.ค.", income: 96000, cost: 27000 },
      { month: "มิ.ย.", income: 74000, cost: 19500 },
      { month: "ก.ค.", income: 88000, cost: 24500 },
      { month: "ส.ค.", income: augIncome, cost: augCost },
    ];
  }, [rows]);

  // Recalculate cost breakdown pie chart dynamically
  const costBreakdownComputed = useMemo(() => {
    let fertilizeVal = 0;
    let laborVal = 0;
    let chemicalVal = 0;
    let energyVal = 0;
    let otherVal = 0;

    rows.filter((t) => t.amount < 0).forEach((t) => {
      const amt = Math.abs(t.amount);
      const name = t.title.toLowerCase();
      if (name.includes("ปุ๋ย") || name.includes("คอก")) {
        fertilizeVal += amt;
      } else if (name.includes("แรง") || name.includes("คนงาน") || name.includes("จ้าง")) {
        laborVal += amt;
      } else if (name.includes("ยา") || name.includes("เคมี") || name.includes("รา") || name.includes("หนอน") || name.includes("แมลง")) {
        chemicalVal += amt;
      } else if (name.includes("น้ำมัน") || name.includes("ไฟ") || name.includes("น้ำ") || name.includes("ปั๊ม")) {
        energyVal += amt;
      } else {
        otherVal += amt;
      }
    });

    const breakdown = [
      { name: "ปุ๋ย", value: fertilizeVal, color: "var(--chart-3)" },
      { name: "แรงงาน", value: laborVal, color: "var(--chart-1)" },
      { name: "สารเคมี", value: chemicalVal, color: "var(--chart-4)" },
      { name: "พลังงาน", value: energyVal, color: "var(--chart-2)" },
    ];

    if (otherVal > 0) {
      breakdown.push({ name: "อื่นๆ", value: otherVal, color: "var(--chart-5)" });
    }

    return breakdown.filter((item) => item.value > 0);
  }, [rows]);

  return (
    <AppShell title="ต้นทุนและรายได้" subtitle="สิงหาคม 2569">
      <div className="grid grid-cols-3 gap-2">
        <Card className="text-center">
          <p className="text-[11px] text-muted-foreground">รายรับ</p>
          <p className="text-sm font-bold text-primary">{baht(income)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-[11px] text-muted-foreground">รายจ่าย</p>
          <p className="text-sm font-bold text-destructive">{baht(Math.abs(cost))}</p>
        </Card>
        <Card className="text-center">
          <p className="text-[11px] text-muted-foreground">กำไร</p>
          <p className="text-sm font-bold">{baht(income + cost)}</p>
        </Card>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">จดบันทึกครั้งนี้</p>
            <p className="text-xs text-muted-foreground">รายรับ รายจ่าย และผลผลิตที่ได้</p>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground active:scale-95 cursor-pointer"
          >
            {open ? "ปิด" : "+ บันทึก"}
          </button>
        </div>
        {open ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {(["income", "expense"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className={`rounded-xl border py-2 text-xs font-medium cursor-pointer ${
                    kind === k ? "border-primary bg-primary-soft text-primary" : "border-border"
                  }`}
                >
                  {k === "income" ? "รายรับ" : "รายจ่าย"}
                </button>
              ))}
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="รายการ เช่น ขายทุเรียนล็อต 4"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder="จำนวนเงิน (บาท)"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <input
                value={kg}
                onChange={(e) => setKg(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder="ผลผลิต (กก.)"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              onClick={save}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground active:scale-[0.99] cursor-pointer hover:opacity-95"
            >
              บันทึกรายการ
            </button>
          </div>
        ) : null}
      </Card>

      <SectionTitle>รายรับ-รายจ่าย 6 เดือน</SectionTitle>
      <Card>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyFinanceComputed}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip
                formatter={(v: number) => baht(v)}
                contentStyle={{ borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="income" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="cost" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <SectionTitle>วิเคราะห์โครงสร้างต้นทุน</SectionTitle>
      <Card>
        {costBreakdownComputed.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-8">ไม่มีรายจ่ายในการคำนวณสัดส่วนต้นทุน</p>
        ) : (
          <>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={costBreakdownComputed} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                    {costBreakdownComputed.map((c) => (
                      <Cell key={c.name} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => baht(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {costBreakdownComputed.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <span className="size-2.5 rounded-full" style={{ background: c.color }} />
                  {c.name} · {baht(c.value)}
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <SectionTitle>รายการล่าสุด</SectionTitle>
      <Card className="space-y-3">
        {rows.map((t) => (
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
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-medium">ทั้งหมด {rows.length} รายการ</span>
          <Badge tone="good">กำไร {baht(income + cost)}</Badge>
        </div>
      </Card>
    </AppShell>
  );
}