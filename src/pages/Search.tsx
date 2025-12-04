import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search as SearchIcon, 
  SlidersHorizontal, 
  X, 
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Heart,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  address: string | null;
}

interface Filters {
  query: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  beds: string;
  baths: string;
  propertyType: string;
}

const LIMIT = 12;

const Search = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    query: "",
    city: "",
    minPrice: "",
    maxPrice: "",
    beds: "",
    baths: "",
    propertyType: "",
  });
  const [activeFilters, setActiveFilters] = useState<Filters>({
    query: "",
    city: "",
    minPrice: "",
    maxPrice: "",
    beds: "",
    baths: "",
    propertyType: "",
  });

  useEffect(() => {
    fetchProperties(true);
    if (user) {
      fetchSavedProperties();
    }
  }, [user]);

  const fetchProperties = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }

    const currentOffset = reset ? 0 : offset;

    let query = supabase
      .from("properties")
      .select("*", { count: "exact" })
      .eq("status", "active");

    // Apply filters
    if (activeFilters.query) {
      query = query.or(`title.ilike.%${activeFilters.query}%,address.ilike.%${activeFilters.query}%,city.ilike.%${activeFilters.query}%`);
    }
    if (activeFilters.city) {
      query = query.ilike("city", `%${activeFilters.city}%`);
    }
    if (activeFilters.minPrice) {
      query = query.gte("price", parseFloat(activeFilters.minPrice));
    }
    if (activeFilters.maxPrice) {
      query = query.lte("price", parseFloat(activeFilters.maxPrice));
    }
    if (activeFilters.beds && activeFilters.beds !== "any") {
      query = query.gte("bedrooms", parseInt(activeFilters.beds));
    }
    if (activeFilters.baths && activeFilters.baths !== "any") {
      query = query.gte("bathrooms", parseInt(activeFilters.baths));
    }
    if (activeFilters.propertyType && activeFilters.propertyType !== "any") {
      query = query.eq("property_type", activeFilters.propertyType);
    }

    const { data, count } = await query
      .order("created_at", { ascending: false })
      .range(currentOffset, currentOffset + LIMIT - 1);

    if (data) {
      if (reset) {
        setProperties(data);
      } else {
        setProperties([...properties, ...data]);
      }
      setTotal(count || 0);
      setOffset(currentOffset + LIMIT);
    }

    setLoading(false);
    setLoadingMore(false);
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

  const handleSearch = () => {
    setActiveFilters({ ...filters });
    fetchProperties(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
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
        toast({ title: "Removed from saved" });
      }
    } else {
      const { error } = await supabase.from("saved_properties").insert({
        property_id: propertyId,
        user_id: user.id,
      });

      if (!error) {
        setSavedProperties(new Set(savedProperties).add(propertyId));
        toast({ title: "Property saved" });
      }
    }
  };

  const clearFilter = (key: keyof Filters) => {
    const newFilters = { ...activeFilters, [key]: "" };
    setFilters(newFilters);
    setActiveFilters(newFilters);
    setTimeout(() => fetchProperties(true), 0);
  };

  const hasActiveFilters = Object.entries(activeFilters).some(
    ([key, value]) => key !== "query" && value && value !== "any"
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-24">
        {/* Header */}
        <div className="border-b border-border/50 bg-card/50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold">Search Properties</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  {total} properties available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="Search by city, address, or MLS#"
                className="pl-12 h-12 bg-card border-border/50"
              />
            </div>
            <Button onClick={handleSearch} size="lg" className="px-8">
              Search
            </Button>
            
            {/* Filter Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="lg" className="gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasActiveFilters && (
                    <Badge className="ml-1 h-5 w-5 p-0 justify-center bg-primary text-primary-foreground">
                      !
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-card border-border">
                <SheetHeader>
                  <SheetTitle className="font-serif">Filter Properties</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Select
                      value={filters.city}
                      onValueChange={(value) => setFilters({ ...filters, city: value })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Any city" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="any">Any city</SelectItem>
                        <SelectItem value="Atlanta">Atlanta</SelectItem>
                        <SelectItem value="Miami">Miami</SelectItem>
                        <SelectItem value="Dubai">Dubai</SelectItem>
                        <SelectItem value="Mexico City">Mexico City</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Bedrooms</Label>
                    <Select
                      value={filters.beds}
                      onValueChange={(value) => setFilters({ ...filters, beds: value })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Bathrooms</Label>
                    <Select
                      value={filters.baths}
                      onValueChange={(value) => setFilters({ ...filters, baths: value })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Price Range</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                        className="bg-background"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <Select
                      value={filters.propertyType}
                      onValueChange={(value) => setFilters({ ...filters, propertyType: value })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Any type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="any">Any type</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleSearch} className="w-full">
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filter Pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {activeFilters.city && activeFilters.city !== "any" && (
                <FilterPill 
                  label={activeFilters.city} 
                  onRemove={() => clearFilter("city")} 
                />
              )}
              {activeFilters.beds && activeFilters.beds !== "any" && (
                <FilterPill 
                  label={`${activeFilters.beds}+ beds`} 
                  onRemove={() => clearFilter("beds")} 
                />
              )}
              {activeFilters.baths && activeFilters.baths !== "any" && (
                <FilterPill 
                  label={`${activeFilters.baths}+ baths`} 
                  onRemove={() => clearFilter("baths")} 
                />
              )}
              {activeFilters.minPrice && (
                <FilterPill 
                  label={`$${Number(activeFilters.minPrice).toLocaleString()}+`} 
                  onRemove={() => clearFilter("minPrice")} 
                />
              )}
              {activeFilters.maxPrice && (
                <FilterPill 
                  label={`Up to $${Number(activeFilters.maxPrice).toLocaleString()}`} 
                  onRemove={() => clearFilter("maxPrice")} 
                />
              )}
              {activeFilters.propertyType && activeFilters.propertyType !== "any" && (
                <FilterPill 
                  label={activeFilters.propertyType} 
                  onRemove={() => clearFilter("propertyType")} 
                />
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <Card className="inline-block p-8 bg-card border-border/50">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="font-serif text-2xl font-bold mb-2">No Properties Found</h2>
                <p className="text-muted-foreground">
                  Try adjusting your search filters
                </p>
              </Card>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property, index) => (
                  <PropertySearchCard
                    key={property.id}
                    property={property}
                    isSaved={savedProperties.has(property.id)}
                    onSave={() => handleSave(property.id)}
                    formatPrice={formatPrice}
                    index={index}
                  />
                ))}
              </div>

              {/* Load More */}
              {properties.length < total && (
                <div className="text-center mt-10">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => fetchProperties(false)}
                    disabled={loadingMore}
                    className="min-w-[200px]"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      `Load More (${properties.length} of ${total})`
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Filter Pill Component
const FilterPill = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <button
    onClick={onRemove}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-fast"
  >
    {label}
    <X className="w-3.5 h-3.5" />
  </button>
);

// Property Card for Search Results
const PropertySearchCard = ({
  property,
  isSaved,
  onSave,
  formatPrice,
  index,
}: {
  property: Property;
  isSaved: boolean;
  onSave: () => void;
  formatPrice: (price: number) => string;
  index: number;
}) => (
  <Card 
    className="overflow-hidden bg-card border-border/50 hover:border-primary/30 transition-elegant hover-card-lift animate-fade-in"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    <div className="relative aspect-[4/3] overflow-hidden">
      {property.images && property.images[0] ? (
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-elegant"
        />
      ) : (
        <div className="w-full h-full bg-secondary flex items-center justify-center">
          <MapPin className="w-12 h-12 text-muted-foreground" />
        </div>
      )}
      
      {/* Save Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSave();
        }}
        className="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background transition-fast"
      >
        <Heart className={`w-5 h-5 ${isSaved ? "fill-primary text-primary" : "text-foreground"}`} />
      </button>

      {/* Price Badge */}
      <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg">
        {formatPrice(property.price)}
      </div>
    </div>

    <div className="p-4">
      <h3 className="font-semibold text-foreground line-clamp-1">{property.title}</h3>
      <p className="text-muted-foreground text-sm mt-1">
        {property.city}, {property.country}
      </p>

      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
        {property.bedrooms !== null && (
          <span className="flex items-center gap-1">
            <BedDouble className="w-4 h-4" />
            {property.bedrooms} beds
          </span>
        )}
        {property.bathrooms !== null && (
          <span className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            {property.bathrooms} baths
          </span>
        )}
        {property.sqft !== null && (
          <span className="flex items-center gap-1">
            <Maximize className="w-4 h-4" />
            {property.sqft.toLocaleString()} sqft
          </span>
        )}
      </div>
    </div>
  </Card>
);

export default Search;
