import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, PolarGrid, PolarAngleAxis, Radar, RadarChart,
} from "recharts";
import { ChevronLeft, ChevronRight, Download, Plus } from "lucide-react";
import ComingSoonToggle from "./ComingSoonToggle";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const currency = (n: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(n);

const AdminOverview = () => {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: "1", text: "Review payment verifications", done: false },
    { id: "2", text: "Reply to support chats", done: false },
    { id: "3", text: "Approve pending templates", done: true },
  ]);

  const { data: stats } = useQuery({
    queryKey: ["admin_overview_stats"],
    queryFn: async () => {
      const [orders, users, subs, requests, tickets, feedback, templates, websiteOrders] = await Promise.all([
        supabase.from("stores").select("id, created_at, status, plans(price_pkr)"),
        supabase.from("profiles").select("id, created_at"),
        supabase.from("subscriptions").select("id, status"),
        supabase.from("store_requests").select("id, status, created_at"),
        supabase.from("support_tickets").select("id, status, created_at"),
        supabase.from("feedback_submissions").select("id, rating, approved"),
        supabase.from("templates").select("id, is_active"),
        supabase.from("website_orders").select("id, created_at, amount, status"),
      ]);
      return {
        stores: orders.data ?? [],
        users: users.data ?? [],
        subs: subs.data ?? [],
        requests: requests.data ?? [],
        tickets: tickets.data ?? [],
        feedback: feedback.data ?? [],
        templates: templates.data ?? [],
        websiteOrders: websiteOrders.data ?? [],
      };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["admin_overview_recent"],
    queryFn: async () => {
      const { data } = await supabase
        .from("stores")
        .select("id, name, status, created_at, updated_at, plans(name)")
        .order("updated_at", { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });

  const totals = useMemo(() => {
    const stores = stats?.stores ?? [];
    const users = stats?.users ?? [];
    const subs = stats?.subs ?? [];
    const requests = stats?.requests ?? [];
    const websiteOrders = stats?.websiteOrders ?? [];
    const activeSubs = subs.filter((s: any) => s.status === "active").length;
    const pending = requests.filter((r: any) => r.status === "pending").length;
    const revenue =
      stores.reduce((sum: number, s: any) => sum + (s.plans?.price_pkr ?? 0), 0) +
      websiteOrders.reduce((sum: number, o: any) => sum + (Number(o.amount) || 0), 0);
    return {
      orders: stores.length + websiteOrders.length,
      users: users.length,
      activeSubs,
      pending,
      revenue,
      completion: stores.length ? Math.round((stores.filter((s: any) => s.status === "activated").length / stores.length) * 100) : 0,
    };
  }, [stats]);

  const revenueSeries = useMemo(() => {
    const stores = stats?.stores ?? [];
    const websiteOrders = stats?.websiteOrders ?? [];
    const months: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString("en", { month: "short" });
      months[key] = 0;
    }
    stores.forEach((s: any) => {
      const key = new Date(s.created_at).toLocaleString("en", { month: "short" });
      if (key in months) months[key] += s.plans?.price_pkr ?? 0;
    });
    websiteOrders.forEach((o: any) => {
      const key = new Date(o.created_at).toLocaleString("en", { month: "short" });
      if (key in months) months[key] += Number(o.amount) || 0;
    });
    return Object.entries(months).map(([month, value]) => ({ month, value }));
  }, [stats]);

  const perfSeries = useMemo(() => {
    const stores = stats?.stores ?? [];
    const websiteOrders = stats?.websiteOrders ?? [];
    const now = new Date();
    const buckets: { month: string; current: number; prev: number; monthIdx: number; yearIdx: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        month: d.toLocaleString("en", { month: "short" }),
        current: 0,
        prev: 0,
        monthIdx: d.getMonth(),
        yearIdx: d.getFullYear(),
      });
    }
    const bump = (arr: any[], key: "current" | "prev", yearOffset: number) => {
      arr.forEach((row: any) => {
        const d = new Date(row.created_at);
        const b = buckets.find(
          (x) => x.monthIdx === d.getMonth() && x.yearIdx - yearOffset === d.getFullYear()
        );
        if (b) b[key] += 1;
      });
    };
    bump(stores, "current", 0);
    bump(websiteOrders, "current", 0);
    bump(stores, "prev", 1);
    bump(websiteOrders, "prev", 1);
    return buckets.map(({ month, current, prev }) => ({ month, current, prev }));
  }, [stats]);

  const radarData = useMemo(() => {
    const templates = stats?.templates ?? [];
    const tickets = stats?.tickets ?? [];
    const feedback = stats?.feedback ?? [];
    const subs = stats?.subs ?? [];
    const users = stats?.users ?? [];
    const stores = stats?.stores ?? [];

    const activeTpl = templates.filter((t: any) => t.is_active).length;
    const templatesScore = templates.length
      ? Math.round((activeTpl / templates.length) * 100)
      : 0;

    const resolved = tickets.filter((t: any) => ["resolved", "closed"].includes(t.status)).length;
    const supportScore = tickets.length ? Math.round((resolved / tickets.length) * 100) : 0;

    const activeSubs = subs.filter((s: any) => s.status === "active").length;
    const revenueScore = subs.length ? Math.round((activeSubs / subs.length) * 100) : 0;

    const engagementScore = users.length
      ? Math.min(100, Math.round((stores.length / users.length) * 100))
      : 0;

    const approved = feedback.filter((f: any) => f.approved && f.rating);
    const avgRating = approved.length
      ? approved.reduce((s: number, f: any) => s + (Number(f.rating) || 0), 0) / approved.length
      : 0;
    const qualityScore = Math.round((avgRating / 5) * 100);

    return [
      { axis: "Templates", value: templatesScore },
      { axis: "Support", value: supportScore },
      { axis: "Revenue", value: revenueScore },
      { axis: "Engagement", value: engagementScore },
      { axis: "Quality", value: qualityScore },
    ];
  }, [stats]);



  const monthLabel = cursor.toLocaleString("en", { month: "long", year: "numeric" });
  const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const today = new Date();
  const isToday = (d: number) =>
    today.getFullYear() === cursor.getFullYear() &&
    today.getMonth() === cursor.getMonth() &&
    today.getDate() === d;

  const addTask = () => {
    if (!task.trim()) return;
    setTasks((prev) => [...prev, { id: crypto.randomUUID(), text: task.trim(), done: false }]);
    setTask("");
  };

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <ComingSoonToggle />
      {/* Header row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-card to-secondary/30 border-border/60">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <p className="text-sm text-muted-foreground">{greeting}, Admin</p>
              <h2 className="text-3xl font-display font-bold text-foreground mt-1">
                Ready to make today productive?
              </h2>
              <p className="text-4xl font-display font-bold text-primary mt-4 tabular-nums">
                {now.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {now.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <div className="grid grid-cols-4 gap-3 flex-1 min-w-[420px]">
              <StatMini label="Total Orders" value={totals.orders} />
              <StatMini label="Active Users" value={totals.users} />
              <StatMini label="Subscriptions" value={totals.activeSubs} />
              <StatMini label="Pending" value={totals.pending} />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border/60">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Insights</p>
            <Badge variant="secondary" className="text-xs">Performance</Badge>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="relative h-32 w-32">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r="52" className="fill-none stroke-muted" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52"
                  className="fill-none stroke-primary transition-all"
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(totals.completion / 100) * 326.7} 326.7`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-display font-bold text-foreground">{totals.completion}%</span>
                <span className="text-[10px] text-muted-foreground">completion</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <InsightRow label="Store activation" value={totals.completion} />
            <InsightRow label="User engagement" value={radarData[3]?.value ?? 0} />
            <InsightRow label="Response rate" value={radarData[1]?.value ?? 0} />

          </div>
        </Card>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick tasks */}
        <Card className="p-5 border-border/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">Quick Tasks</h3>
              <p className="text-xs text-muted-foreground">Manage your daily tasks</p>
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Add a quick task…"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              className="h-9"
            />
            <Button size="sm" onClick={addTask} className="h-9 px-3"><Plus className="h-4 w-4" /></Button>
          </div>
          <ul className="space-y-2 max-h-56 overflow-auto">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/50 transition-colors">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => setTasks((prev) => prev.map((x) => x.id === t.id ? { ...x, done: !x.done } : x))}
                  className="h-4 w-4 accent-primary"
                />
                <span className={`text-sm ${t.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {t.text}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Calendar */}
        <Card className="p-5 border-border/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">Calendar</h3>
              <p className="text-xs text-muted-foreground">{monthLabel}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground mb-1">
            {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`b-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const active = isToday(day);
              return (
                <button
                  key={day}
                  className={`h-8 rounded-md text-xs transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "hover:bg-secondary text-foreground"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Revenue */}
        <Card className="p-5 border-border/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">Revenue Analytics</h3>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <Badge variant="secondary" className="text-xs">{currency(totals.revenue)}</Badge>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={30} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => currency(v)}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent stores/projects */}
        <Card className="lg:col-span-2 p-5 border-border/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">Recent Orders</h3>
              <p className="text-xs text-muted-foreground">Overview of latest store activity</p>
            </div>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/60">
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">Plan</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(recent ?? []).map((r: any) => (
                <TableRow key={r.id} className="border-border/40">
                  <TableCell className="font-medium text-sm">{r.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.plans?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={r.status === "activated" ? "default" : "secondary"}
                      className="text-[10px] capitalize"
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(r.updated_at ?? r.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {!recent?.length && (
                <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">No recent orders</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Performance metrics */}
        <Card className="p-5 border-border/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">Performance</h3>
              <p className="text-xs text-muted-foreground">Monthly activity</p>
            </div>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perfSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="current" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="prev" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-foreground mb-2">Performance Analytics</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius={60}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const StatMini = ({ label, value }: { label: string; value: number }) => (
  <div className="p-3 rounded-lg bg-background/60 border border-border/60">
    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="text-xl font-display font-bold text-foreground mt-1 tabular-nums">{value}</p>
  </div>
);

const InsightRow = ({ label, value }: { label: string; value: number }) => (
  <div className="space-y-1">
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}%</span>
    </div>
    <Progress value={value} className="h-1.5" />
  </div>
);

export default AdminOverview;
