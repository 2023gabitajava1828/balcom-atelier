import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
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
    <section className="section bg-card/30">
      <div className="content-container">
        <ScrollReveal variant="fade-up">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2">
                Global <span className="gradient-text-gold">Markets</span>
              </h2>
              <p className="text-muted-foreground">
                Explore luxury real estate in the world's most prestigious cities
              </p>
            </div>
            <Link to="/real-estate">
              <Button variant="outline" className="gap-2 group">
                View All
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {markets.map((market, index) => (
            <ScrollReveal key={market.id} variant="fade-up" delay={index * 150}>
              <Card 
                className="group overflow-hidden bg-card border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-gold h-full"
              >
                <Link to={`/real-estate/${market.id}`}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={market.image}
                      alt={market.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    
                    {/* Price badge */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg">
                      From {market.stats.avgPrice}
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                        {market.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">{market.tagline}</p>
                    </div>
                  </div>
                </Link>

                <div className="p-5 space-y-4">
                  <p className="text-muted-foreground text-sm">{market.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/50">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Avg Price</div>
                      <div className="font-semibold text-primary text-sm">{market.stats.avgPrice}</div>
                    </div>
                    <div className="text-center border-x border-border/50">
                      <div className="text-xs text-muted-foreground mb-1">YoY Growth</div>
                      <div className="font-semibold text-success text-sm">{market.stats.growth}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Listings</div>
                      <div className="font-semibold text-foreground text-sm">{market.stats.inventory}</div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2">
                    {market.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="text-xs px-2.5 py-1 bg-secondary text-muted-foreground rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>

                  <Link to={`/real-estate/${market.id}`} className="block">
                    <Button variant="ghost" className="w-full justify-between group/btn text-muted-foreground hover:text-foreground">
                      Explore {market.name}
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
