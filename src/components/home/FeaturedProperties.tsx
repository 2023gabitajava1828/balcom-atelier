import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowRight, BedDouble, Bath, Maximize, MapPin, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import penthouseImg from "@/assets/property-penthouse.jpg";
import villaImg from "@/assets/property-villa.jpg";
import estateImg from "@/assets/property-estate.jpg";

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
  property_type: string | null;
  images: string[] | null;
}

// Map property types to generated images
const propertyImages: Record<string, string> = {
  penthouse: penthouseImg,
  villa: villaImg,
  house: estateImg,
  condo: penthouseImg,
};

export const FeaturedProperties = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
    if (user) fetchSaved();
  }, [user]);

  const fetchProperties = async () => {
    const { data } = await supabase
      .from("properties")
      .select("id, title, description, price, city, country, bedrooms, bathrooms, sqft, property_type, images")
      .eq("status", "active")
      .order("price", { ascending: false })
      .limit(6);

    if (data) setProperties(data);
    setLoading(false);
  };

  const fetchSaved = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("saved_properties")
      .select("property_id")
      .eq("user_id", user.id);
    if (data) setSavedProperties(new Set(data.map(s => s.property_id)));
  };

  const handleSave = async (propertyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to save properties", variant: "destructive" });
      return;
    }

    if (savedProperties.has(propertyId)) {
      await supabase.from("saved_properties").delete().eq("property_id", propertyId).eq("user_id", user.id);
      const newSaved = new Set(savedProperties);
      newSaved.delete(propertyId);
      setSavedProperties(newSaved);
      toast({ title: "Removed from saved" });
    } else {
      await supabase.from("saved_properties").insert({ property_id: propertyId, user_id: user.id });
      setSavedProperties(new Set(savedProperties).add(propertyId));
      toast({ title: "Property saved" });
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

  const getImage = (property: Property) => {
    // Use generated image based on property type, fallback to penthouse
    return propertyImages[property.property_type || "house"] || penthouseImg;
  };

  if (loading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-[4/3] bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="fade-up">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-eyebrow text-primary mb-2">IDX LISTINGS</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2">
                Featured <span className="gradient-text-gold">Properties</span>
              </h2>
              <p className="text-muted-foreground">
                Curated estates in Atlanta, Miami, Dubai & beyond
              </p>
            </div>
            <Link to="/search">
              <Button variant="outline" className="gap-2 group">
                View All Listings
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property, index) => (
            <ScrollReveal key={property.id} variant="fade-up" delay={index * 100}>
              <Link to={`/property/${property.id}`}>
                <Card 
                  className="group overflow-hidden bg-card border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-gold cursor-pointer h-full"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={getImage(property)}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    
                    {/* Save Button */}
                    <button
                      onClick={(e) => handleSave(property.id, e)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background transition-fast z-10"
                    >
                      <Heart className={`w-5 h-5 ${savedProperties.has(property.id) ? "fill-primary text-primary" : "text-foreground"}`} />
                    </button>

                    {/* Price Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1">
                        {formatPrice(property.price)}
                      </Badge>
                    </div>
                    
                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-serif text-xl font-bold text-foreground line-clamp-1">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{property.city}, {property.country}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        {property.bedrooms && (
                          <span className="flex items-center gap-1.5">
                            <BedDouble className="w-4 h-4" />
                            {property.bedrooms} beds
                          </span>
                        )}
                        {property.bathrooms && (
                          <span className="flex items-center gap-1.5">
                            <Bath className="w-4 h-4" />
                            {property.bathrooms} baths
                          </span>
                        )}
                      </div>
                      {property.sqft && (
                        <span className="flex items-center gap-1.5">
                          <Maximize className="w-4 h-4" />
                          {property.sqft.toLocaleString()} sqft
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        {properties.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No properties available at the moment</p>
          </div>
        )}
      </div>
    </section>
  );
};
