import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Card, SectionTitle } from "@/components/AppShell";

export const Route = createFileRoute("/more")({
  head: () => ({
    meta: [
      { title: "เมนูทั้งหมด — สวนอัจฉริยะ" },
      { name: "description", content: "เข้าถึงทุกฟีเจอร์: อากาศ ปฏิทิน ต้นทุน ผลผลิต แจ้งเตือน ชุมชน และรายงาน" },
      { property: "og:title", content: "เมนูทั้งหมด — สวนอัจฉริยะ" },
      { property: "og:description", content: "รวมทุกเครื่องมือจัดการสวนไว้ในหน้าเดียว" },
    ],
  }),
  component: MorePage,
});

const menu = [
  { to: "/recommend", icon: "🤖", label: "คำแนะนำ AI", desc: "รดน้ำ ใส่ปุ๋ย ฉีดยา เก็บเกี่ยว" },
  { to: "/weather", icon: "🌦️", label: "สภาพอากาศ", desc: "ฝน ความชื้น ลม UV" },
  { to: "/calendar", icon: "📅", label: "ปฏิทินงาน", desc: "ตารางงานและแจ้งเตือน" },
  { to: "/costs", icon: "💰", label: "ต้นทุน-รายได้", desc: "รายรับ รายจ่าย กำไร" },
  { to: "/yield", icon: "📈", label: "คาดการณ์ผลผลิต", desc: "ผลผลิตและรายได้ล่วงหน้า" },
  { to: "/notifications", icon: "🔔", label: "การแจ้งเตือน", desc: "งาน โรค ฝน ดินแห้ง" },
  { to: "/community", icon: "👥", label: "ชุมชนชาวสวน", desc: "ถามตอบ แชร์ความรู้" },
  { to: "/reports", icon: "📄", label: "รายงาน", desc: "PDF Excel และกราฟ" },
] as const;

function MorePage() {
  return (
    <AppShell title="เมนูทั้งหมด" subtitle="ทุกเครื่องมือจัดการสวนในที่เดียว">
      <SectionTitle>ฟีเจอร์</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {menu.map((m) => (
          <Link key={m.to} to={m.to}>
            <Card className="h-full">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-xl">
                {m.icon}
              </span>
              <p className="mt-2 text-sm font-semibold">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      <SectionTitle>บัญชีของฉัน</SectionTitle>
      <Card className="flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-2xl">
          🧑‍🌾
        </span>
        <div>
          <p className="text-sm font-semibold">สวนคุณสมชาย</p>
          <p className="text-xs text-muted-foreground">3 แปลง · 25 ไร่ · จ.จันทบุรี</p>
        </div>
      </Card>
    </AppShell>
  );
}