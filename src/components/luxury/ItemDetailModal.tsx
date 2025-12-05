import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { X, MessageSquare, Calendar, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

interface ItemDetailModalProps {
  item: LuxuryItem | null;
  open: boolean;
  onClose: () => void;
}

export const ItemDetailModal = ({ item, open, onClose }: ItemDetailModalProps) => {
  const navigate = useNavigate();

  if (!item) return null;

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${price.toLocaleString()}`;
  };

  const imageUrl = item.images?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800";

  const handleInquire = () => {
    onClose();
    navigate("/concierge", { 
      state: { 
        prefill: {
          category: item.type === "auction" ? "Auction Inquiry" : "Shopping Inquiry",
          title: `Inquiry: ${item.title}`,
          description: `I'm interested in ${item.title} by ${item.brand || "Unknown"}.`
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border p-0">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {item.featured && (
              <Badge className="bg-primary text-primary-foreground">Featured</Badge>
            )}
            {item.type === "auction" && item.auction_house && (
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-primary/50">
                {item.auction_house}
              </Badge>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            {item.brand && (
              <p className="text-sm text-primary uppercase tracking-widest font-medium">
                {item.brand}
              </p>
            )}
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-bold text-foreground">
                {item.title}
              </DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">{item.category}</p>
          </div>

          {/* Price / Estimate */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            {item.type === "shopping" && item.price && (
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Price</p>
                <p className="text-3xl font-serif font-bold text-primary">
                  {formatPrice(item.price)}
                </p>
              </div>
            )}
            {item.type === "auction" && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Estimate</p>
                  <p className="text-3xl font-serif font-bold text-primary">
                    {item.estimate_low && item.estimate_high && (
                      <>{formatPrice(item.estimate_low)} – {formatPrice(item.estimate_high)}</>
                    )}
                  </p>
                </div>
                {item.auction_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Auction: {format(new Date(item.auction_date), "MMMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Description</h4>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* Provenance (for auction items) */}
          {item.provenance && (
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Provenance</h4>
              <p className="text-muted-foreground leading-relaxed italic">{item.provenance}</p>
            </div>
          )}

          {/* Details */}
          {item.details && Object.keys(item.details).length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Details</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(item.details).map(([key, value]) => (
                  <div key={key} className="p-3 rounded-lg bg-muted/20 border border-border/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {key.replace(/_/g, " ")}
                    </p>
                    <p className="text-foreground font-medium">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator className="bg-border/50" />

          {/* CTA */}
          <Button 
            size="lg" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleInquire}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact Concierge to Inquire
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
