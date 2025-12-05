import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { 
  X, 
  MessageSquare, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Star,
  Ruler,
  FileText,
  Award,
  Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

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

const conditionLevels = [
  { label: "Revive", value: 1 },
  { label: "Fair", value: 2 },
  { label: "Good", value: 3 },
  { label: "Very Good", value: 4 },
  { label: "Like New", value: 5, icon: Star },
];

export const ItemDetailModal = ({ item, open, onClose }: ItemDetailModalProps) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!item) return null;

  const images = item.images?.length ? item.images : ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"];
  
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${price.toLocaleString()}`;
  };

  const handleInquire = () => {
    onClose();
    navigate("/concierge", { 
      state: { 
        prefill: {
          category: item.type === "auction" ? "Auction Inquiry" : "Shopping Inquiry",
          title: `Inquiry: ${item.title}`,
          description: `I'm interested in ${item.title}${item.brand ? ` by ${item.brand}` : ""}.`
        }
      }
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Parse details for structured display
  const details = item.details || {};
  const dimensions = details.dimensions as string | undefined;
  const signature = details.signature as string | undefined;
  const condition = details.condition as string | undefined;
  const materials = details.materials as string | undefined;
  const edition = details.edition as string | undefined;
  const year = details.year as string | undefined;

  // Determine condition level (default to 4 - Very Good if not specified)
  const conditionLevel = condition 
    ? conditionLevels.findIndex(c => c.label.toLowerCase() === condition.toLowerCase()) + 1 || 4
    : 4;

  // Fullscreen Image View
  if (isFullscreen) {
    return (
      <Dialog open={true} onOpenChange={() => setIsFullscreen(false)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={images[currentImageIndex]}
              alt={item.title}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
            
            {/* Close */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-card border-border p-0">
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Left: Image Gallery */}
          <div className="lg:w-1/2 flex-shrink-0 bg-muted/20">
            {/* Main Image */}
            <div className="relative aspect-square">
              <img
                src={images[currentImageIndex]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              
              {/* Fullscreen button */}
              <button
                onClick={() => setIsFullscreen(true)}
                className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              
              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              
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
            </div>
            
            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={cn(
                      "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                      idx === currentImageIndex 
                        ? "border-primary ring-1 ring-primary/50" 
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Right: Details */}
          <div className="lg:w-1/2 flex flex-col overflow-hidden">
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors lg:hidden z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Header */}
              <div className="space-y-2">
                {item.brand && (
                  <p className="text-sm text-primary uppercase tracking-[0.2em] font-medium">
                    {item.brand}
                  </p>
                )}
                <h2 className="font-serif text-2xl font-bold text-foreground leading-tight">
                  {item.title}
                </h2>
                <p className="text-muted-foreground text-sm">{item.category}</p>
              </div>

              {/* Price / Estimate */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                {item.type === "shopping" && item.price && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Price</p>
                    <p className="text-3xl font-serif font-bold text-primary">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                )}
                {item.type === "auction" && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Estimate</p>
                      <p className="text-3xl font-serif font-bold text-primary">
                        {item.estimate_low && item.estimate_high && (
                          <>{formatPrice(item.estimate_low)} – {formatPrice(item.estimate_high)}</>
                        )}
                      </p>
                    </div>
                    {item.auction_date && (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(item.auction_date), "MMMM d, yyyy")}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Separator className="bg-border/50" />

              {/* Description Section */}
              {item.description && (
                <DetailSection icon={FileText} title="Description">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                </DetailSection>
              )}

              {/* Dimensions Section */}
              {dimensions && (
                <DetailSection icon={Ruler} title="Dimensions">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {dimensions}
                  </p>
                </DetailSection>
              )}

              {/* Materials / Edition */}
              {(materials || edition || year) && (
                <DetailSection icon={Info} title="Specifications">
                  <div className="space-y-2 text-muted-foreground">
                    {materials && (
                      <div className="flex justify-between">
                        <span className="text-foreground/70">Materials</span>
                        <span>{materials}</span>
                      </div>
                    )}
                    {edition && (
                      <div className="flex justify-between">
                        <span className="text-foreground/70">Edition</span>
                        <span>{edition}</span>
                      </div>
                    )}
                    {year && (
                      <div className="flex justify-between">
                        <span className="text-foreground/70">Year</span>
                        <span>{year}</span>
                      </div>
                    )}
                  </div>
                </DetailSection>
              )}

              {/* Signature Section */}
              {signature && (
                <DetailSection icon={Award} title="Signature">
                  <p className="text-muted-foreground leading-relaxed">
                    {signature}
                  </p>
                </DetailSection>
              )}

              {/* Provenance */}
              {item.provenance && (
                <DetailSection icon={FileText} title="Provenance">
                  <p className="text-muted-foreground leading-relaxed italic">
                    {item.provenance}
                  </p>
                </DetailSection>
              )}

              {/* Condition Report */}
              <DetailSection icon={Star} title="Condition Report">
                <div className="flex items-center gap-2">
                  {conditionLevels.map((level, idx) => {
                    const isActive = idx < conditionLevel;
                    const isCurrent = idx === conditionLevel - 1;
                    return (
                      <div
                        key={level.label}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg transition-all",
                          isCurrent && "bg-primary/10 ring-1 ring-primary/30"
                        )}
                      >
                        <div
                          className={cn(
                            "w-full h-1.5 rounded-full transition-colors",
                            isActive ? "bg-primary" : "bg-muted"
                          )}
                        />
                        <span className={cn(
                          "text-[10px] leading-tight text-center",
                          isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                        )}>
                          {level.icon && isCurrent ? (
                            <span className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-primary" />
                              {level.label}
                            </span>
                          ) : level.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </DetailSection>

              {/* Shipping Note */}
              <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">Please note:</span> Shipping quotes are calculated at time of purchase. 
                  Contact concierge for delivery estimates and white-glove service options.
                </p>
              </div>
            </div>
            
            {/* Sticky CTA */}
            <div className="flex-shrink-0 p-4 border-t border-border bg-card">
              <Button 
                size="lg" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleInquire}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Concierge to Inquire
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Detail Section Component
interface DetailSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}

const DetailSection = ({ icon: Icon, title, children }: DetailSectionProps) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-primary" />
      <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">{title}</h4>
    </div>
    {children}
  </div>
);
