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
import AdminOverview from "@/components/admin/AdminOverview";

import AdminPlanManagement from "@/components/admin/AdminPlanManagement";
import AdminAddonsHub from "@/components/admin/AdminAddonsHub";
import AdminWebsiteProducts from "@/components/admin/AdminWebsiteProducts";
import AdminStoreAddons from "@/components/admin/AdminStoreAddons";
import AdminUpgradeOrders from "@/components/admin/AdminUpgradeOrders";
import AdminAuditLogs from "@/components/admin/AdminAuditLogs";
import AdminFeedbackModeration from "@/components/admin/AdminFeedbackModeration";
import AdminReviewsModeration from "@/components/admin/AdminReviewsModeration";
import AdminSubscriptions from "@/components/admin/AdminSubscriptions";
import AdminHelpCenter from "@/components/admin/AdminHelpCenter";
import AdminSupportChat from "@/components/admin/AdminSupportChat";
import AdminNewsletterSubscribers from "@/components/admin/AdminNewsletterSubscribers";
import AdminContactMessages from "@/components/admin/AdminContactMessages";
import NotificationBell from "@/components/notifications/NotificationBell";

const viewTitles: Record<string, string> = {
  overview: "Overview",
  orders: "Website Orders",
  subscriptions: "Recurring Subscriptions",
  requests: "Store Requests (Legacy)",
  users: "User Management",
  templates: "Template Management",
  
  plans: "Plan Management",
  addons: "Add-ons & Integrations",
  website_products: "Website Products",
  store_addons: "Add-on Orders",
  upgrades: "Upgrade Orders",
  feedback: "Feedback Moderation",
  reviews: "Reviews Moderation",
  help_center: "Help Center",
  support_chat: "Support Chat",
  audit: "Audit Logs",
  newsletter: "Newsletter Subscribers",
  contact_messages: "Contact Messages",
};

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("overview");

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
      case "overview": return <AdminOverview />;
      case "orders": return <AdminWebsiteOrders />;
      case "subscriptions": return <AdminSubscriptions />;
      case "requests": return <AdminRequestManagement />;
      case "users": return <AdminUserManagement />;
      case "templates": return <AdminTemplateManagement />;
      
      case "plans": return <AdminPlanManagement />;
      case "addons": return <AdminAddonsHub />;
      case "website_products": return <AdminWebsiteProducts />;
      case "store_addons": return <AdminStoreAddons />;
      case "upgrades": return <AdminUpgradeOrders />;
      case "feedback": return <AdminFeedbackModeration />;
      case "reviews": return <AdminReviewsModeration />;
      case "help_center": return <AdminHelpCenter />;
      case "support_chat": return <AdminSupportChat />;
      case "audit": return <AdminAuditLogs />;
      case "newsletter": return <AdminNewsletterSubscribers />;
      case "contact_messages": return <AdminContactMessages />;
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
            <h1 className="text-lg font-semibold font-display text-foreground flex-1">
              {viewTitles[activeView] ?? "Admin"}
            </h1>
            <NotificationBell audience="admin" />
          </header>
          <main className="flex-1 p-6">{renderView()}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
