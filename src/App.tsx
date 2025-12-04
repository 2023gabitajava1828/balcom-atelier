import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import RealEstate from "./pages/RealEstate";
import Search from "./pages/Search";
import CityMarket from "./pages/CityMarket";
import Concierge from "./pages/Concierge";
import ConciergeRequest from "./pages/ConciergeRequest";
import Style from "./pages/Style";
import Wealth from "./pages/Wealth";
import Community from "./pages/Community";
import Account from "./pages/Account";
import Membership from "./pages/Membership";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/real-estate" element={<RealEstate />} />
          <Route path="/search" element={<Search />} />
          <Route path="/real-estate/:city" element={<CityMarket />} />
          <Route path="/concierge" element={<Concierge />} />
          <Route path="/concierge/request/:id" element={<ConciergeRequest />} />
          <Route path="/style" element={<Style />} />
          <Route path="/wealth" element={<Wealth />} />
          <Route path="/community" element={<Community />} />
          <Route path="/account" element={<Account />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/auth" element={<Auth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
