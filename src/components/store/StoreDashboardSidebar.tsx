import { useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Package, FolderTree, ShoppingCart, Settings, ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  storeName: string;
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "settings", label: "Site Settings", icon: Settings },
];

const StoreDashboardSidebar = ({ storeName, activeView, onViewChange }: Props) => {
  const navigate = useNavigate();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <p className="font-display font-bold text-lg text-sidebar-foreground truncate">{storeName}</p>
        <p className="text-xs text-muted-foreground">Store Dashboard</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
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
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default StoreDashboardSidebar;
