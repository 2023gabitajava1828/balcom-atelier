import { useParams, Navigate, Link } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyFilters, PropertySearchFilters } from "@/components/properties/PropertyFilters";
import { ArrowLeft, MapPin, TrendingUp, Building2, Award, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { searchProperties } from "@/lib/integrations/realtycandy-idx";
import atlantaImg from "@/assets/market-atlanta.jpg";
import miamiImg from "@/assets/market-miami.jpg";
import dubaiImg from "@/assets/market-dubai.jpg";

const cityData = {
  atlanta: {
    name: "Atlanta",
    tagline: "Southern Sophistication Meets Modern Luxury",
    description: "Discover exclusive properties in Atlanta's most prestigious neighborhoods. From Buckhead's elegant high-rises to Midtown's urban sophistication, find your perfect luxury residence.",
    image: atlantaImg,
    neighborhoods: ["Buckhead", "Midtown", "Virginia-Highland", "Ansley Park", "Tuxedo Park"],
    features: [
      "Premier Buckhead addresses with world-class shopping",
      "Midtown's cultural district and modern architecture", 
      "Historic neighborhoods with Southern charm",
      "Proximity to Fortune 500 headquarters"
    ],
    isIdx: true
  },
  miami: {
    name: "Miami",
    tagline: "Where Oceanfront Dreams Come True",
    description: "Experience the pinnacle of coastal living with Miami's most coveted waterfront estates and luxury high-rises. From Brickell's sophistication to South Beach's vibrant energy.",
    image: miamiImg,
    neighborhoods: ["Brickell", "South Beach", "Coconut Grove", "Miami Beach", "Coral Gables"],
    features: [
      "Brickell waterfront with stunning bay views",
      "South Beach's iconic Art Deco and beachfront access",
      "Coral Gables' Mediterranean elegance",
      "Year-round tropical lifestyle and culture"
    ],
    isIdx: false
  },
  dubai: {
    name: "Dubai",
    tagline: "Global Luxury Redefined",
    description: "Enter a world of unparalleled luxury with Dubai's most iconic developments. From Palm Jumeirah's exclusive island living to Dubai Marina's waterfront sophistication.",
    image: dubaiImg,
    neighborhoods: ["Palm Jumeirah", "Dubai Marina", "Downtown Dubai", "Emirates Hills", "Jumeirah Beach"],
    features: [
      "World-renowned Palm Jumeirah island residences",
      "Dubai Marina's stunning waterfront skyline",
      "Downtown Dubai with Burj Khalifa proximity",
      "Tax-free investment opportunities"
    ],
    isIdx: false
  }
};

const CityMarket = () => {
  const { city } = useParams<{ city: string }>();
  const [properties, setProperties] = useState<any[]>([]);
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PropertySearchFilters>({
    search: "",
    city: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    propertyType: "",
  });

  const cityInfo = city ? cityData[city as keyof typeof cityData] : null;

  useEffect(() => {
    if (city) {
      fetchProperties();
    }
  }, [city, filters]);

  const fetchProperties = async () => {
    setLoading(true);
    
    try {
      if (cityInfo?.isIdx) {
        // Fetch from IDX for Atlanta
        const idxProperties = await searchProperties({
          savedLinkId: "13759",
          limit: 50,
          priceMin: filters.minPrice ? parseInt(filters.minPrice) : undefined,
          priceMax: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
          beds: filters.bedrooms && filters.bedrooms !== "all" ? parseInt(filters.bedrooms) : undefined,
          propertyType: filters.propertyType && filters.propertyType !== "all" ? filters.propertyType : undefined,
        });
        
        // Transform IDX properties to match PropertyCard expected format
        const transformedProperties = idxProperties.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          price: p.price,
          city: p.city,
          country: p.country || 'USA',
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          sqft: p.sqft,
          property_type: p.propertyType,
          images: p.images,
          lifestyle_tags: p.lifestyleTags,
          isIdx: true,
        }));
        
        setProperties(transformedProperties);
      } else {
        // Fetch from Supabase for other markets
        let query = supabase
          .from("properties")
          .select("*")
          .eq("status", "active")
          .eq("city", cityInfo?.name || "");

        if (filters.minPrice) {
          query = query.gte("price", parseFloat(filters.minPrice));
        }
        if (filters.maxPrice) {
          query = query.lte("price", parseFloat(filters.maxPrice));
        }
        if (filters.propertyType && filters.propertyType !== "all") {
          query = query.eq("property_type", filters.propertyType);
        }
        if (filters.bedrooms && filters.bedrooms !== "all") {
          query = query.gte("bedrooms", parseInt(filters.bedrooms));
        }

        const { data } = await query.order("price", { ascending: false });
        setProperties(data || []);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (propertyId: string) => {
    // Implement save functionality similar to RealEstate page
  };

  if (!cityInfo) {
    return <Navigate to="/real-estate" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <img
          src={cityInfo.image}
          alt={cityInfo.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12">
          <Link to="/real-estate">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to All Markets
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-white">
              {cityInfo.name}
            </h1>
            {cityInfo.isIdx && (
              <Badge className="bg-success/20 text-success border-success/30">
                Live Feed
              </Badge>
            )}
          </div>
          <p className="text-xl md:text-2xl text-white/90 mb-6 max-w-3xl">
            {cityInfo.tagline}
          </p>
          <p className="text-lg text-white/80 max-w-2xl">
            {cityInfo.description}
          </p>
        </div>
      </section>

      {/* City Features */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Neighborhoods */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-primary" />
                <h3 className="font-serif text-2xl font-bold">Premier Neighborhoods</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {cityInfo.neighborhoods.map((neighborhood) => (
                  <Badge key={neighborhood} variant="secondary" className="text-sm px-3 py-1">
                    {neighborhood}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Features */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-primary" />
                <h3 className="font-serif text-2xl font-bold">Market Highlights</h3>
              </div>
              <ul className="space-y-2">
                {cityInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-foreground/70">
                    <TrendingUp className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Properties */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-2">
                Available Properties
              </h2>
              <p className="text-foreground/70">
                {loading ? "Loading..." : `${properties.length} exclusive ${properties.length === 1 ? 'property' : 'properties'} in ${cityInfo.name}`}
              </p>
            </div>
          </div>

          <PropertyFilters onSearch={setFilters} />

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : properties.length === 0 ? (
            <Card className="p-12 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-primary/50" />
              <h3 className="font-semibold text-lg mb-2">No Properties Found</h3>
              <p className="text-foreground/60 mb-4">
                We're currently updating our {cityInfo.name} inventory. Check back soon or adjust your filters.
              </p>
              <Button variant="outline" onClick={() => setFilters({
                search: "",
                city: "",
                minPrice: "",
                maxPrice: "",
                bedrooms: "",
                propertyType: "",
              })}>
                Reset Filters
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Link 
                  key={property.id} 
                  to={property.isIdx ? `/property/idx-${property.id}` : `/property/${property.id}`}
                >
                  <PropertyCard 
                    property={property}
                    onSave={handleSave}
                    isSaved={savedProperties.has(property.id)}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CityMarket;
