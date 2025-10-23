import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { QuickActions } from "@/components/home/QuickActions";
import { FeaturedMarkets } from "@/components/home/FeaturedMarkets";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <Hero />
        <QuickActions />
        <FeaturedMarkets />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
