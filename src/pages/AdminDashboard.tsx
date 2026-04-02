import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminWebsiteOrders from "@/components/admin/AdminWebsiteOrders";
import AdminRequestManagement from "@/components/admin/AdminRequestManagement";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import AdminTemplateManagement from "@/components/admin/AdminTemplateManagement";
import AdminPlanManagement from "@/components/admin/AdminPlanManagement";

const viewTitles: Record<string, string> = {
  orders: "Website Orders",
  requests: "Store Requests (Legacy)",
  users: "User Management",
  templates: "Template Management",
  plans: "Plan Management",
};

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("orders");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && isAdmin === false) navigate("/dashboard", { replace: true });
  }, [isAdmin, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }
  if (!user || !isAdmin) return null;

  const renderView = () => {
    switch (activeView) {
      case "orders": return <AdminWebsiteOrders />;
      case "requests": return <AdminRequestManagement />;
      case "users": return <AdminUserManagement />;
      case "templates": return <AdminTemplateManagement />;
      case "plans": return <AdminPlanManagement />;
      default: return <AdminWebsiteOrders />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeView={activeView} onViewChange={setActiveView} />
        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b border-border px-6">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold font-display text-foreground">
              {viewTitles[activeView] ?? "Admin"}
            </h1>
          </header>
          <main className="flex-1 p-6">{renderView()}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
