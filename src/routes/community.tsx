import { createFileRoute } from "@tanstack/react-router";
import { Heart, MessageSquare, PenLine } from "lucide-react";
import { AppShell, Badge, Card } from "@/components/AppShell";
import { communityPosts } from "@/lib/farm-data";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "ชุมชนชาวสวน — สวนอัจฉริยะ" },
      { name: "description", content: "ถามตอบ แชร์ความรู้ และติดตามข่าวเกษตรกับเพื่อนชาวสวนทั่วประเทศ" },
      { property: "og:title", content: "ชุมชนชาวสวน — สวนอัจฉริยะ" },
      { property: "og:description", content: "พื้นที่แลกเปลี่ยนความรู้และข่าวสารการเกษตร" },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  return (
    <AppShell title="ชุมชนชาวสวน" subtitle="ถามตอบ แชร์ความรู้ ข่าวเกษตร">
      <button className="gradient-leaf flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-primary-foreground">
        <PenLine className="size-4" /> ตั้งกระทู้ใหม่
      </button>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["ทั้งหมด", "ถามตอบ", "แชร์ความรู้", "ข่าวเกษตร"].map((f, i) => (
          <span
            key={f}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              i === 0 ? "gradient-leaf text-primary-foreground" : "border border-border bg-card"
            }`}
          >
            {f}
          </span>
        ))}
      </div>

      {communityPosts.map((p) => (
        <Card key={p.id}>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-lg">
              {p.avatar}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{p.author}</p>
              <p className="text-xs text-muted-foreground">{p.time}</p>
            </div>
            <Badge tone={p.tag === "ข่าวเกษตร" ? "info" : p.tag === "ถามตอบ" ? "warn" : "good"}>
              {p.tag}
            </Badge>
          </div>
          <p className="mt-3 text-sm text-foreground/90">{p.content}</p>
          <div className="mt-3 flex gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="size-4" /> {p.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="size-4" /> {p.comments} ความเห็น
            </span>
          </div>
        </Card>
      ))}
    </AppShell>
  );
}