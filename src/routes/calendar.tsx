import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  Check,
  ClipboardCheck,
  Droplets,
  FlaskConical,
  PackageCheck,
  PencilRuler,
  Plus,
  Sprout,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { AppShell, Badge, Card, SectionTitle } from "@/components/AppShell";
import { usePlots } from "@/hooks/usePlots";
import { toast } from "sonner";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "ปฏิทินงานสวน — สวนอัจฉริยะ" },
      { name: "description", content: "วางแผนและติดตามงานสวนส่วนตัวรายวัน" },
    ],
  }),
  component: CalendarPage,
});

type TaskType = "รดน้ำ" | "ใส่ปุ๋ย" | "ฉีดยา" | "เก็บเกี่ยว" | "ตัดแต่ง" | "อื่นๆ";
type FarmTask = {
  id: string;
  date: string;
  title: string;
  type: TaskType;
  plotId: string;
  done: boolean;
  status?: string;
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
  const labels = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      date: date.toISOString().slice(0, 10),
      day: String(date.getDate()),
      label: labels[date.getDay()] ?? "",
    };
  });
}

function CalendarPage() {
  const { plots } = usePlots();
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<TaskType>("รดน้ำ");
  const [newPlotId, setNewPlotId] = useState("");
  const [newDate, setNewDate] = useState(selectedDate);
  const week = useMemo(getWeek, []);

  useEffect(() => {
    const stored = localStorage.getItem("garden_guru_calendar_tasks");
    if (stored) {
      try {
        const saved = JSON.parse(stored) as FarmTask[];
        setTasks(
          saved.map((task) => ({
            id: task.id,
            date: task.date,
            title: task.title,
            type: task.type,
            plotId: task.plotId ?? "",
            done: task.done ?? task.status === "approved",
          })),
        );
      } catch {
        // Ignore invalid data saved by an older version.
      }
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setTasks([
        {
          id: "sample-1",
          date: today,
          title: "ตรวจระบบน้ำแปลงทุเรียน",
          type: "รดน้ำ",
          plotId: "p1",
          done: false,
        },
        {
          id: "sample-2",
          date: today,
          title: "ใส่ปุ๋ยทางใบแปลงมังคุด",
          type: "ใส่ปุ๋ย",
          plotId: "p2",
          done: true,
        },
      ]);
    }
    if (plots[0]) setNewPlotId((current) => current || plots[0]!.id);
  }, [plots]);

  const saveTasks = (next: FarmTask[]) => {
    setTasks(next);
    localStorage.setItem("garden_guru_calendar_tasks", JSON.stringify(next));
  };
  const addTask = () => {
    if (!newTitle.trim()) return toast.error("กรุณาระบุชื่องาน");
    saveTasks([
      {
        id: `task-${Date.now()}`,
        date: newDate,
        title: newTitle.trim(),
        type: newType,
        plotId: newPlotId,
        done: false,
      },
      ...tasks,
    ]);
    setNewTitle("");
    setShowAdd(false);
    toast.success("เพิ่มงานสวนแล้ว");
  };
  const tasksForDate = tasks.filter((task) => task.date === selectedDate);

  return (
    <AppShell title="ปฏิทินงานสวน" subtitle="วางแผนงานของแต่ละแปลง">
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">งานทั้งหมด</p>
          <p className="mt-1 text-2xl font-bold">{tasks.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">เสร็จแล้ว</p>
          <p className="mt-1 text-2xl font-bold text-primary">
            {tasks.filter((task) => task.done).length}
          </p>
        </Card>
      </div>

      <Card>
        <div className="grid grid-cols-7 gap-1 text-center">
          {week.map((item) => {
            const selected = item.date === selectedDate;
            const count = tasks.filter((task) => task.date === item.date).length;
            return (
              <button
                key={item.date}
                onClick={() => setSelectedDate(item.date)}
                className={`rounded-xl py-2 ${selected ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}
              >
                <p className="text-[10px] opacity-80">{item.label}</p>
                <p className="text-sm font-semibold">{item.day}</p>
                {count > 0 && (
                  <span
                    className={`mx-auto mt-1 block size-1.5 rounded-full ${selected ? "bg-white" : "bg-primary"}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <button
        onClick={() => {
          setNewDate(selectedDate);
          setShowAdd(true);
        }}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
      >
        <Plus className="size-4" /> เพิ่มงานใหม่
      </button>

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
          <CalendarDays className="mx-auto mb-2 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">ยังไม่มีงานในวันนี้</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {tasksForDate.map((task) => {
            const Icon = TYPE_ICON[task.type];
            const plot = plots.find((item) => item.id === task.plotId);
            return (
              <Card
                key={task.id}
                className={`flex items-center gap-3 p-4 ${task.done ? "opacity-60" : ""}`}
              >
                <button
                  onClick={() =>
                    saveTasks(
                      tasks.map((item) =>
                        item.id === task.id ? { ...item, done: !item.done } : item,
                      ),
                    )
                  }
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${task.done ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary"}`}
                  aria-label={
                    task.done ? "ทำเครื่องหมายว่ายังไม่เสร็จ" : "ทำเครื่องหมายว่าเสร็จแล้ว"
                  }
                >
                  {task.done ? <Check className="size-5" /> : <Icon className="size-5" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${task.done ? "line-through" : ""}`}>
                    {task.title}
                  </p>
                  {plot && <p className="text-xs text-muted-foreground">{plot.name}</p>}
                </div>
                <Badge tone={TYPE_TONE[task.type]}>{task.type}</Badge>
                <button
                  onClick={() => saveTasks(tasks.filter((item) => item.id !== task.id))}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="ลบงาน"
                >
                  <Trash2 className="size-4" />
                </button>
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
            <div className="flex items-center justify-between">
              <p className="font-semibold">เพิ่มงานสวน</p>
              <button onClick={() => setShowAdd(false)} aria-label="ปิด">
                <X className="size-5" />
              </button>
            </div>
            <input
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="ชื่องาน"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
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
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              บันทึกงาน
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
