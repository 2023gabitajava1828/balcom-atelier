import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Shirt, Sparkles } from "lucide-react";

const Style = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="font-serif text-5xl font-bold mb-4">
                Tailored To <span className="gradient-text-gold">You</span>™
              </h1>
              <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                Curated style and wardrobe services at your fingertips
              </p>
            </div>

            <div className="text-center py-20">
              <div className="inline-block p-8 bg-muted/50 rounded-2xl border border-primary/20">
                <div className="flex justify-center gap-4 mb-4">
                  <Shirt className="w-12 h-12 text-primary" />
                  <Sparkles className="w-12 h-12 text-primary" />
                </div>
                <h2 className="font-serif text-2xl font-bold mb-2">Style Services Coming Soon</h2>
                <p className="text-foreground/70 mb-6">
                  Your personal styling profile and lookbook approvals
                </p>
                <Button variant="premium" size="lg">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Style;
