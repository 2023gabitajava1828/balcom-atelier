import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { Hero } from "@/components/home/Hero";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { FeaturedLuxury } from "@/components/home/FeaturedLuxury";
import { FeaturedAuctions } from "@/components/home/FeaturedAuctions";
import { FeaturedMarkets } from "@/components/home/FeaturedMarkets";
import { PerfectLiveChat } from "@/components/concierge/PerfectLiveChat";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="page-main-compact">
        <Hero />
        <FeaturedProperties />
        <FeaturedLuxury />
        <FeaturedAuctions />
        <FeaturedMarkets />
      </main>
      <Footer className="hidden md:block" />
      <BottomTabs />
      
      {/* PerfectLive 24/7 Chat for Gold+ members */}
      <PerfectLiveChat />
    </div>
  );
};

export default Index;
