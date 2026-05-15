import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useAdmin";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import StoreDashboardSidebar from "@/components/store/StoreDashboardSidebar";
import StoreOverview from "@/components/store/StoreOverview";
import ProductManager from "@/components/store/ProductManager";
import CategoryManager from "@/components/store/CategoryManager";
import OrderManager from "@/components/store/OrderManager";
import StoreSettingsEditor from "@/components/store/StoreSettingsEditor";
import MarketplaceBrowser from "@/components/store/MarketplaceBrowser";
import MyAddons from "@/components/store/MyAddons";
import UpgradePlan from "@/components/store/UpgradePlan";

const viewTitles: Record<string, string> = {
  overview: "Overview",
  products: "Products",
  categories: "Categories",
  orders: "Orders",
  marketplace: "Marketplace",
  addons: "My Add-ons",
  upgrade: "Upgrade Plan",
  settings: "Site Settings",
};

const StoreDashboard = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("overview");

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ["store", storeId],
    enabled: !!storeId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", storeId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (store && !isAdmin && store.user_id !== user?.id) {
      navigate("/dashboard", { replace: true });
    }
  }, [store, isAdmin, user, navigate]);

  if (authLoading || storeLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user || !store) return null;

  const renderView = () => {
    switch (activeView) {
      case "overview": return <StoreOverview storeId={store.id} />;
      case "products": return <ProductManager storeId={store.id} />;
      case "categories": return <CategoryManager storeId={store.id} />;
      case "orders": return <OrderManager storeId={store.id} />;
      case "marketplace": return <MarketplaceBrowser storeId={store.id} />;
      case "addons": return <MyAddons storeId={store.id} />;
      case "upgrade": return <UpgradePlan storeId={store.id} />;
      case "settings": return <StoreSettingsEditor storeId={store.id} />;
      default: return <StoreOverview storeId={store.id} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <StoreDashboardSidebar storeName={store.name} activeView={activeView} onViewChange={setActiveView} />
        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b border-border px-6">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold font-display text-foreground">{viewTitles[activeView] ?? "Store"}</h1>
          </header>
          <main className="flex-1 p-6">{renderView()}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default StoreDashboard;
