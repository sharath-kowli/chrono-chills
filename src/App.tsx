import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/CookieConsent";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { PageViewTracker } from "@/components/PageViewTracker";
import { initGeoData } from "@/lib/gtm";
import { useEffect } from "react";
import Index from "./pages/Index";
import Watch from "./pages/Watch";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Admin from "./pages/Admin";
import PaymentSuccess from "./pages/PaymentSuccess";
import Install from "./pages/Install";
import DeleteAccount from "./pages/DeleteAccount";
import OAuthConsent from "./pages/OAuthConsent";
import { ProtectedRoute } from "./components/ui/ProtectedRoute";
import { ConditionalProtectedRoute } from "./components/ui/ConditionalProtectedRoute";
import { useAndroidBackButton } from "./hooks/useAndroidBackButton";
import { useNativeOAuthDeepLink } from "./hooks/useNativeOAuthDeepLink";

const queryClient = new QueryClient();

const NativeShell = () => {
  useAndroidBackButton();
  useNativeOAuthDeepLink();
  return null;
};

const App = () => {
  // Resolve country once per session on app boot
  useEffect(() => { initGeoData(); }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SubscriptionProvider>
        <Toaster />
        <Sonner />
        <CookieConsent />
        <BrowserRouter>
          <NativeShell />
          <PageViewTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/watch/:episodeId" element={<ConditionalProtectedRoute><Watch /></ConditionalProtectedRoute>} />
            <Route path="/d9x7k2m-panel" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refund" element={<Refund />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/install" element={<Install />} />
            <Route path="/delete-account" element={<DeleteAccount />} />
            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SubscriptionProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
