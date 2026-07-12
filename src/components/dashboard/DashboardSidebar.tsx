import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Globe, Plus, User, LogOut, Home, ShieldCheck, MessageSquarePlus, Repeat, LifeBuoy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeedbackDialog from "@/components/feedback/FeedbackDialog";
import logo from "@/assets/logo.png";

interface DashboardSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const DashboardSidebar = ({ activeView, onViewChange }: DashboardSidebarProps) => {
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const menuItems = [
    { id: "orders", label: "My Orders", icon: Globe },
    { id: "subscriptions", label: "Subscriptions", icon: Repeat },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sidebar-foreground hover:text-sidebar-primary transition-colors">
          <img src={logo} alt="Busistree" className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform duration-300 hover:scale-105" />
        </button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton isActive={activeView === item.id} onClick={() => onViewChange(item.id)} tooltip={item.label}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/help")} tooltip="Help Center">
                  <LifeBuoy className="h-4 w-4" />
                  <span>Help Center</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/help/chat")} tooltip="Support Chat">
                  <MessageCircle className="h-4 w-4" />
                  <span>Support Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="px-2 mt-2">
              <FeedbackDialog
                trigger={
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <MessageSquarePlus className="h-4 w-4 mr-2" /> Leave feedback
                  </Button>
                }
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border space-y-3">
        <button
          type="button"
          onClick={() => onViewChange("profile")}
          aria-label="Open profile"
          aria-current={activeView === "profile" ? "page" : undefined}
          className={`group w-full flex items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar ${
            activeView === "profile"
              ? "border-primary/40 bg-primary/10 shadow-soft"
              : "border-sidebar-border/60 bg-sidebar-accent/40 hover:border-primary/40 hover:bg-sidebar-accent"
          }`}
        >
          <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-brand flex items-center justify-center text-primary-foreground text-xs font-bold shadow-brand transition-transform group-hover:scale-105">
            {(user?.user_metadata?.full_name || user?.email || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
              {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
            </div>
            {user?.user_metadata?.full_name && (
              <div className="text-[11px] text-muted-foreground truncate leading-tight">{user.email}</div>
            )}
          </div>
          <User className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
        </button>

        <div className="grid grid-cols-2 gap-2">
          {isAdmin && (
            <Button
              variant="glass-accent"
              size="sm"
              className="col-span-2 rounded-full gap-1.5 shadow-soft"
              onClick={() => navigate("/admin")}
            >
              <ShieldCheck className="h-4 w-4" /> Admin Console
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full gap-1.5 border border-sidebar-border/60 hover:bg-sidebar-accent hover:text-sidebar-primary"
            onClick={() => navigate("/")}
          >
            <Home className="h-4 w-4" /> Home
          </Button>
          <Button
            variant="glass-danger"
            size="sm"
            className="rounded-full gap-1.5"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
