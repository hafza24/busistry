import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import PublicLayout from "@/components/PublicLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Loader2 } from "lucide-react";

// Eager: landing-critical
import Index from "./pages/Index";

// Lazy: everything else
const Templates = lazy(() => import("./pages/Templates"));
const BookerTemplate = lazy(() => import("./pages/BookerTemplate"));
const Pricing = lazy(() => import("./pages/Pricing"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Contact = lazy(() => import("./pages/Contact"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const SitesForSale = lazy(() => import("./pages/SitesForSale"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const StoreDashboard = lazy(() => import("./pages/StoreDashboard"));
const Storefront = lazy(() => import("./pages/Storefront"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(() => import("./pages/legal/Privacy"));
const Terms = lazy(() => import("./pages/legal/Terms"));
const Refund = lazy(() => import("./pages/legal/Refund"));
const DataProtection = lazy(() => import("./pages/legal/DataProtection"));
const Help = lazy(() => import("./pages/Help"));
const HelpArticle = lazy(() => import("./pages/HelpArticle"));
const HelpChat = lazy(() => import("./pages/HelpChat"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 300_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader2 className="h-7 w-7 animate-spin text-primary" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ErrorBoundary>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/templates" element={<Templates />} />
                    <Route path="/templates/booker" element={<BookerTemplate />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/sites-for-sale" element={<SitesForSale />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/legal/privacy" element={<Privacy />} />
                    <Route path="/legal/terms" element={<Terms />} />
                    <Route path="/legal/refund" element={<Refund />} />
                    <Route path="/legal/data-protection" element={<DataProtection />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/help/chat" element={<HelpChat />} />
                    <Route path="/help/:slug" element={<HelpArticle />} />
                  </Route>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/store/:storeId" element={<StoreDashboard />} />
                  <Route path="/shop/:slug" element={<Storefront />} />
                  <Route path="/shop/:slug/product/:productSlug" element={<ProductPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
