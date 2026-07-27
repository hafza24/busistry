import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, MessageCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Contact {
  id: string;
  wa_id: string;
  name: string | null;
  profile_name: string | null;
  last_message_at: string | null;
  unread_count: number;
}

interface Message {
  id: string;
  direction: "in" | "out";
  type: string;
  content: any;
  status: string;
  created_at: string;
  error: string | null;
}

const AdminCRMInbox = () => {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const contactsQuery = useQuery({
    queryKey: ["crm-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_contacts")
        .select("id, wa_id, name, profile_name, last_message_at, unread_count")
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Contact[];
    },
  });

  const messagesQuery = useQuery({
    queryKey: ["crm-messages", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_messages")
        .select("id, direction, type, content, status, created_at, error")
        .eq("contact_id", selectedId!)
        .order("created_at", { ascending: true })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as Message[];
    },
  });

  // Realtime: refresh on any change
  useEffect(() => {
    const channel = supabase
      .channel("crm-inbox")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "crm_messages" },
        () => {
          qc.invalidateQueries({ queryKey: ["crm-messages"] });
          qc.invalidateQueries({ queryKey: ["crm-contacts"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "crm_contacts" },
        () => qc.invalidateQueries({ queryKey: ["crm-contacts"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messagesQuery.data?.length, selectedId]);

  // Clear unread when opening
  useEffect(() => {
    if (!selectedId) return;
    supabase.from("crm_contacts").update({ unread_count: 0 }).eq("id", selectedId).then(() => {});
  }, [selectedId]);

  const filtered = useMemo(() => {
    const list = contactsQuery.data ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) =>
        c.wa_id.toLowerCase().includes(q) ||
        (c.name ?? "").toLowerCase().includes(q) ||
        (c.profile_name ?? "").toLowerCase().includes(q),
    );
  }, [contactsQuery.data, search]);

  const selectedContact = filtered.find((c) => c.id === selectedId) ?? contactsQuery.data?.find((c) => c.id === selectedId);

  const send = async () => {
    if (!selectedId || !draft.trim()) return;
    setSending(true);
    const text = draft.trim();
    try {
      const { error } = await supabase.functions.invoke("whatsapp-send", {
        body: { contact_id: selectedId, text },
      });
      if (error) throw error;
      setDraft("");
      qc.invalidateQueries({ queryKey: ["crm-messages", selectedId] });
      qc.invalidateQueries({ queryKey: ["crm-contacts"] });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to send", { description: err?.message ?? "Check WhatsApp config" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-[calc(100vh-8rem)] border border-border rounded-lg overflow-hidden bg-card">
      {/* Contacts */}
      <aside className="border-r border-border flex flex-col min-h-0">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {contactsQuery.isLoading ? (
            <div className="p-6 text-center text-muted-foreground text-sm">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">No conversations yet.</div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full text-left p-3 hover:bg-muted transition ${
                      selectedId === c.id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {c.name || c.profile_name || `+${c.wa_id}`}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">+{c.wa_id}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {c.last_message_at && (
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(c.last_message_at), { addSuffix: false })}
                          </span>
                        )}
                        {c.unread_count > 0 && (
                          <Badge className="h-5 px-1.5 text-[10px]">{c.unread_count}</Badge>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </aside>

      {/* Chat pane */}
      <section className="flex flex-col min-h-0">
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <MessageCircle className="h-10 w-10 opacity-40" />
            <p className="text-sm">Select a conversation to start chatting.</p>
          </div>
        ) : (
          <>
            <header className="border-b border-border px-4 py-3">
              <div className="font-medium">
                {selectedContact?.name || selectedContact?.profile_name || `+${selectedContact?.wa_id}`}
              </div>
              <div className="text-xs text-muted-foreground">+{selectedContact?.wa_id}</div>
            </header>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/30">
              {messagesQuery.isLoading ? (
                <div className="text-center text-sm text-muted-foreground">Loading messages…</div>
              ) : (messagesQuery.data ?? []).length === 0 ? (
                <div className="text-center text-sm text-muted-foreground">No messages yet.</div>
              ) : (
                (messagesQuery.data ?? []).map((m) => {
                  const isOut = m.direction === "out";
                  const text = m.content?.text ?? (m.type !== "text" ? `[${m.type}]` : "");
                  return (
                    <div key={m.id} className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                          isOut
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-card border border-border rounded-bl-sm"
                        }`}
                      >
                        <div className="whitespace-pre-wrap break-words">{text}</div>
                        <div className={`mt-1 text-[10px] ${isOut ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {isOut && ` · ${m.status}`}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="border-t border-border p-3 flex items-center gap-2"
            >
              <Input
                placeholder="Type a message…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={sending}
                maxLength={4000}
              />
              <Button type="submit" disabled={sending || !draft.trim()} className="gap-1">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send
              </Button>
            </form>
          </>
        )}
      </section>
    </div>
  );
};

export default AdminCRMInbox;
