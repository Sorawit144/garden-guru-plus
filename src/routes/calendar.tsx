import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { AppShell, Badge, Card, SectionTitle } from "@/components/AppShell";
import { usePlots } from "@/hooks/usePlots";
import { toast } from "sonner";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "ปฏิทินงานสวน — สวนอัจฉริยะ" },
      { name: "description", content: "ตารางงานใส่ปุ๋ย รดน้ำ ฉีดยา และเก็บเกี่ยว พร้อมการแจ้งเตือน" },
      { property: "og:title", content: "ปฏิทินงานสวน — สวนอัจฉริยะ" },
      { property: "og:description", content: "วางแผนงานเกษตรรายวันและรับแจ้งเตือนอัตโนมัติ" },
    ],
  }),
  component: CalendarPage,
});

type TaskType = "รดน้ำ" | "ใส่ปุ๋ย" | "ฉีดยา" | "เก็บเกี่ยว" | "ตัดแต่ง" | "อื่นๆ";

type FarmTask = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  title: string;
  type: TaskType;
  plotId: string;
  done: boolean;
};

const TYPE_EMOJI: Record<TaskType, string> = {
  รดน้ำ: "💧",
  ใส่ปุ๋ย: "🌿",
  ฉีดยา: "🧴",
  เก็บเกี่ยว: "🧺",
  ตัดแต่ง: "✂️",
  อื่นๆ: "📌",
};

const TYPE_TONE: Record<TaskType, "good" | "warn" | "info" | "muted"> = {
  รดน้ำ: "info",
  ใส่ปุ๋ย: "good",
  ฉีดยา: "warn",
  เก็บเกี่ยว: "muted",
  ตัดแต่ง: "muted",
  อื่นๆ: "muted",
};

function getWeek(): { date: string; dayLabel: string; dayShort: string }[] {
  const days = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const result = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push({
      date: d.toISOString().slice(0, 10),
      dayLabel: d.getDate().toString(),
      dayShort: days[d.getDay()] ?? "?",
    });
  }
  return result;
}

function CalendarPage() {
  const { plots } = usePlots();
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [showAdd, setShowAdd] = useState(false);

  // form state
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<TaskType>("รดน้ำ");
  const [newPlotId, setNewPlotId] = useState("");
  const [newDate, setNewDate] = useState(selectedDate);

  const week = useMemo(() => getWeek(), []);

  // load from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("garden_guru_calendar_tasks");
      if (stored) {
        try { setTasks(JSON.parse(stored)); } catch (e) {}
      }
    }
    if (plots.length > 0 && plots[0] && !newPlotId) {
      setNewPlotId(plots[0].id);
    }
  }, [plots]);

  const saveTasks = (updated: FarmTask[]) => {
    setTasks(updated);
    localStorage.setItem("garden_guru_calendar_tasks", JSON.stringify(updated));
  };

  const addTask = () => {
    if (!newTitle.trim()) {
      toast.error("กรุณาระบุชื่องาน");
      return;
    }
    const task: FarmTask = {
      id: `task-${Date.now()}`,
      date: newDate,
      title: newTitle.trim(),
      type: newType,
      plotId: newPlotId,
      done: false,
    };
    saveTasks([task, ...tasks]);
    setNewTitle("");
    setShowAdd(false);
    toast.success("เพิ่มงานสำเร็จ!");
  };

  const toggleDone = (id: string) => {
    saveTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter((t) => t.id !== id));
    toast.success("ลบงานแล้ว");
  };

  const tasksForDate = tasks.filter((t) => t.date === selectedDate);

  return (
    <AppShell title="ปฏิทินงาน" subtitle="วางแผนงานเกษตรรายวัน">
      {/* 7-day week strip */}
      <Card>
        <div className="grid grid-cols-7 gap-1 text-center">
          {week.map((d) => {
            const dayTasks = tasks.filter((t) => t.date === d.date);
            const isSelected = d.date === selectedDate;
            return (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`rounded-xl py-2 transition-all cursor-pointer ${
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <p className="text-[10px] opacity-80">{d.dayShort}</p>
                <p className="text-sm font-semibold">{d.dayLabel}</p>
                <div className="mt-1 flex justify-center gap-0.5 flex-wrap">
                  {dayTasks.slice(0, 3).map((t, k) => (
                    <span
                      key={k}
                      className={`size-1.5 rounded-full ${isSelected ? "bg-white/80" : "bg-primary/60"}`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Add task button */}
      <button
        onClick={() => { setNewDate(selectedDate); setShowAdd(true); }}
        className="bg-primary flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-primary-foreground cursor-pointer active:scale-[0.98]"
      >
        <Plus className="size-4" /> เพิ่มงานใหม่
      </button>

      {/* Add task modal overlay */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowAdd(false)}>
          <div
            className="w-full max-w-md rounded-t-3xl bg-card p-5 pb-8 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">เพิ่มงานใหม่</p>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="ชื่องาน เช่น ใส่ปุ๋ยทางใบแปลงทุเรียน"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />

            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">ประเภทงาน</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(TYPE_EMOJI) as TaskType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewType(t)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium cursor-pointer transition-all ${
                      newType === t ? "border-primary bg-primary-soft text-primary" : "border-border"
                    }`}
                  >
                    {TYPE_EMOJI[t]} {t}
                  </button>
                ))}
              </div>
            </div>

            {plots.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">แปลงที่ทำงาน</p>
                <select
                  value={newPlotId}
                  onChange={(e) => setNewPlotId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                >
                  <option value="">-- ไม่ระบุแปลง --</option>
                  {plots.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.emoji} {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">วันที่</p>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <button
              onClick={addTask}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground cursor-pointer active:scale-[0.99]"
            >
              บันทึกงาน
            </button>
          </div>
        </div>
      )}

      {/* Tasks for selected date */}
      <SectionTitle>
        งานวันที่ {new Date(selectedDate + "T00:00:00").toLocaleDateString("th-TH", {
          weekday: "long", day: "numeric", month: "long",
        })}
      </SectionTitle>

      {tasksForDate.length === 0 ? (
        <Card className="text-center py-6">
          <p className="text-2xl mb-2">📅</p>
          <p className="text-sm text-muted-foreground">ยังไม่มีงานในวันนี้</p>
          <p className="text-xs text-muted-foreground mt-1">กดปุ่ม "เพิ่มงานใหม่" เพื่อวางแผนได้เลย</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {tasksForDate.map((t) => {
            const plot = plots.find((p) => p.id === t.plotId);
            return (
              <Card key={t.id} className={`flex items-center gap-3 ${t.done ? "opacity-60" : ""}`}>
                <button
                  onClick={() => toggleDone(t.id)}
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer ${
                    t.done ? "bg-primary/20 text-primary" : "bg-muted text-lg"
                  }`}
                >
                  {t.done ? "✓" : TYPE_EMOJI[t.type]}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${t.done ? "line-through text-muted-foreground" : ""}`}>
                    {t.title}
                  </p>
                  {plot && <p className="text-xs text-muted-foreground">{plot.emoji} {plot.name}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone={TYPE_TONE[t.type]}>{t.type}</Badge>
                  <button onClick={() => deleteTask(t.id)} className="text-muted-foreground hover:text-destructive cursor-pointer">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </Card>
            );
          })}
          <p className="text-center text-xs text-muted-foreground pt-1">
            เสร็จแล้ว {tasksForDate.filter((t) => t.done).length}/{tasksForDate.length} งาน
          </p>
        </div>
      )}

      {/* Upcoming tasks from other days */}
      {tasks.filter((t) => t.date > selectedDate && !t.done).length > 0 && (
        <>
          <SectionTitle>งานที่กำลังจะมาถึง</SectionTitle>
          <div className="space-y-2">
            {tasks
              .filter((t) => t.date > selectedDate && !t.done)
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(0, 5)
              .map((t) => {
                const plot = plots.find((p) => p.id === t.plotId);
                const dateLabel = new Date(t.date + "T00:00:00").toLocaleDateString("th-TH", {
                  day: "numeric", month: "short",
                });
                return (
                  <Card key={t.id} className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-lg">
                      {TYPE_EMOJI[t.type]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {dateLabel}{plot ? ` · ${plot.name}` : ""}
                      </p>
                    </div>
                    <Badge tone={TYPE_TONE[t.type]}>{t.type}</Badge>
                  </Card>
                );
              })}
          </div>
        </>
      )}
    </AppShell>
  );
}