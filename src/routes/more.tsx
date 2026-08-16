import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  CloudSun,
  FileText,
  HandCoins,
  HeartPulse,
  Users,
  Waves,
  Wheat,
} from "lucide-react";
import { AppShell, Card, SectionTitle } from "@/components/AppShell";
import { BrandMark } from "@/components/BrandMark";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/more")({
  head: () => ({
    meta: [
      { title: "เมนูทั้งหมด — สวนอัจฉริยะ" },
      {
        name: "description",
        content: "เข้าถึงทุกฟีเจอร์: อากาศ ปฏิทิน ต้นทุน ผลผลิต แจ้งเตือน ชุมชน และรายงาน",
      },
      { property: "og:title", content: "เมนูทั้งหมด — สวนอัจฉริยะ" },
      { property: "og:description", content: "รวมทุกเครื่องมือจัดการสวนไว้ในหน้าเดียว" },
    ],
  }),
  component: MorePage,
});

const menu = [
  {
    to: "/crop-calendar",
    icon: CalendarDays,
    label: "ปฏิทินพืช AI",
    desc: "Timeline เพาะปลูก → เก็บเกี่ยว",
  },
  { to: "/recommend", icon: Bot, label: "คำแนะนำ AI", desc: "รดน้ำ ใส่ปุ๋ย ฉีดยา เก็บเกี่ยว" },
  { to: "/weather", icon: CloudSun, label: "สภาพอากาศ", desc: "ฝน ความชื้น ลม UV" },
  { to: "/market", icon: HandCoins, label: "ราคาตลาด", desc: "ราคาผลผลิตล่าสุดวันนี้" },
  { to: "/disaster", icon: Waves, label: "น้ำท่วม-ภัยแล้ง", desc: "เฝ้าระวังและหลักฐานชดเชย" },
  { to: "/monitor", icon: HeartPulse, label: "เฝ้าระวังรายสัปดาห์", desc: "ความสมบูรณ์ของพืช" },
  { to: "/calendar", icon: CalendarDays, label: "ปฏิทินงาน", desc: "ตารางงานและแจ้งเตือน" },
  { to: "/costs", icon: BarChart3, label: "ต้นทุน-รายได้", desc: "รายรับ รายจ่าย กำไร" },
  { to: "/yield", icon: Wheat, label: "คาดการณ์ผลผลิต", desc: "ผลผลิตและรายได้ล่วงหน้า" },
  { to: "/notifications", icon: Bell, label: "การแจ้งเตือน", desc: "งาน โรค ฝน ดินแห้ง" },
  { to: "/community", icon: Users, label: "ชุมชนชาวสวน", desc: "ถามตอบ แชร์ความรู้" },
  { to: "/reports", icon: FileText, label: "รายงาน", desc: "PDF Excel และกราฟ" },
] as const;

function MorePage() {
  return (
    <AppShell title="เมนูทั้งหมด" subtitle="ทุกเครื่องมือจัดการสวนในที่เดียว">
      <SectionTitle>ฟีเจอร์</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {menu.map((m) => (
          <Link key={m.to} to={m.to}>
            <Card className="h-full">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <m.icon className="size-5" strokeWidth={2} />
              </span>
              <p className="mt-2 text-sm font-semibold">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      <SectionTitle>บัญชีของฉัน</SectionTitle>
      <Card className="flex items-center gap-3">
        <BrandMark size="md" />
        <div>
          <p className="text-sm font-semibold">สวนคุณสมชาย</p>
          <p className="text-xs text-muted-foreground">3 แปลง · 25 ไร่ · จ.จันทบุรี</p>
        </div>
      </Card>

      <SectionTitle>การแสดงผล</SectionTitle>
      <Card className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">โหมดมืด / โหมดสว่าง</p>
          <p className="text-xs text-muted-foreground">แตะปุ่มเพื่อสลับธีมของแอป</p>
        </div>
        <div className="rounded-full bg-primary p-0.5 text-primary-foreground">
          <ThemeToggle />
        </div>
      </Card>
    </AppShell>
  );
}
