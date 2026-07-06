import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ClipboardList, Users, Home, LogOut, ShieldCheck, LayoutTemplate, Globe, CreditCard, Sparkles, FileText, Plug, TrendingUp, ScrollText, MessageSquare, Repeat, LifeBuoy, MessageCircle, Mail, Tag } from "lucide-react";

interface AdminSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: "orders", label: "Website Orders", icon: Globe },
  { id: "subscriptions", label: "Subscriptions", icon: Repeat },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  
  { id: "plans", label: "Plans", icon: CreditCard },
  { id: "addons", label: "Add-ons", icon: Sparkles },
  { id: "store_addons", label: "Add-on Orders", icon: Sparkles },
  { id: "upgrades", label: "Upgrade Orders", icon: TrendingUp },
  
  { id: "users", label: "Users", icon: Users },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "help_center", label: "Help Center", icon: LifeBuoy },
  { id: "support_chat", label: "Support Chat", icon: MessageCircle },
  { id: "audit", label: "Audit Logs", icon: ScrollText },
];

const AdminSidebar = ({ activeView, onViewChange }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Button variant="ghost" className="w-full justify-start gap-2 font-display font-bold text-primary" onClick={() => navigate("/")}>
          <ShieldCheck className="h-5 w-5" /> Admin Panel
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton isActive={activeView === item.id} onClick={() => onViewChange(item.id)}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-2">
        <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} aria-label="Go to user dashboard"><Home className="h-4 w-4" aria-hidden="true" /></Button>
          <Button variant="ghost" size="sm" onClick={signOut} aria-label="Sign out"><LogOut className="h-4 w-4" aria-hidden="true" /></Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
