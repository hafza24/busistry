import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MyOrders from "@/components/dashboard/MyOrders";
import UserProfile from "@/components/dashboard/UserProfile";
import MySubscriptions from "@/components/dashboard/MySubscriptions";
import MyStoreAddons from "@/components/dashboard/MyStoreAddons";
import MyReviewPreferences from "@/components/dashboard/MyReviewPreferences";
import MyWebsiteUpdates from "@/components/dashboard/MyWebsiteUpdates";
import NotificationBell from "@/components/notifications/NotificationBell";
import RenewalLoginToast from "@/components/notifications/RenewalLoginToast";
import ReviewPromptBanner from "@/components/reviews/ReviewPromptBanner";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState("orders");

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    const v = searchParams.get("view");
    if (v && ["orders", "profile", "subscriptions", "updates", "addons", "reviews"].includes(v)) setActiveView(v);
  }, [searchParams]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return null;

  const handleViewChange = (v: string) => {
    setActiveView(v);
    const next = new URLSearchParams(searchParams);
    next.set("view", v);
    setSearchParams(next, { replace: true });
  };

  const startNewOrder = () => navigate("/templates");

  const renderView = () => {
    switch (activeView) {
      case "orders": return <MyOrders onNewOrder={startNewOrder} />;
      case "subscriptions": return <MySubscriptions />;
      case "updates": return <MyWebsiteUpdates />;
      case "addons": return <MyStoreAddons />;
      case "reviews": return <MyReviewPreferences />;
      case "profile": return <UserProfile />;
      default: return <MyOrders onNewOrder={startNewOrder} />;
    }
  };

  return (
    <SidebarProvider>
      <RenewalLoginToast />
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar activeView={activeView} onViewChange={handleViewChange} />
        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b border-border px-6">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold font-display text-foreground flex-1">
              {activeView === "orders" && "My Orders"}
              {activeView === "subscriptions" && "Subscriptions"}
              {activeView === "updates" && "Website Updates"}
              {activeView === "addons" && "Add-ons"}
              {activeView === "reviews" && "Review preferences"}
              {activeView === "profile" && "Profile"}
            </h1>
            <NotificationBell audience="user" />
          </header>
          <main className="flex-1 p-6"><ReviewPromptBanner />{renderView()}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
