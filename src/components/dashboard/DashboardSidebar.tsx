import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Store, Plus, FileText, User, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const DashboardSidebar = ({ activeView, onViewChange }: DashboardSidebarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: "stores", label: "My Stores", icon: Store },
    { id: "new-store", label: "Launch Store", icon: Plus },
    { id: "requests", label: "My Requests", icon: FileText },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sidebar-foreground hover:text-sidebar-primary transition-colors">
          <span className="text-xl">🌳</span>
          <span className="font-display font-bold text-lg">Busistree</span>
        </button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeView === item.id}
                    onClick={() => onViewChange(item.id)}
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="text-sm text-muted-foreground mb-2 truncate">
          {user?.user_metadata?.full_name || user?.email}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate("/")}>
            <Home className="h-4 w-4 mr-1" /> Home
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-1" /> Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
