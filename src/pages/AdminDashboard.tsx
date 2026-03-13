import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminRequestManagement from "@/components/admin/AdminRequestManagement";
import AdminStoreManagement from "@/components/admin/AdminStoreManagement";
import AdminUserManagement from "@/components/admin/AdminUserManagement";

const viewTitles: Record<string, string> = {
  requests: "Store Requests",
  stores: "Store Management",
  users: "User Management",
};

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("requests");

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
      case "requests": return <AdminRequestManagement />;
      case "stores": return <AdminStoreManagement />;
      case "users": return <AdminUserManagement />;
      default: return <AdminRequestManagement />;
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
