import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, BedDouble, Bath, Maximize } from "lucide-react";

const RealEstate = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="font-serif text-5xl font-bold mb-4">
                <span className="gradient-text-gold">Global</span> Luxury Real Estate
              </h1>
              <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                Discover exceptional properties across 84+ countries
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-gold p-6 mb-12">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by city, neighborhood, or property type..."
                    className="h-12"
                  />
                </div>
                <Button variant="hero" size="lg">
                  <Search className="mr-2" />
                  Search Properties
                </Button>
              </div>
            </div>

            {/* Coming Soon Message */}
            <div className="text-center py-20">
              <div className="inline-block p-8 bg-muted/50 rounded-2xl border border-primary/20">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="font-serif text-2xl font-bold mb-2">Property Listings Coming Soon</h2>
                <p className="text-foreground/70 mb-6">
                  We're integrating with RealtyCandy IDX to bring you the finest properties worldwide
                </p>
                <Button variant="premium" size="lg">
                  Request Private Consultation
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RealEstate;
