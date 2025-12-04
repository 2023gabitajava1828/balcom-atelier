import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { Hero } from "@/components/home/Hero";
import { QuickActions } from "@/components/home/QuickActions";
import { FeaturedMarkets } from "@/components/home/FeaturedMarkets";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-20 md:pb-0">
        <Hero />
        <QuickActions />
        <FeaturedMarkets />
      </main>
      <Footer className="hidden md:block" />
      <BottomTabs />
    </div>
  );
};

export default Index;
