import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface LuxuryItem {
  id: string;
  type: "shopping" | "auction";
  title: string;
  description: string | null;
  category: string;
  brand: string | null;
  price: number | null;
  estimate_low: number | null;
  estimate_high: number | null;
  auction_house: string | null;
  auction_date: string | null;
  images: string[] | null;
  featured: boolean | null;
  provenance: string | null;
  details: Record<string, unknown> | null;
}

interface LuxuryItemCardProps {
  item: LuxuryItem;
  onInquire: (item: LuxuryItem) => void;
  onViewDetails: (item: LuxuryItem) => void;
}

export const LuxuryItemCard = ({ item, onInquire, onViewDetails }: LuxuryItemCardProps) => {
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${price.toLocaleString()}`;
  };

  const imageUrl = item.images?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800";

  return (
    <Card 
      className="group overflow-hidden bg-card border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer"
      onClick={() => onViewDetails(item)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        
        {/* Featured badge */}
        {item.featured && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
            Featured
          </Badge>
        )}
        
        {/* Auction house badge */}
        {item.type === "auction" && item.auction_house && (
          <Badge variant="outline" className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm border-primary/50 text-foreground">
            {item.auction_house}
          </Badge>
        )}
        
        {/* Price/Estimate overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          {item.type === "shopping" && item.price && (
            <span className="text-2xl font-serif font-bold text-primary">
              {formatPrice(item.price)}
            </span>
          )}
          {item.type === "auction" && item.estimate_low && item.estimate_high && (
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Estimate</p>
              <span className="text-lg font-serif font-bold text-primary">
                {formatPrice(item.estimate_low)} – {formatPrice(item.estimate_high)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {/* Brand */}
        {item.brand && (
          <p className="text-xs text-primary uppercase tracking-widest font-medium">
            {item.brand}
          </p>
        )}
        
        {/* Title */}
        <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        
        {/* Category & Auction Date */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{item.category}</span>
          {item.type === "auction" && item.auction_date && (
            <span>{format(new Date(item.auction_date), "MMM d, yyyy")}</span>
          )}
        </div>
        
        {/* Inquire button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onInquire(item);
          }}
        >
          Inquire via Concierge
        </Button>
      </div>
    </Card>
  );
};
