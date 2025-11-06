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
import NetworkStatus from "./components/NetworkStatus";

const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const DeliveryAndReturn = lazy(() => import("./pages/DeliveryAndReturn"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Gallery = lazy(() => import("./pages/Gallery"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const clearCacheIfNeeded = () => {
      const CACHE_VERSION = '1.0.2';
      const currentVersion = localStorage.getItem('cacheVersion');
      
      if (currentVersion !== CACHE_VERSION) {
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
        localStorage.setItem('cacheVersion', CACHE_VERSION);
        console.log('Cache cleared, version updated to', CACHE_VERSION);
      }
    };

    clearCacheIfNeeded();
    
    const refreshUserData = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      try {
        const user = JSON.parse(userData);
        const response = await fetch('https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'user', user_id: user.id })
        });
        
        const data = await response.json();
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log('User data refreshed with is_courier:', data.user.is_courier);
        }
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    };
    
    refreshUserData();

    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const checkExpiredPreorders = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        await fetch('https://functions.poehali.dev/fc281a64-4d76-4cbd-9ae6-6cf970c14f35', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-User-Id': '0' },
          body: JSON.stringify({ action: 'check_expired_preorders' }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
      } catch (error) {
        console.error('Failed to check expired preorders:', error);
      }
    };

    checkExpiredPreorders();
    const interval = setInterval(checkExpiredPreorders, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <NetworkStatus />
        <InstallPrompt />
        <DecorativeBranch />
        <SupportChat />
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen onComplete={() => {}} />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/katalog" element={<Index />} />
              <Route path="/izbrannoye" element={<Index />} />
              <Route path="/o-nas" element={<Index />} />
              <Route path="/dostavka" element={<Index />} />
              <Route path="/ukhod" element={<Index />} />
              <Route path="/kontakty" element={<Index />} />
              <Route path="/galereya" element={<Index />} />
              <Route path="/admin" element={<Index />} />
              <Route path="/courier" element={<Index />} />
              <Route path="/korzina" element={<Index />} />
              <Route path="/profil" element={<Index />} />
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