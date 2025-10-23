import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingUp, Home } from "lucide-react";
import atlantaImg from "@/assets/market-atlanta.jpg";
import miamiImg from "@/assets/market-miami.jpg";
import dubaiImg from "@/assets/market-dubai.jpg";

const markets = [
  {
    id: "atlanta",
    name: "Atlanta",
    tagline: "Southern Sophistication",
    description: "Discover luxury living in Buckhead and Midtown's premier addresses",
    image: atlantaImg,
    stats: {
      avgPrice: "$850K",
      growth: "+12%",
      inventory: "150+"
    },
    highlights: ["Buckhead", "Midtown", "Virginia-Highland"]
  },
  {
    id: "miami",
    name: "Miami",
    tagline: "Coastal Excellence",
    description: "Waterfront estates and high-rise penthouses in Brickell and South Beach",
    image: miamiImg,
    stats: {
      avgPrice: "$1.2M",
      growth: "+15%",
      inventory: "200+"
    },
    highlights: ["Brickell", "South Beach", "Coconut Grove"]
  },
  {
    id: "dubai",
    name: "Dubai",
    tagline: "Global Luxury",
    description: "Iconic developments at Palm Jumeirah and Dubai Marina",
    image: dubaiImg,
    stats: {
      avgPrice: "$2.5M",
      growth: "+18%",
      inventory: "100+"
    },
    highlights: ["Palm Jumeirah", "Dubai Marina", "Downtown Dubai"]
  }
];

export const FeaturedMarkets = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl font-bold mb-4">
            Our <span className="gradient-text-gold">Exclusive Markets</span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Explore luxury real estate in three of the world's most prestigious cities
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {markets.map((market) => (
            <Card key={market.id} className="group overflow-hidden hover:shadow-gold transition-elegant">
              <Link to={`/real-estate/${market.id}`}>
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={market.image}
                    alt={market.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-elegant"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-serif text-3xl font-bold text-white mb-1">
                      {market.name}
                    </h3>
                    <p className="text-white/90 text-sm">{market.tagline}</p>
                  </div>
                </div>
              </Link>

              <div className="p-6 space-y-4">
                <p className="text-foreground/70">{market.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 py-3 border-y">
                  <div className="text-center">
                    <div className="text-xs text-foreground/60 mb-1">Avg Price</div>
                    <div className="font-semibold text-primary">{market.stats.avgPrice}</div>
                  </div>
                  <div className="text-center border-x">
                    <div className="text-xs text-foreground/60 mb-1">YoY Growth</div>
                    <div className="font-semibold text-green-500">{market.stats.growth}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-foreground/60 mb-1">Inventory</div>
                    <div className="font-semibold">{market.stats.inventory}</div>
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                    Key Neighborhoods
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {market.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="text-xs px-2 py-1 bg-muted rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                <Link to={`/real-estate/${market.id}`}>
                  <Button variant="outline" className="w-full gap-2 group/btn">
                    <MapPin className="w-4 h-4" />
                    Explore {market.name}
                    <TrendingUp className="w-4 h-4 ml-auto group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/real-estate">
            <Button variant="hero" size="lg" className="gap-2">
              <Home className="w-5 h-5" />
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
