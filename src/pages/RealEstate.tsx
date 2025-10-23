import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyFilters, PropertySearchFilters } from "@/components/properties/PropertyFilters";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  property_type: string | null;
  images: string[] | null;
  lifestyle_tags: string[] | null;
}

const RealEstate = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PropertySearchFilters | null>(null);

  useEffect(() => {
    fetchProperties();
    if (user) {
      fetchSavedProperties();
    }
  }, [user, filters]);

  const fetchProperties = async () => {
    let query = supabase.from("properties").select("*").eq("status", "active");

    if (filters) {
      if (filters.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }
      if (filters.minPrice) {
        query = query.gte("price", parseFloat(filters.minPrice));
      }
      if (filters.maxPrice) {
        query = query.lte("price", parseFloat(filters.maxPrice));
      }
      if (filters.bedrooms && filters.bedrooms !== "all") {
        query = query.gte("bedrooms", parseInt(filters.bedrooms));
      }
      if (filters.propertyType && filters.propertyType !== "all") {
        query = query.eq("property_type", filters.propertyType);
      }
    }

    const { data } = await query.order("created_at", { ascending: false }).limit(12);

    if (data) {
      setProperties(data);
    }
    setLoading(false);
  };

  const fetchSavedProperties = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("saved_properties")
      .select("property_id")
      .eq("user_id", user.id);

    if (data) {
      setSavedProperties(new Set(data.map((s) => s.property_id)));
    }
  };

  const handleSave = async (propertyId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save properties",
        variant: "destructive",
      });
      return;
    }

    if (savedProperties.has(propertyId)) {
      const { error } = await supabase
        .from("saved_properties")
        .delete()
        .eq("property_id", propertyId)
        .eq("user_id", user.id);

      if (!error) {
        const newSaved = new Set(savedProperties);
        newSaved.delete(propertyId);
        setSavedProperties(newSaved);
        toast({ title: "Removed from saved properties" });
      }
    } else {
      const { error } = await supabase.from("saved_properties").insert({
        property_id: propertyId,
        user_id: user.id,
      });

      if (!error) {
        setSavedProperties(new Set(savedProperties).add(propertyId));
        toast({ title: "Property saved successfully" });
      }
    }
  };

  const handleSearch = (searchFilters: PropertySearchFilters) => {
    setFilters(searchFilters);
    setLoading(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="font-serif text-5xl font-bold mb-4">
                <span className="gradient-text-gold">Global</span> Luxury Real Estate
              </h1>
              <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                Discover exceptional properties worldwide
              </p>
            </div>

            <PropertyFilters onSearch={handleSearch} />

            {loading ? (
              <div className="text-center py-12">
                <p className="text-foreground/60">Loading properties...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20">
                <Card className="inline-block p-8 bg-muted/50">
                  <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="font-serif text-2xl font-bold mb-2">No Properties Found</h2>
                  <p className="text-foreground/70">
                    Try adjusting your search filters or check back soon
                  </p>
                </Card>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onSave={handleSave}
                    isSaved={savedProperties.has(property.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RealEstate;
