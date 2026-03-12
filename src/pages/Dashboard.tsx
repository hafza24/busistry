import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MyStores from "@/components/dashboard/MyStores";
import MyRequests from "@/components/dashboard/MyRequests";
import LaunchStoreWizard from "@/components/dashboard/LaunchStoreWizard";
import UserProfile from "@/components/dashboard/UserProfile";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("stores");

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return null;

  const renderView = () => {
    switch (activeView) {
      case "stores":
        return <MyStores onLaunchStore={() => setActiveView("new-store")} />;
      case "new-store":
        return (
          <LaunchStoreWizard
            onComplete={() => setActiveView("requests")}
            onCancel={() => setActiveView("stores")}
          />
        );
      case "requests":
        return <MyRequests />;
      case "profile":
        return <UserProfile />;
      default:
        return <MyStores onLaunchStore={() => setActiveView("new-store")} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar activeView={activeView} onViewChange={setActiveView} />
        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b border-border px-6">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold font-display text-foreground">
              {activeView === "stores" && "My Stores"}
              {activeView === "new-store" && "Launch Store"}
              {activeView === "requests" && "My Requests"}
              {activeView === "profile" && "Profile"}
            </h1>
          </header>
          <main className="flex-1 p-6">
            {renderView()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
