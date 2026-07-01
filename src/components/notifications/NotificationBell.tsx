import { Bell, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, useMarkNotificationRead } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Props { audience?: "user" | "admin" }

export default function NotificationBell({ audience = "user" }: Props) {
  const { data = [] } = useNotifications(audience);
  const markRead = useMarkNotificationRead();
  const navigate = useNavigate();
  const unread = data.filter((n) => !n.read_at);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread.length > 0 && (
            <span className="absolute top-1 right-1 h-4 min-w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
              {unread.length > 9 ? "9+" : unread.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="font-semibold text-sm">Notifications</div>
          {unread.length > 0 && (
            <Button size="sm" variant="ghost" onClick={() => markRead.mutate(unread.map((n) => n.id))}>
              <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-96">
          {data.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground p-8">You're all caught up.</div>
          ) : (
            <ul className="divide-y">
              {data.map((n) => (
                <li
                  key={n.id}
                  className={cn("p-3 cursor-pointer hover:bg-muted/40", !n.read_at && "bg-primary/5")}
                  onClick={() => {
                    if (!n.read_at) markRead.mutate([n.id]);
                    if (n.link) navigate(n.link);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-sm">{n.title}</div>
                    {!n.read_at && <Badge variant="default" className="text-[10px]">new</Badge>}
                  </div>
                  {n.body && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</div>}
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
