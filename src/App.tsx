import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import PublicLayout from "@/components/PublicLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import GlassCursor from "@/components/GlassCursor";
import ScrollReveal from "@/components/ScrollReveal";
import ComingSoonGate from "@/components/ComingSoonGate";
import { Loader2 } from "lucide-react";

// Eager: landing-critical
import Index from "./pages/Index";

// Lazy: everything else
const Templates = lazy(() => import("./pages/Templates"));
const BookerTemplate = lazy(() => import("./pages/BookerTemplate"));
const TemplateDetail = lazy(() => import("./pages/TemplateDetail"));
const Pricing = lazy(() => import("./pages/Pricing"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const About = lazy(() => import("./pages/About"));
const Team = lazy(() => import("./pages/Team"));
const Contact = lazy(() => import("./pages/Contact"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const CatalogItem = lazy(() => import("./pages/CatalogItem"));
const TemplatesOnSale = lazy(() => import("./pages/TemplatesOnSale"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const StoreDashboard = lazy(() => import("./pages/StoreDashboard"));
const Storefront = lazy(() => import("./pages/Storefront"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(() => import("./pages/legal/Privacy"));
const Terms = lazy(() => import("./pages/legal/Terms"));
const Refund = lazy(() => import("./pages/legal/Refund"));
const DataProtection = lazy(() => import("./pages/legal/DataProtection"));
const Help = lazy(() => import("./pages/Help"));
const HelpArticle = lazy(() => import("./pages/HelpArticle"));
const HelpChat = lazy(() => import("./pages/HelpChat"));
const GlassUI = lazy(() => import("./pages/GlassUI"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const ProfileView = lazy(() => import("./pages/ProfileView"));
const Reviews = lazy(() => import("./pages/Reviews"));
const CaseStudyDetail = lazy(() => import("./pages/CaseStudyDetail"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));

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
        <GlassCursor />
        <BrowserRouter>
          <ScrollReveal />
          <AuthProvider>
            <ErrorBoundary>
              <Suspense fallback={<RouteFallback />}>
                <ComingSoonGate>
                <Routes>
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/templates" element={<Templates />} />
                    <Route path="/templates/booker" element={<BookerTemplate />} />
                    <Route path="/templates/:id" element={<TemplateDetail />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/marketplace/:slug" element={<CatalogItem />} />
                    <Route path="/addons" element={<Navigate to="/marketplace" replace />} />
                    <Route path="/addons/:kind/:slug" element={<Navigate to="/marketplace" replace />} />
                    <Route path="/templates-on-sale" element={<TemplatesOnSale />} />
                    
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/legal/privacy" element={<Privacy />} />
                    <Route path="/legal/terms" element={<Terms />} />
                    <Route path="/legal/refund" element={<Refund />} />
                    <Route path="/legal/data-protection" element={<DataProtection />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/help/chat" element={<HelpChat />} />
                    <Route path="/help/:slug" element={<HelpArticle />} />
                    <Route path="/glass-ui" element={<GlassUI />} />
                    <Route path="/track" element={<TrackOrder />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
                  </Route>
                  <Route path="/coming-soon" element={<ComingSoon />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/store/:storeId" element={<StoreDashboard />} />
                  <Route path="/shop/:slug" element={<Storefront />} />
                  <Route path="/shop/:slug/product/:productSlug" element={<ProductPage />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout/:slug" element={<Checkout />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/profile" element={<ProfileView />} />
                  <Route path="/profile/:userId" element={<ProfileView />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </ComingSoonGate>
              </Suspense>
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
