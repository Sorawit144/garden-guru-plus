import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Droplets,
  FlaskConical,
  PackageCheck,
  PencilRuler,
  Plus,
  Send,
  Sprout,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { AppShell, Badge, Card, SectionTitle } from "@/components/AppShell";
import { usePlots } from "@/hooks/usePlots";
import { useOrganizationPlan } from "@/hooks/useOrganizationPlan";
import { getTierTeams, PLAN_DETAILS, type PlanTier } from "@/lib/organization-data";
import { toast } from "sonner";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "แผนงานองค์กร — สวนอัจฉริยะ" },
      { name: "description", content: "วางแผน มอบหมาย และอนุมัติงานเกษตรเป็นทีม" },
    ],
  }),
  component: CalendarPage,
});

type TaskType = "รดน้ำ" | "ใส่ปุ๋ย" | "ฉีดยา" | "เก็บเกี่ยว" | "ตัดแต่ง" | "อื่นๆ";
type TaskStatus = "todo" | "submitted" | "approved";
type Role = "worker" | "lead" | "manager";
type FarmTask = {
  id: string;
  date: string;
  title: string;
  type: TaskType;
  plotId: string;
  team: string;
  assignee: string;
  status: TaskStatus;
  done?: boolean;
};

const ROLES: Record<Role, { label: string; name: string; team: string }> = {
  worker: { label: "ผู้ปฏิบัติงาน", name: "สมชาย ใจดี", team: "ทีมดูแลแปลง A" },
  lead: { label: "หัวหน้าทีม", name: "วิภา รุ่งเรือง", team: "ทีมดูแลแปลง A" },
  manager: { label: "ผู้จัดการฟาร์ม", name: "กิตติ ศรีสุข", team: "ทุกทีม" },
};
const TYPE_ICON: Record<TaskType, ComponentType<{ className?: string }>> = {
  รดน้ำ: Droplets,
  ใส่ปุ๋ย: Sprout,
  ฉีดยา: FlaskConical,
  เก็บเกี่ยว: PackageCheck,
  ตัดแต่ง: PencilRuler,
  อื่นๆ: ClipboardCheck,
};
const TYPE_TONE: Record<TaskType, "good" | "warn" | "info" | "muted"> = {
  รดน้ำ: "info",
  ใส่ปุ๋ย: "good",
  ฉีดยา: "warn",
  เก็บเกี่ยว: "muted",
  ตัดแต่ง: "muted",
  อื่นๆ: "muted",
};

function getWeek() {
  const days = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().slice(0, 10),
      dayLabel: String(d.getDate()),
      dayShort: days[d.getDay()] ?? "",
    };
  });
}
const statusLabel: Record<TaskStatus, string> = {
  todo: "รอดำเนินการ",
  submitted: "รออนุมัติ",
  approved: "อนุมัติแล้ว",
};

function CalendarPage() {
  const { plots } = usePlots();
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [role, setRole] = useState<Role>("worker");
  const { tier, changeTier } = useOrganizationPlan();
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<TaskType>("รดน้ำ");
  const [newPlotId, setNewPlotId] = useState("");
  const [newDate, setNewDate] = useState(selectedDate);
  const [newTeam, setNewTeam] = useState("ทีมดูแลแปลง A");
  const [newAssignee, setNewAssignee] = useState("สมชาย ใจดี");
  const week = useMemo(getWeek, []);
  const profile = ROLES[role];
  const planTeams = getTierTeams(tier);

  useEffect(() => {
    const stored = localStorage.getItem("garden_guru_calendar_tasks");
    if (stored) {
      try {
        const savedTasks = JSON.parse(stored) as FarmTask[];
        setTasks(
          savedTasks.map((task) => ({
            ...task,
            team: task.team ?? "ทีมดูแลแปลง A",
            assignee: task.assignee ?? "สมชาย ใจดี",
            status: task.status ?? (task.done ? "approved" : "todo"),
          })),
        );
      } catch {
        /* ignore invalid cached data */
      }
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setTasks([
        {
          id: "mock-task-1",
          date: today,
          title: "ตรวจระบบน้ำและรดน้ำโซนทุเรียน",
          type: "รดน้ำ",
          plotId: "",
          team: "ทีมดูแลแปลง A",
          assignee: "สมชาย ใจดี",
          status: "todo",
        },
        {
          id: "mock-task-2",
          date: today,
          title: "ตรวจความพร้อมก่อนเก็บเกี่ยว",
          type: "เก็บเกี่ยว",
          plotId: "",
          team: "ทีมเก็บเกี่ยว",
          assignee: "กิตติ ศรีสุข",
          status: "submitted",
        },
        {
          id: "mock-task-3",
          date: today,
          title: "ใส่ปุ๋ยทางใบแปลงมังคุด",
          type: "ใส่ปุ๋ย",
          plotId: "",
          team: "ทีมดูแลแปลง B",
          assignee: "ปรียา แสงทอง",
          status: "approved",
        },
      ]);
    }
    if (plots[0]) setNewPlotId((current) => current || plots[0]!.id);
  }, [plots]);
  const saveTasks = (updated: FarmTask[]) => {
    setTasks(updated);
    localStorage.setItem("garden_guru_calendar_tasks", JSON.stringify(updated));
  };
  const updateTask = (id: string, update: Partial<FarmTask>) =>
    saveTasks(tasks.map((task) => (task.id === id ? { ...task, ...update } : task)));
  const addTask = () => {
    if (!newTitle.trim()) return toast.error("กรุณาระบุชื่องาน");
    saveTasks([
      {
        id: `task-${Date.now()}`,
        date: newDate,
        title: newTitle.trim(),
        type: newType,
        plotId: newPlotId,
        team: newTeam,
        assignee: newAssignee,
        status: "todo",
      },
      ...tasks,
    ]);
    setNewTitle("");
    setShowAdd(false);
    toast.success("มอบหมายงานให้ทีมแล้ว");
  };
  const visibleTasks = tasks.filter(
    (task) =>
      planTeams.some((team) => team.name === task.team) &&
      (role === "manager" ||
        task.team === profile.team ||
        (role === "worker" && task.assignee === profile.name)),
  );
  const tasksForDate = visibleTasks.filter((task) => task.date === selectedDate);
  const openCount = visibleTasks.filter((task) => task.status === "todo").length;
  const pendingApproval = visibleTasks.filter((task) => task.status === "submitted").length;

  return (
    <AppShell title="แผนงานองค์กร" subtitle="มอบหมาย ติดตาม และอนุมัติงานเป็นทีม">
      <Card className="relative overflow-visible p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Users className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">กำลังจำลองเป็น</p>
              <p className="text-sm font-semibold">
                {profile.name} · {profile.label}
              </p>
              <p className="text-xs text-muted-foreground">{profile.team}</p>
            </div>
          </div>
          <button
            onClick={() => setShowRolePicker(!showRolePicker)}
            className="flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-medium text-primary"
          >
            <span>เปลี่ยนมุมมอง</span>
            <ChevronDown className="size-4" />
          </button>
        </div>
        {showRolePicker && (
          <div className="absolute inset-x-4 top-[4.6rem] z-10 rounded-xl border border-border bg-card p-2 shadow-lg">
            {(Object.keys(ROLES) as Role[]).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setRole(key);
                  setShowRolePicker(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${role === key ? "bg-primary-soft text-primary" : "hover:bg-muted"}`}
              >
                <span>{ROLES[key].label}</span>
                <span className="text-xs text-muted-foreground">{ROLES[key].team}</span>
              </button>
            ))}
          </div>
        )}
      </Card>
      <Card className="p-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">จำลองแพ็กเกจองค์กร</p>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
          {(["free", "pro", "promax"] as PlanTier[]).map((item) => (
            <button
              key={item}
              onClick={() => changeTier(item)}
              className={`rounded-lg px-2 py-2 text-xs font-semibold ${tier === item ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}
            >
              {PLAN_DETAILS[item].name}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{PLAN_DETAILS[tier].description}</p>
      </Card>
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">งานของทีม</p>
          <p className="mt-1 text-xl font-bold">{visibleTasks.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">กำลังทำ</p>
          <p className="mt-1 text-xl font-bold text-primary">{openCount}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">รออนุมัติ</p>
          <p className="mt-1 text-xl font-bold text-warning">{pendingApproval}</p>
        </Card>
      </div>
      <Card>
        <div className="grid grid-cols-7 gap-1 text-center">
          {week.map((d) => {
            const isSelected = d.date === selectedDate;
            const count = visibleTasks.filter((task) => task.date === d.date).length;
            return (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`rounded-xl py-2 ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}
              >
                <p className="text-[10px] opacity-80">{d.dayShort}</p>
                <p className="text-sm font-semibold">{d.dayLabel}</p>
                {count > 0 && (
                  <span
                    className={`mx-auto mt-1 block size-1.5 rounded-full ${isSelected ? "bg-white" : "bg-primary"}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </Card>
      {(role === "lead" || role === "manager") && tier !== "free" && (
        <button
          onClick={() => {
            setNewDate(selectedDate);
            setShowAdd(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" /> มอบหมายงานให้ทีม
        </button>
      )}
      <SectionTitle>
        งานวันที่{" "}
        {new Date(selectedDate + "T00:00:00").toLocaleDateString("th-TH", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </SectionTitle>
      {tasksForDate.length === 0 ? (
        <Card className="py-7 text-center">
          <ClipboardCheck className="mx-auto mb-2 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">ยังไม่มีงานที่เกี่ยวข้องในวันนี้</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {tasksForDate.map((task) => {
            const Icon = TYPE_ICON[task.type];
            const plot = plots.find((p) => p.id === task.plotId);
            return (
              <Card key={task.id} className="p-4">
                <div className="flex gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{task.title}</p>
                      <Badge
                        tone={
                          task.status === "approved"
                            ? "good"
                            : task.status === "submitted"
                              ? "warn"
                              : "muted"
                        }
                      >
                        {statusLabel[task.status]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {task.team} · ผู้รับผิดชอบ {task.assignee}
                      {plot ? ` · ${plot.name}` : ""}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex justify-between gap-2 border-t border-border pt-3">
                  <Badge tone={TYPE_TONE[task.type]}>{task.type}</Badge>
                  <div className="flex gap-2">
                    {role === "worker" &&
                      task.assignee === profile.name &&
                      task.status === "todo" && (
                        <button
                          onClick={() => {
                            updateTask(task.id, { status: "submitted" });
                            toast.success("ส่งงานให้หัวหน้าทีมตรวจแล้ว");
                          }}
                          className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground"
                        >
                          <Send className="size-3.5" /> ส่งงาน
                        </button>
                      )}
                    {role === "lead" && tier === "promax" && task.status === "submitted" && (
                      <button
                        onClick={() => {
                          updateTask(task.id, { status: "approved" });
                          toast.success("อนุมัติงานเรียบร้อย");
                        }}
                        className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground"
                      >
                        <CheckCircle2 className="size-3.5" /> อนุมัติ
                      </button>
                    )}
                    {(role === "lead" || role === "manager") && (
                      <button
                        aria-label="ลบงาน"
                        onClick={() => {
                          saveTasks(tasks.filter((item) => item.id !== task.id));
                          toast.success("ลบงานแล้ว");
                        }}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="w-full max-w-md space-y-3 rounded-t-3xl bg-card p-5 pb-8 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-between">
              <p className="font-semibold">มอบหมายงานใหม่</p>
              <button onClick={() => setShowAdd(false)}>
                <X className="size-5" />
              </button>
            </div>
            <input
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="ชื่องาน"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TYPE_ICON) as TaskType[]).map((type) => {
                const Icon = TYPE_ICON[type];
                return (
                  <button
                    key={type}
                    onClick={() => setNewType(type)}
                    className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs ${newType === type ? "border-primary bg-primary-soft text-primary" : "border-border"}`}
                  >
                    <Icon className="size-3.5" />
                    {type}
                  </button>
                );
              })}
            </div>
            <select
              value={newTeam}
              onChange={(event) => setNewTeam(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            >
              <option value="">เลือกทีม</option>
              {planTeams.map((team) => (
                <option key={team.id}>{team.name}</option>
              ))}
            </select>
            <input
              value={newAssignee}
              onChange={(event) => setNewAssignee(event.target.value)}
              placeholder="ชื่อผู้รับผิดชอบ"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            />
            {plots.length > 0 && (
              <select
                value={newPlotId}
                onChange={(event) => setNewPlotId(event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              >
                <option value="">ไม่ระบุแปลง</option>
                {plots.map((plot) => (
                  <option key={plot.id} value={plot.id}>
                    {plot.name}
                  </option>
                ))}
              </select>
            )}
            <input
              type="date"
              value={newDate}
              onChange={(event) => setNewDate(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            />
            <button
              onClick={addTask}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              <Check className="size-4" /> บันทึกและมอบหมาย
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
