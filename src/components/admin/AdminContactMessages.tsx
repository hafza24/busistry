import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Mail, Trash2, CheckCircle2, Inbox, Reply } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const statusColor: Record<string, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  read: "bg-muted text-muted-foreground border-border",
  replied: "bg-primary/10 text-primary border-primary/20",
};

const AdminContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ContactMessage | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error("Failed to load messages", { description: error.message });
      return;
    }
    setMessages((data ?? []) as ContactMessage[]);
    if (data && data.length && !active) setActive(data[0] as ContactMessage);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-contact-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_messages" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
    if (error) return toast.error("Update failed", { description: error.message });
    setMessages((p) => p.map((m) => (m.id === id ? { ...m, status } : m)));
    if (active?.id === id) setActive({ ...active, status });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) return toast.error("Delete failed", { description: error.message });
    setMessages((p) => p.filter((m) => m.id !== id));
    if (active?.id === id) setActive(null);
    toast.success("Message deleted");
  };

  const openMessage = (m: ContactMessage) => {
    setActive(m);
    if (m.status === "new") updateStatus(m.id, "read");
  };

  const newCount = messages.filter((m) => m.status === "new").length;

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-4 h-[calc(100vh-8rem)]">
      {/* List */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-primary" />
            <h2 className="font-semibold font-display">Inbox</h2>
          </div>
          {newCount > 0 && <Badge>{newCount} new</Badge>}
        </div>
        <ScrollArea className="h-[calc(100%-3.25rem)]">
          {loading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading…</div>
          ) : messages.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No messages yet.</div>
          ) : (
            <ul className="divide-y divide-border">
              {messages.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => openMessage(m)}
                    className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
                      active?.id === m.id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium truncate">{m.name}</span>
                      <Badge variant="outline" className={`text-[10px] ${statusColor[m.status] ?? ""}`}>
                        {m.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground truncate">{m.subject}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{m.message}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {new Date(m.created_at).toLocaleString()}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </Card>

      {/* Detail */}
      <Card className="overflow-hidden">
        {active ? (
          <div className="flex flex-col h-full">
            <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold font-display truncate">{active.subject}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {active.name} · <a className="hover:underline" href={`mailto:${active.email}`}>{active.email}</a>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(active.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className={statusColor[active.status] ?? ""}>{active.status}</Badge>
              </div>
            </div>
            <CardContent className="flex-1 overflow-auto p-6">
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">{active.message}</p>
            </CardContent>
            <div className="px-6 py-3 border-t border-border flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <a href={`mailto:${active.email}?subject=Re: ${encodeURIComponent(active.subject)}`}>
                  <Reply className="h-4 w-4 mr-1.5" /> Reply
                </a>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus(active.id, "replied")}
                disabled={active.status === "replied"}
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Mark replied
              </Button>
              <Button size="sm" variant="ghost" className="ml-auto text-destructive" onClick={() => remove(active.id)}>
                <Trash2 className="h-4 w-4 mr-1.5" /> Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full grid place-items-center text-center p-8">
            <div>
              <Mail className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Select a message to read</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminContactMessages;
