import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { queryClient } from "@/lib/queryClient";
import Index from "./pages/Index";
import RealEstate from "./pages/RealEstate";
import Search from "./pages/Search";
import PropertyDetail from "./pages/PropertyDetail";
import CityMarket from "./pages/CityMarket";
import Concierge from "./pages/Concierge";
import ConciergeRequest from "./pages/ConciergeRequest";
import Shopping from "./pages/Shopping";
import Auction from "./pages/Auction";
import Lifestyle from "./pages/Lifestyle";
import Wealth from "./pages/Wealth";
import Events from "./pages/Events";
import Account from "./pages/Account";
import Membership from "./pages/Membership";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Sports from "./pages/Sports";
import AthletePortal from "./pages/AthletePortal";
import NotFound from "./pages/NotFound";

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash on first visit per session
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    return !hasSeenSplash;
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem("hasSeenSplash", "true");
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/real-estate" element={<RealEstate />} />
            <Route path="/search" element={<Search />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/real-estate/:city" element={<CityMarket />} />
            <Route path="/concierge" element={<Concierge />} />
            <Route path="/concierge/request/:id" element={<ConciergeRequest />} />
            <Route path="/lifestyle" element={<Lifestyle />} />
            <Route path="/shopping" element={<Shopping />} />
            <Route path="/auction" element={<Auction />} />
            <Route path="/wealth" element={<Wealth />} />
            <Route path="/community" element={<Events />} />
            <Route path="/events" element={<Events />} />
            <Route path="/account" element={<Account />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/sports" element={<Sports />} />
            <Route path="/athlete" element={<AthletePortal />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
