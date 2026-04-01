import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MyOrders from "@/components/dashboard/MyOrders";
import OrderWebsiteWizard from "@/components/dashboard/OrderWebsiteWizard";
import UserProfile from "@/components/dashboard/UserProfile";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("orders");

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return null;

  const renderView = () => {
    switch (activeView) {
      case "orders":
        return <MyOrders onNewOrder={() => setActiveView("new-order")} />;
      case "new-order":
        return <OrderWebsiteWizard onComplete={() => setActiveView("orders")} onCancel={() => setActiveView("orders")} />;
      case "profile":
        return <UserProfile />;
      default:
        return <MyOrders onNewOrder={() => setActiveView("new-order")} />;
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
              {activeView === "orders" && "My Orders"}
              {activeView === "new-order" && "Order a Website"}
              {activeView === "profile" && "Profile"}
            </h1>
          </header>
          <main className="flex-1 p-6">{renderView()}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
