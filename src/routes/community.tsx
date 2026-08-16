import { createFileRoute } from "@tanstack/react-router";
import { Heart, MessageSquare, PenLine, Send, X } from "lucide-react";
import { useState, useEffect } from "react";
import { AppShell, Badge, Card } from "@/components/AppShell";
import { communityPosts } from "@/lib/farm-data";
import { toast } from "sonner";

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

type Tag = "ทั้งหมด" | "ถามตอบ" | "แชร์ความรู้" | "ข่าวเกษตร";

type Post = {
  id: string;
  author: string;
  avatar: string;
  time: string;
  tag: "ถามตอบ" | "แชร์ความรู้" | "ข่าวเกษตร";
  content: string;
  likes: number;
  comments: number;
  liked: boolean;
  isOwn?: boolean;
};

// เวลาสัมพัทธ์
function relativeTime(isoStr: string) {
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
  if (diff < 60) return "เมื่อกี้";
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชม.ที่แล้ว`;
  return `${Math.floor(diff / 86400)} วันที่แล้ว`;
}

function CommunityPage() {
  const [filter, setFilter] = useState<Tag>("ทั้งหมด");
  const [posts, setPosts] = useState<Post[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newTag, setNewTag] = useState<Post["tag"]>("ถามตอบ");

  // load posts from localStorage, seed with default data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("garden_guru_community_posts");
      if (stored) {
        try {
          setPosts(JSON.parse(stored));
          return;
        } catch (e) {}
      }
      // seed initial
      const seed = communityPosts.map((p) => ({
        ...p,
        liked: false,
        isOwn: false,
        time: p.time, // keep original relative time string
      })) as Post[];
      localStorage.setItem("garden_guru_community_posts", JSON.stringify(seed));
      setPosts(seed);
    }
  }, []);

  const save = (updated: Post[]) => {
    setPosts(updated);
    localStorage.setItem("garden_guru_community_posts", JSON.stringify(updated));
  };

  const toggleLike = (id: string) => {
    save(
      posts.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  };

  const submitPost = () => {
    if (!newContent.trim()) {
      toast.error("กรุณาพิมพ์เนื้อหากระทู้");
      return;
    }
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: "คุณ (ผู้ใช้งาน)",
      avatar: "🌾",
      time: new Date().toISOString(),
      tag: newTag,
      content: newContent.trim(),
      likes: 0,
      comments: 0,
      liked: false,
      isOwn: true,
    };
    save([newPost, ...posts]);
    setNewContent("");
    setShowAdd(false);
    toast.success("ตั้งกระทู้สำเร็จ!");
  };

  const deletePost = (id: string) => {
    save(posts.filter((p) => p.id !== id));
    toast.success("ลบกระทู้แล้ว");
  };

  const filtered = filter === "ทั้งหมด" ? posts : posts.filter((p) => p.tag === filter);

  const tagTone = (tag: string): "info" | "warn" | "good" => {
    if (tag === "ข่าวเกษตร") return "info";
    if (tag === "ถามตอบ") return "warn";
    return "good";
  };

  return (
    <AppShell title="ชุมชนชาวสวน" subtitle="ถามตอบ แชร์ความรู้ ข่าวเกษตร">
      {/* New post button */}
      <button
        onClick={() => setShowAdd(true)}
        className="bg-primary flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-primary-foreground cursor-pointer active:scale-[0.98]"
      >
        <PenLine className="size-4" /> ตั้งกระทู้ใหม่
      </button>

      {/* New post modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowAdd(false)}>
          <div
            className="w-full max-w-md rounded-t-3xl bg-card p-5 pb-8 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">ตั้งกระทู้ใหม่</p>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            <div className="flex gap-2">
              {(["ถามตอบ", "แชร์ความรู้", "ข่าวเกษตร"] as Post["tag"][]).map((t) => (
                <button
                  key={t}
                  onClick={() => setNewTag(t)}
                  className={`flex-1 rounded-xl border py-2 text-xs font-medium cursor-pointer transition-all ${
                    newTag === t ? "border-primary bg-primary-soft text-primary" : "border-border"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="แชร์ประสบการณ์ ถามคำถาม หรือแจ้งข่าวสารการเกษตร…"
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />

            <button
              onClick={submitPost}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground cursor-pointer active:scale-[0.99]"
            >
              <Send className="size-4" /> โพสต์กระทู้
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["ทั้งหมด", "ถามตอบ", "แชร์ความรู้", "ข่าวเกษตร"] as Tag[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer transition-all ${
              filter === f ? "bg-primary text-primary-foreground" : "border border-border bg-card"
            }`}
          >
            {f}
            {f !== "ทั้งหมด" && (
              <span className="ml-1.5 text-[10px] opacity-70">
                ({posts.filter((p) => p.tag === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Posts list */}
      {filtered.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-2xl mb-2">💬</p>
          <p className="text-sm text-muted-foreground">ยังไม่มีกระทู้ในหมวดนี้</p>
          <p className="text-xs text-muted-foreground mt-1">เป็นคนแรกที่ตั้งกระทู้ได้เลยครับ!</p>
        </Card>
      ) : (
        filtered.map((p) => (
          <Card key={p.id}>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-lg shrink-0">
                {p.avatar}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.author}</p>
                <p className="text-xs text-muted-foreground">
                  {typeof p.time === "string" && p.time.includes("T")
                    ? relativeTime(p.time)
                    : p.time}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge tone={tagTone(p.tag)}>{p.tag}</Badge>
                {p.isOwn && (
                  <button
                    onClick={() => deletePost(p.id)}
                    className="text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="mt-3 text-sm text-foreground/90 leading-relaxed">{p.content}</p>
            <div className="mt-3 flex gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
              <button
                onClick={() => toggleLike(p.id)}
                className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                  p.liked ? "text-primary font-medium" : "hover:text-primary"
                }`}
              >
                <Heart className={`size-4 ${p.liked ? "fill-primary" : ""}`} />
                {p.likes}
              </button>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="size-4" />
                {p.comments} ความเห็น
              </span>
            </div>
          </Card>
        ))
      )}
    </AppShell>
  );
}