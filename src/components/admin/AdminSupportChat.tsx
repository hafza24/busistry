import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { Send, MessageSquare, Bot, Headphones, UserRound, Loader2, CheckCircle2 } from "lucide-react";

interface Thread {
  id: string; user_id: string; title: string; mode: "ai" | "human";
  status: string; last_message_at: string; created_at: string;
}
interface Message {
  id: string; thread_id: string; role: string; content: string; created_at: string;
}

const AdminSupportChat = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<"human" | "all">("human");
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = threads.find((t) => t.id === activeId);

  useEffect(() => { loadThreads(); }, [filter]);

  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    const channel = supabase.channel(`admin-chat-${activeId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "chat_messages",
        filter: `thread_id=eq.${activeId}`,
      }, (payload) => {
        const m = payload.new as Message;
        setMessages((p) => p.some((x) => x.id === m.id) ? p : [...p, m]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Realtime: refresh thread list on new messages
  useEffect(() => {
    const channel = supabase.channel("admin-threads-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_threads" }, () => loadThreads())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [filter]);

  const loadThreads = async () => {
    let query = supabase.from("chat_threads").select("*").order("last_message_at", { ascending: false }).limit(100);
    if (filter === "human") query = query.eq("mode", "human");
    const { data } = await query;
    const list = (data || []) as Thread[];
    setThreads(list);

    // Fetch profile names for user_ids
    const ids = Array.from(new Set(list.map((t) => t.user_id)));
    if (ids.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      const map: Record<string, string> = {};
      (profs || []).forEach((p: any) => { map[p.id] = p.full_name || "User"; });
      setEmails(map);
    }
  };

  const loadMessages = async (id: string) => {
    const { data } = await supabase.from("chat_messages").select("*").eq("thread_id", id).order("created_at");
    setMessages((data || []) as Message[]);
  };

  const sendReply = async () => {
    if (!active || !reply.trim() || !user) return;
    setSending(true);
    const text = reply.trim();
    setReply("");
    const { error } = await supabase.from("chat_messages").insert({
      thread_id: active.id, role: "admin", content: text, author_id: user.id,
    });
    if (error) { toast.error(error.message); setReply(text); }
    await supabase.from("chat_threads").update({ last_message_at: new Date().toISOString() }).eq("id", active.id);
    setSending(false);
  };

  const resolve = async () => {
    if (!active) return;
    const { error } = await supabase.from("chat_threads").update({ status: "resolved" }).eq("id", active.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Marked as resolved");
    loadThreads();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-160px)] min-h-[500px]">
      <Card className="flex flex-col overflow-hidden">
        <div className="p-3 border-b flex gap-1">
          <Button size="sm" variant={filter === "human" ? "default" : "outline"} onClick={() => setFilter("human")} className="flex-1">
            Human ({threads.filter((t) => t.mode === "human").length})
          </Button>
          <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} className="flex-1">
            All
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {threads.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No conversations.</div>
            ) : threads.map((t) => (
              <div key={t.id} className={`rounded-md px-2 py-2 text-sm cursor-pointer hover:bg-accent ${activeId === t.id ? "bg-accent" : ""}`}
                onClick={() => setActiveId(t.id)}>
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate font-medium">{t.title}</div>
                  <Badge variant={t.status === "resolved" ? "outline" : t.mode === "human" ? "default" : "secondary"} className="text-[10px] shrink-0">
                    {t.status === "resolved" ? "Resolved" : t.mode === "human" ? "Human" : "AI"}
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 truncate">
                  {emails[t.user_id] || t.user_id.slice(0, 8)} · {new Date(t.last_message_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Card className="flex flex-col overflow-hidden">
        {!active ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState icon={MessageSquare} title="Select a conversation" description="Pick a thread from the list to view and reply." />
          </div>
        ) : (
          <>
            <div className="p-3 border-b flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{active.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {emails[active.user_id] || active.user_id} · Mode: {active.mode}
                </div>
              </div>
              <div className="flex gap-2">
                {active.status !== "resolved" && (
                  <Button size="sm" variant="outline" onClick={resolve}>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Resolve
                  </Button>
                )}
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => <Bubble key={m.id} m={m} />)}
            </div>

            <div className="p-3 border-t">
              <div className="flex gap-2 items-end">
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Reply to the user..."
                  rows={2}
                  maxLength={4000}
                  className="resize-none"
                  disabled={sending}
                />
                <Button onClick={sendReply} disabled={sending || !reply.trim()} size="icon" className="h-[60px] w-[60px] shrink-0">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

const Bubble = ({ m }: { m: Message }) => {
  if (m.role === "system") return <div className="text-center text-xs text-muted-foreground italic py-1">{m.content}</div>;
  const isUser = m.role === "user";
  const isAdmin = m.role === "admin";
  return (
    <div className={`flex gap-2 ${isAdmin ? "justify-end" : "justify-start"}`}>
      {!isAdmin && (
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          {isUser ? <UserRound className="h-4 w-4 text-primary" /> : <Bot className="h-4 w-4 text-primary" />}
        </div>
      )}
      <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words ${
        isAdmin ? "bg-primary text-primary-foreground" : isUser ? "bg-muted" : "bg-accent"
      }`}>
        <div className="text-[10px] font-semibold mb-1 opacity-70">
          {isAdmin ? "You (Admin)" : isUser ? "User" : "AI Assistant"}
        </div>
        {m.content}
      </div>
      {isAdmin && (
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Headphones className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
};

export default AdminSupportChat;
