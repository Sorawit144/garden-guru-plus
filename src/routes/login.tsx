import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EyeOff, LockKeyhole, LogIn, UserRound } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { Card } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const login = () => {
    setLoading(true);
    window.setTimeout(() => {
      localStorage.setItem("garden_guru_demo_logged_in", "true");
      toast.success("เข้าสู่ระบบแล้ว");
      navigate({ to: "/" });
    }, 350);
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_0%_100%,var(--color-primary-soft),transparent_43%),linear-gradient(135deg,var(--color-secondary),var(--color-background))] p-5">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <BrandMark size="lg" className="mx-auto shadow-[var(--shadow-card)]" />
          <h1 className="mt-4 text-2xl font-bold">เข้าสู่ระบบ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Garden Guru Plus · บัญชีตัวอย่างพร้อมใช้งาน
          </p>
        </div>
        <Card className="space-y-4 p-5">
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">อีเมลหรือชื่อผู้ใช้</p>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-3">
              <UserRound className="size-4 text-primary" />
              <span className="text-sm font-medium">manager@gardenguru.demo</span>
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">รหัสผ่าน</p>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-3">
              <LockKeyhole className="size-4 text-primary" />
              <span className="flex-1 text-sm tracking-[0.25em]">••••••••</span>
              <EyeOff className="size-4 text-muted-foreground" />
            </div>
          </div>
          <p className="rounded-xl bg-primary-soft px-3 py-2.5 text-xs text-primary">
            บัญชีเดโมถูกกรอกไว้แล้ว กดเข้าสู่ระบบได้ทันที
          </p>
          <button
            disabled={loading}
            onClick={login}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-70"
          >
            <LogIn className="size-4" />
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </Card>
      </div>
    </main>
  );
}
