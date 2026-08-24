export type PlanTier = "free" | "pro" | "promax";

export const PLAN_DETAILS: Record<PlanTier, { name: string; description: string }> = {
  free: { name: "Free", description: "1 ทีม · สมาชิกสูงสุด 3 คน" },
  pro: { name: "Pro", description: "3 ทีม · มอบหมายและติดตามงาน" },
  promax: { name: "Pro Max", description: "ทุกทีม · อนุมัติงานและรายงาน" },
};

export const ORGANIZATION_TEAMS = [
  { id: "team-a", name: "ทีมดูแลแปลง A", lead: "วิภา รุ่งเรือง", area: "โซนทุเรียน", plotId: "p1" },
  { id: "team-b", name: "ทีมดูแลแปลง B", lead: "อนันต์ มั่นคง", area: "โซนมังคุด", plotId: "p2" },
  { id: "team-harvest", name: "ทีมเก็บเกี่ยว", lead: "กิตติ ศรีสุข", area: "ทุกโซน", plotId: "p3" },
];

export const ORGANIZATION_MEMBERS = [
  { id: "m1", name: "วิภา รุ่งเรือง", role: "หัวหน้าทีม", team: "ทีมดูแลแปลง A", initials: "ว" },
  { id: "m2", name: "สมชาย ใจดี", role: "ผู้ปฏิบัติงาน", team: "ทีมดูแลแปลง A", initials: "ส" },
  { id: "m3", name: "มาลี บุญมาก", role: "ผู้ปฏิบัติงาน", team: "ทีมดูแลแปลง A", initials: "ม" },
  { id: "m4", name: "อนันต์ มั่นคง", role: "หัวหน้าทีม", team: "ทีมดูแลแปลง B", initials: "อ" },
  { id: "m5", name: "ปรียา แสงทอง", role: "ผู้ปฏิบัติงาน", team: "ทีมดูแลแปลง B", initials: "ป" },
  { id: "m6", name: "กิตติ ศรีสุข", role: "ผู้จัดการฟาร์ม", team: "ทีมเก็บเกี่ยว", initials: "ก" },
];

export const getTierTeams = (tier: PlanTier) =>
  ORGANIZATION_TEAMS.slice(0, tier === "free" ? 1 : tier === "pro" ? 2 : 3);
export const getTierMembers = (tier: PlanTier) => {
  const teams = new Set(getTierTeams(tier).map((team) => team.name));
  return ORGANIZATION_MEMBERS.filter((member) => teams.has(member.team));
};

export const OPERATION_DECISIONS = [
  {
    id: "decision-1",
    title: "อนุมัติงบฉีดพ่นป้องกันเพลี้ยไฟ",
    plotId: "p1",
    team: "ทีมดูแลแปลง A",
    owner: "วิภา รุ่งเรือง",
    detail: "งบประมาณ 4,800 บาท · ควรดำเนินการก่อนฝนช่วงบ่าย",
    priority: "สูง",
  },
  {
    id: "decision-2",
    title: "อนุมัติแผนเก็บเกี่ยวมังคุดล็อตแรก",
    plotId: "p2",
    team: "ทีมดูแลแปลง B",
    owner: "อนันต์ มั่นคง",
    detail: "คาดการณ์ 1,200 กก. · ต้องยืนยันคิวรถขนส่ง",
    priority: "สูง",
  },
  {
    id: "decision-3",
    title: "เลือกแนวทางแก้ใบเหลือง",
    plotId: "p3",
    team: "ทีมเก็บเกี่ยว",
    owner: "กิตติ ศรีสุข",
    detail: "ผลตรวจแนะนำเสริมแมกนีเซียมภายในสัปดาห์นี้",
    priority: "ปกติ",
  },
];
