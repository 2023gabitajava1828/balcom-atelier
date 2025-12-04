import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize, 
  Calendar,
  MessageSquare,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number;
  city: string;
  country: string;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  lot_size?: number | null;
  year_built?: number | null;
  property_type: string | null;
  images: string[] | null;
  lifestyle_tags: string[] | null;
  address: string | null;
  features?: string[] | null;
}

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProperty();
      if (user) {
        checkSaved();
      }
    }
  }, [id, user]);

  const fetchProperty = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (data) {
      setProperty(data);
    }
    setLoading(false);
  };

  const checkSaved = async () => {
    if (!user || !id) return;
    const { data } = await supabase
      .from("saved_properties")
      .select("id")
      .eq("property_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    setIsSaved(!!data);
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save properties",
        variant: "destructive",
      });
      return;
    }

    if (isSaved) {
      await supabase
        .from("saved_properties")
        .delete()
        .eq("property_id", id)
        .eq("user_id", user.id);
      setIsSaved(false);
      toast({ title: "Removed from saved" });
    } else {
      await supabase.from("saved_properties").insert({
        property_id: id,
        user_id: user.id,
      });
      setIsSaved(true);
      toast({ title: "Property saved" });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: property?.title,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard" });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const images = property?.images?.length ? property.images : ["/placeholder.svg"];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20 pb-24">
          <div className="container mx-auto px-4 py-20 text-center">
            <Card className="inline-block p-8 bg-card border-border/50">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="font-serif text-2xl font-bold mb-2">Property Not Found</h2>
              <p className="text-muted-foreground mb-6">
                This property may have been removed or is no longer available.
              </p>
              <Button onClick={() => navigate("/search")}>
                Back to Search
              </Button>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-24">
        {/* Back Button & Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Button>
        </div>

        {/* Image Gallery */}
        <div className="relative aspect-[16/9] md:aspect-[21/9] bg-muted overflow-hidden">
          <img
            src={images[currentImageIndex]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          
          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentImageIndex ? "bg-primary" : "bg-background/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Price Badge */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-primary text-primary-foreground text-lg px-4 py-2 font-semibold">
              {formatPrice(property.price)}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & Location */}
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">
                  {property.title}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>
                    {property.address && `${property.address}, `}
                    {property.city}, {property.country}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <Card className="p-6 bg-card border-border/50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {property.bedrooms && (
                    <div className="text-center">
                      <BedDouble className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="font-semibold text-lg">{property.bedrooms}</p>
                      <p className="text-sm text-muted-foreground">Bedrooms</p>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="text-center">
                      <Bath className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="font-semibold text-lg">{property.bathrooms}</p>
                      <p className="text-sm text-muted-foreground">Bathrooms</p>
                    </div>
                  )}
                  {property.sqft && (
                    <div className="text-center">
                      <Maximize className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="font-semibold text-lg">{property.sqft.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Sq Ft</p>
                    </div>
                  )}
                  {property.year_built && (
                    <div className="text-center">
                      <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="font-semibold text-lg">{property.year_built}</p>
                      <p className="text-sm text-muted-foreground">Year Built</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Description */}
              {property.description && (
                <div>
                  <h2 className="font-serif text-2xl font-bold mb-4">About This Property</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Features */}
              {property.features && property.features.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold mb-4">Features & Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.features.map((feature, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifestyle Tags */}
              {property.lifestyle_tags && property.lifestyle_tags.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold mb-4">Lifestyle</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.lifestyle_tags.map((tag, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary"
                        className="px-4 py-2"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="p-6 bg-card border-border/50 sticky top-24">
                <div className="space-y-4">
                  <div className="text-center pb-4 border-b border-border/50">
                    <p className="text-3xl font-bold text-primary">
                      {formatPrice(property.price)}
                    </p>
                    {property.property_type && (
                      <p className="text-sm text-muted-foreground capitalize mt-1">
                        {property.property_type}
                      </p>
                    )}
                  </div>

                  <Button asChild className="w-full gap-2" size="lg">
                    <Link to="/concierge">
                      <MessageSquare className="w-4 h-4" />
                      Schedule Private Tour
                    </Link>
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={handleSave}
                      className={`gap-2 ${isSaved ? "text-primary border-primary" : ""}`}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? "fill-primary" : ""}`} />
                      {isSaved ? "Saved" : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Your concierge will reach out within 24 hours
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer className="hidden md:block" />
      <BottomTabs />
    </div>
  );
};

export default PropertyDetail;
