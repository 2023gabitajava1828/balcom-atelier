import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { PropertyCardSkeleton, SkeletonGrid } from "@/components/ui/skeletons";
import { InlineError } from "@/components/ui/error-fallback";
import { ArrowRight, BedDouble, Bath, Maximize, MapPin, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { searchProperties, Property as IDXProperty } from "@/lib/integrations/realtycandy-idx";
import penthouseImg from "@/assets/property-penthouse.jpg";

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
  source?: 'supabase' | 'idx';
}

export const FeaturedProperties = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchAllProperties();
    if (user) fetchSaved();
  }, [user]);

  const fetchAllProperties = async () => {
    setError(false);
    try {
      // Fetch from both sources in parallel
      const [dubaiResult, atlantaResult] = await Promise.all([
        // Dubai properties from Supabase
        supabase
          .from("properties")
          .select("id, title, description, price, city, country, bedrooms, bathrooms, sqft, property_type, images")
          .eq("status", "active")
          .eq("city", "Dubai")
          .order("price", { ascending: false })
          .limit(3),
        // Atlanta properties from IDX
        searchProperties({ savedLinkId: '13759', limit: 3 })
      ]);

      const dubaiProperties: Property[] = (dubaiResult.data || []).map(p => ({
        ...p,
        source: 'supabase' as const
      }));

      const atlantaProperties: Property[] = atlantaResult.map((p: IDXProperty) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        city: p.city,
        country: p.country,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        sqft: p.sqft,
        property_type: p.propertyType,
        images: p.images,
        source: 'idx' as const
      }));

      // Combine and interleave properties (alternate between sources)
      const combined: Property[] = [];
      const maxLen = Math.max(dubaiProperties.length, atlantaProperties.length);
      for (let i = 0; i < maxLen; i++) {
        if (atlantaProperties[i]) combined.push(atlantaProperties[i]);
        if (dubaiProperties[i]) combined.push(dubaiProperties[i]);
      }

      setProperties(combined.slice(0, 6));
      
      // Set error if no properties found from either source
      if (combined.length === 0) {
        setError(true);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
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
    // Use actual property images if available
    if (property.images && property.images.length > 0 && property.images[0]) {
      return property.images[0];
    }
    return penthouseImg;
  };

  const getPropertyLink = (property: Property) => {
    if (property.source === 'idx') {
      return `/property/idx-${property.id}`;
    }
    return `/property/${property.id}`;
  };

  if (loading) {
    return (
      <section className="section">
        <div className="content-container">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-24 animate-pulse" />
              <div className="h-10 bg-muted rounded w-64 animate-pulse" />
              <div className="h-5 bg-muted rounded w-48 animate-pulse" />
            </div>
            <SkeletonGrid 
              count={3} 
              Component={PropertyCardSkeleton} 
              className="md:grid-cols-2 lg:grid-cols-3" 
            />
          </div>
        </div>
      </section>
    );
  }

  if (error && properties.length === 0) {
    return (
      <section className="section">
        <div className="content-container">
          <div className="text-center">
            <p className="text-eyebrow text-primary mb-2">LIVE LISTINGS</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
              Featured <span className="gradient-text-gold">Properties</span>
            </h2>
          </div>
          <InlineError 
            onRetry={fetchAllProperties}
            message="Unable to load properties. Please try again."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="content-container">
        <ScrollReveal variant="fade-up">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-eyebrow text-primary mb-2">LIVE LISTINGS</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2">
                Featured <span className="gradient-text-gold">Properties</span>
              </h2>
              <p className="text-muted-foreground">
                Luxury estates from Atlanta & Dubai markets
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
            <ScrollReveal key={`${property.source}-${property.id}`} variant="fade-up" delay={index * 100}>
              <Link to={getPropertyLink(property)}>
                <Card 
                  className="group overflow-hidden bg-card border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-gold cursor-pointer h-full"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={getImage(property)}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = penthouseImg;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    
                    {/* Save Button - only for Supabase properties */}
                    {property.source === 'supabase' && (
                      <button
                        onClick={(e) => handleSave(property.id, e)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background transition-fast z-10"
                      >
                        <Heart className={`w-5 h-5 ${savedProperties.has(property.id) ? "fill-primary text-primary" : "text-foreground"}`} />
                      </button>
                    )}

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
