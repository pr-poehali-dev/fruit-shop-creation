import { useEffect, useState, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import InstallPrompt from "./components/InstallPrompt";
import LoadingScreen from "./components/LoadingScreen";
import DecorativeBranch from "./components/DecorativeBranch";
import SupportChat from "./components/SupportChat";
import AccessibilityToggle from "./components/AccessibilityToggle";

const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const DeliveryAndReturn = lazy(() => import("./pages/DeliveryAndReturn"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Gallery = lazy(() => import("./pages/Gallery"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('referralCode', refCode);
    }

    const checkExpiredPreorders = async () => {
      try {
        await fetch('https://functions.poehali.dev/fc281a64-4d76-4cbd-9ae6-6cf970c14f35', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-User-Id': '0' },
          body: JSON.stringify({ action: 'check_expired_preorders' })
        });
      } catch (error) {
        console.error('Failed to check expired preorders:', error);
      }
    };

    checkExpiredPreorders();
    const interval = setInterval(checkExpiredPreorders, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (showLoading) {
    return <LoadingScreen onComplete={() => setShowLoading(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <InstallPrompt />
        <DecorativeBranch />
        <SupportChat />
        <AccessibilityToggle />
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen onComplete={() => {}} />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/delivery-and-return" element={<DeliveryAndReturn />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/gallery" element={<Gallery />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;