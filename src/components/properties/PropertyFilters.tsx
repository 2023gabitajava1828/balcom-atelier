import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface PropertyFiltersProps {
  onSearch: (filters: PropertySearchFilters) => void;
}

export interface PropertySearchFilters {
  search: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  propertyType: string;
}

export const PropertyFilters = ({ onSearch }: PropertyFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<PropertySearchFilters>({
    search: "",
    city: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    propertyType: "",
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  return (
    <Card className="p-6 mb-8">
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by location, property type, or keywords..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="h-12"
            />
          </div>
          <Button variant="hero" size="lg" onClick={handleSearch}>
            <Search className="mr-2" />
            Search
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <SlidersHorizontal className="mr-2" />
            Filters
          </Button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <Label>City</Label>
              <Input
                placeholder="e.g., Miami"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              />
            </div>

            <div>
              <Label>Property Type</Label>
              <Select
                value={filters.propertyType}
                onValueChange={(value) => setFilters({ ...filters, propertyType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="penthouse">Penthouse</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="estate">Estate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Min Price</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </div>

            <div>
              <Label>Max Price</Label>
              <Input
                type="number"
                placeholder="No limit"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>

            <div>
              <Label>Bedrooms</Label>
              <Select
                value={filters.bedrooms}
                onValueChange={(value) => setFilters({ ...filters, bedrooms: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
