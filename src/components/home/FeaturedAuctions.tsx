import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { supabase } from "@/integrations/supabase/client";
import { Gavel, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface AuctionItem {
  id: string;
  title: string;
  brand: string | null;
  estimate_low: number | null;
  estimate_high: number | null;
  auction_house: string | null;
  auction_date: string | null;
  category: string;
  images: string[] | null;
  featured: boolean | null;
}

export const FeaturedAuctions = () => {
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from("luxury_items")
        .select("id, title, brand, estimate_low, estimate_high, auction_house, auction_date, category, images, featured")
        .eq("type", "auction")
        .eq("status", "active")
        .eq("featured", true)
        .order("auction_date", { ascending: true })
        .limit(4);
      
      setItems((data as AuctionItem[]) || []);
      setLoading(false);
    };
    fetchItems();
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    return `$${(price / 1000).toFixed(0)}K`;
  };

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal variant="fade-up">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Gavel className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold">
                  Featured <span className="gradient-text-gold">Lots</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">From premier auction houses</p>
              </div>
            </div>
            <Link to="/auction">
              <Button variant="outline" size="sm" className="gap-2 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {items.map((item, index) => (
            <ScrollReveal key={item.id} variant="fade-up" delay={index * 100}>
              <Card 
                className="group overflow-hidden bg-card border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-gold h-full"
                onClick={() => navigate("/auction")}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.images?.[0] || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800"}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  
                  {/* Auction house badge */}
                  {item.auction_house && (
                    <Badge variant="outline" className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm border-primary/50 text-[10px] px-1.5 py-0.5">
                      {item.auction_house}
                    </Badge>
                  )}
                  
                  {/* Estimate */}
                  {item.estimate_low && item.estimate_high && (
                    <div className="absolute bottom-2 left-2">
                      <p className="text-[10px] text-muted-foreground uppercase">Est.</p>
                      <span className="text-sm font-serif font-bold text-primary">
                        {formatPrice(item.estimate_low)} – {formatPrice(item.estimate_high)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  {item.brand && (
                    <p className="text-[10px] text-primary uppercase tracking-widest font-medium mb-1">
                      {item.brand}
                    </p>
                  )}
                  <h3 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                    {item.auction_date && (
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(item.auction_date), "MMM d")}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
