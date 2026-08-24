import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, LockKeyhole, ShieldCheck, Users } from "lucide-react";
import { AppShell, Badge, Card, SectionTitle } from "@/components/AppShell";
import { useOrganizationPlan } from "@/hooks/useOrganizationPlan";
import { getTierMembers, getTierTeams, PLAN_DETAILS, type PlanTier } from "@/lib/organization-data";

export const Route = createFileRoute("/team")({ component: TeamPage });

const tiers: PlanTier[] = ["free", "pro", "promax"];

function PlanSwitcher({ tier, onChange }: { tier: PlanTier; onChange: (tier: PlanTier) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
      {tiers.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={`rounded-lg px-2 py-2 text-xs font-semibold ${tier === item ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}
        >
          {PLAN_DETAILS[item].name}
        </button>
      ))}
    </div>
  );
}

function TeamPage() {
  const { tier, changeTier } = useOrganizationPlan();
  const teams = getTierTeams(tier);
  const members = getTierMembers(tier);
  if (tier === "free") {
    return (
      <AppShell title="สมาชิกและทีม" subtitle="ฟีเจอร์สำหรับรูปแบบองค์กร">
        <Card className="py-10 text-center">
          <LockKeyhole className="mx-auto mb-3 size-9 text-primary" />
          <p className="font-semibold">สมาชิกและทีมเริ่มต้นที่ Pro</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            แพ็กเกจ Free ใช้สำหรับสวนส่วนตัว จึงไม่มีโครงสร้างทีม การมอบหมาย หรือสิทธิ์หัวหน้าทีม
          </p>
          <div className="mx-auto mt-5 max-w-sm">
            <PlanSwitcher tier={tier} onChange={changeTier} />
          </div>
        </Card>
      </AppShell>
    );
  }
  return (
    <AppShell title="สมาชิกและทีม" subtitle="โครงสร้างองค์กรที่ใช้ร่วมกับแผนงาน">
      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Crown className="size-4" />
          <p className="text-sm font-semibold">จำลองแพ็กเกจองค์กร</p>
        </div>
        <PlanSwitcher tier={tier} onChange={changeTier} />
        <p className="mt-3 text-xs text-muted-foreground">
          {PLAN_DETAILS[tier].description} · การเปลี่ยนแพ็กเกจจะอัปเดตหน้าแผนงานด้วย
        </p>
      </Card>
      <SectionTitle>ทีมในองค์กร ({teams.length})</SectionTitle>
      <div className="space-y-2">
        {teams.map((team) => (
          <Card key={team.id} className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Users className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{team.name}</p>
              <p className="text-xs text-muted-foreground">
                {team.area} · หัวหน้าทีม {team.lead}
              </p>
            </div>
            <Badge tone="info">
              {members.filter((member) => member.team === team.name).length} คน
            </Badge>
          </Card>
        ))}
      </div>
      <SectionTitle>สมาชิก ({members.length})</SectionTitle>
      <div className="space-y-2">
        {members.map((member) => (
          <Card key={member.id} className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {member.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.team}</p>
            </div>
            <Badge tone={member.role === "หัวหน้าทีม" ? "good" : "muted"}>{member.role}</Badge>
          </Card>
        ))}
      </div>
      <Link
        to="/calendar"
        className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
      >
        <ShieldCheck className="size-4" /> ดูแผนงานขององค์กร
      </Link>
    </AppShell>
  );
}
