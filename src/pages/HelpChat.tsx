import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { Plus, Send, Trash2, Bot, UserRound, Headphones, MessageSquare, ArrowLeft, Loader2 } from "lucide-react";

interface Thread {
  id: string; title: string; mode: "ai" | "human"; status: string;
  last_message_at: string; created_at: string;
}
interface Message {
  id: string; thread_id: string; role: "user" | "assistant" | "admin" | "system";
  content: string; created_at: string;
}

const HelpChat = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const active = threads.find((t) => t.id === activeId);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    loadThreads();
  }, [user]);

  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    loadMessages(activeId);

    const channel = supabase
      .channel(`chat-${activeId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "chat_messages",
        filter: `thread_id=eq.${activeId}`,
      }, (payload) => {
        setMessages((prev) => {
          const m = payload.new as Message;
          if (prev.some((x) => x.id === m.id)) return prev;
          return [...prev, m];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => { if (activeId) inputRef.current?.focus(); }, [activeId]);

  const loadThreads = async () => {
    setLoadingThreads(true);
    const { data } = await supabase.from("chat_threads").select("*")
      .order("last_message_at", { ascending: false });
    setThreads((data || []) as Thread[]);
    setLoadingThreads(false);
  };

  const loadMessages = async (id: string) => {
    const { data } = await supabase.from("chat_messages").select("*")
      .eq("thread_id", id).order("created_at");
    setMessages((data || []) as Message[]);
  };

  const newThread = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("chat_threads")
      .insert({ user_id: user.id, title: "New conversation", mode: "ai" })
      .select().single();
    if (error) { toast.error(error.message); return; }
    setThreads((p) => [data as Thread, ...p]);
    setActiveId(data.id);
  };

  const deleteThread = async (id: string) => {
    const { error } = await supabase.from("chat_threads").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setThreads((p) => p.filter((t) => t.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const switchMode = async (mode: "ai" | "human") => {
    if (!active) return;
    const { error } = await supabase.from("chat_threads").update({ mode }).eq("id", active.id);
    if (error) { toast.error(error.message); return; }
    setThreads((p) => p.map((t) => t.id === active.id ? { ...t, mode } : t));
    if (mode === "human") {
      await supabase.from("chat_messages").insert({
        thread_id: active.id, role: "system",
        content: "Escalated to a human agent. An admin will reply shortly.",
      });
      toast.success("Escalated to human support");
    } else {
      toast.success("Switched to AI assistant");
    }
  };

  const send = async () => {
    if (!active || !input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    if (active.mode === "human") {
      // Persist directly; admins will respond
      const { error } = await supabase.from("chat_messages").insert({
        thread_id: active.id, role: "user", content: text, author_id: user!.id,
      });
      if (error) toast.error(error.message);
      await supabase.from("chat_threads").update({ last_message_at: new Date().toISOString() }).eq("id", active.id);
      setSending(false);
      inputRef.current?.focus();
      return;
    }

    // AI streaming
    // Optimistically show user message
    const optimisticId = `tmp-${Date.now()}`;
    setMessages((p) => [...p, {
      id: optimisticId, thread_id: active.id, role: "user",
      content: text, created_at: new Date().toISOString(),
    }]);
    setStreaming("");

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/help-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ threadId: active.id, message: text }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        toast.error(err.error || "Failed to send");
        setStreaming("");
        setSending(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreaming(acc);
      }
      setStreaming("");
      // Realtime will insert the assistant message; also refresh if not received quickly
      setTimeout(() => loadMessages(active.id), 400);
      // If title got updated, refresh threads
      loadThreads();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <SEO title="Help Chat — Busistree" description="Chat with our AI assistant or a human support agent." path="/help/chat" />
      <div className="container max-w-6xl py-6">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/help")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Help Center
          </Button>
          <h1 className="text-2xl font-display font-bold">Support Chat</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-180px)] min-h-[500px]">
          {/* Thread list */}
          <Card className="flex flex-col overflow-hidden">
            <div className="p-3 border-b">
              <Button onClick={newThread} className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-1" /> New chat
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {loadingThreads ? (
                  <div className="p-4 text-sm text-muted-foreground">Loading...</div>
                ) : threads.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No conversations yet.</div>
                ) : threads.map((t) => (
                  <div key={t.id} className={`group flex items-center gap-1 rounded-md px-2 py-2 text-sm cursor-pointer hover:bg-accent ${activeId === t.id ? "bg-accent" : ""}`}
                    onClick={() => setActiveId(t.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{t.title}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge variant={t.mode === "human" ? "default" : "secondary"} className="text-[10px] px-1 py-0">
                          {t.mode === "human" ? "Human" : "AI"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(t.last_message_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); deleteThread(t.id); }}
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Chat area */}
          <Card className="flex flex-col overflow-hidden">
            {!active ? (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState icon={MessageSquare} title="Start a conversation" description="Create a new chat to talk with our AI or a human support agent." />
              </div>
            ) : (
              <>
                <div className="p-3 border-b flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {active.mode === "human" ? <Headphones className="h-4 w-4 text-primary shrink-0" /> : <Bot className="h-4 w-4 text-primary shrink-0" />}
                    <span className="font-medium truncate">{active.title}</span>
                  </div>
                  <div className="flex gap-1">
                    {active.mode === "ai" ? (
                      <Button size="sm" variant="outline" onClick={() => switchMode("human")}>
                        <Headphones className="h-4 w-4 mr-1" /> Talk to a human
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => switchMode("ai")}>
                        <Bot className="h-4 w-4 mr-1" /> Back to AI
                      </Button>
                    )}
                  </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && !streaming && (
                    <div className="text-center text-sm text-muted-foreground py-8">
                      {active.mode === "ai"
                        ? "Ask me anything about Busistree — plans, orders, setup, etc."
                        : "Send a message. A human admin will respond as soon as possible."}
                    </div>
                  )}
                  {messages.filter((m) => m.role !== "system" || true).map((m) => <MessageBubble key={m.id} m={m} />)}
                  {streaming && (
                    <MessageBubble m={{ id: "streaming", thread_id: active.id, role: "assistant", content: streaming, created_at: "" }} />
                  )}
                  {sending && !streaming && active.mode === "ai" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking...
                    </div>
                  )}
                </div>

                <div className="p-3 border-t">
                  <div className="flex gap-2 items-end">
                    <Textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                      }}
                      placeholder={active.mode === "human" ? "Message support..." : "Ask a question..."}
                      rows={2}
                      maxLength={4000}
                      className="resize-none"
                      disabled={sending}
                    />
                    <Button onClick={send} disabled={sending || !input.trim()} size="icon" className="h-[60px] w-[60px] shrink-0">
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

const MessageBubble = ({ m }: { m: Message }) => {
  if (m.role === "system") {
    return (
      <div className="text-center text-xs text-muted-foreground py-2 italic">{m.content}</div>
    );
  }
  const isUser = m.role === "user";
  const isAdmin = m.role === "admin";
  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          {isAdmin ? <Headphones className="h-4 w-4 text-primary" /> : <Bot className="h-4 w-4 text-primary" />}
        </div>
      )}
      <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words ${
        isUser ? "bg-primary text-primary-foreground" : isAdmin ? "bg-accent" : "bg-muted"
      }`}>
        {!isUser && (
          <div className="text-[10px] font-semibold mb-1 opacity-70">
            {isAdmin ? "Support Agent" : "AI Assistant"}
          </div>
        )}
        {m.content}
      </div>
      {isUser && (
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
          <UserRound className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
};

export default HelpChat;
