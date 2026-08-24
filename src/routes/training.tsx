import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenCheck, CalendarCheck2, ClipboardList, ScanLine } from "lucide-react";
import { AppShell, Card, SectionTitle } from "@/components/AppShell";

export const Route = createFileRoute("/training")({ component: TrainingPage });

const lessons = [
  {
    icon: ClipboardList,
    title: "เริ่มต้นจัดการแปลง",
    description: "เพิ่มแปลง ระบุพืช และบันทึกข้อมูลพื้นฐาน",
    to: "/plots" as const,
  },
  {
    icon: CalendarCheck2,
    title: "วางแผนและติดตามงาน",
    description: "มอบหมาย ส่งงาน และตรวจสถานะงาน",
    to: "/calendar" as const,
  },
  {
    icon: ScanLine,
    title: "ใช้ AI ตรวจสุขภาพพืช",
    description: "ถ่ายภาพและดูผลวิเคราะห์โรคพืช",
    to: "/diagnose" as const,
  },
];

function TrainingPage() {
  return (
    <AppShell title="โหมดฝึกสอน" subtitle="เรียนรู้การใช้งานทีละขั้นตอน">
      <Card className="border-0 bg-primary p-5 text-primary-foreground">
        <BookOpenCheck className="mb-3 size-7" />
        <p className="text-lg font-bold">เริ่มใช้งานสวนอัจฉริยะ</p>
        <p className="mt-1 text-sm text-primary-foreground/85">
          เลือกบทเรียนที่ต้องการ ระบบจะพาไปยังหน้าที่เกี่ยวข้อง
        </p>
      </Card>
      <SectionTitle>บทเรียนแนะนำ</SectionTitle>
      <div className="space-y-3">
        {lessons.map((lesson, index) => (
          <Link key={lesson.title} to={lesson.to}>
            <Card className="flex items-center gap-3 transition-transform hover:-translate-y-0.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <lesson.icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {index + 1}. {lesson.title}
                </p>
                <p className="text-xs text-muted-foreground">{lesson.description}</p>
              </div>
              <ArrowRight className="size-4 text-primary" />
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
