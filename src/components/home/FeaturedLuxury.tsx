import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, ArrowRight } from "lucide-react";

interface LuxuryItem {
  id: string;
  title: string;
  brand: string | null;
  price: number | null;
  category: string;
  images: string[] | null;
  featured: boolean | null;
}

export const FeaturedLuxury = () => {
  const [items, setItems] = useState<LuxuryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from("luxury_items")
        .select("id, title, brand, price, category, images, featured")
        .eq("type", "shopping")
        .eq("status", "active")
        .eq("featured", true)
        .limit(4);
      
      setItems((data as LuxuryItem[]) || []);
      setLoading(false);
    };
    fetchItems();
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    return `$${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <section className="py-12 md:py-16">
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
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold">
                Luxury <span className="gradient-text-gold">Picks</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Curated for discerning collectors</p>
            </div>
          </div>
          <Link to="/shopping">
            <Button variant="outline" size="sm" className="gap-2 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {items.map((item, index) => (
            <Card 
              key={item.id}
              className="group overflow-hidden bg-card border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate("/shopping")}
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={item.images?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                {item.price && (
                  <span className="absolute bottom-2 left-2 text-lg font-serif font-bold text-primary">
                    {formatPrice(item.price)}
                  </span>
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
                <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
