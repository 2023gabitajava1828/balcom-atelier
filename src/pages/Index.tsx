import { Navigation } from "@/components/layout/Navigation";
import { Hero } from "@/components/home/Hero";
import { QuickActions } from "@/components/home/QuickActions";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <Hero />
        <QuickActions />
      </main>
    </div>
  );
};

export default Index;
