import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BedDouble, Bath, Maximize, MapPin, Heart } from "lucide-react";

interface PropertyCardProps {
  property: {
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
  };
  onSave: (propertyId: string) => void;
  isSaved: boolean;
}

export const PropertyCard = ({ property, onSave, isSaved }: PropertyCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="overflow-hidden hover:shadow-gold transition-elegant group">
      <div className="relative h-64 overflow-hidden">
        {property.images && property.images[0] ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <MapPin className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-background/80 hover:bg-background"
          onClick={() => onSave(property.id)}
        >
          <Heart className={`w-5 h-5 ${isSaved ? "fill-primary text-primary" : ""}`} />
        </Button>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-serif text-xl font-bold line-clamp-1">{property.title}</h3>
          {property.property_type && (
            <Badge variant="secondary">{property.property_type}</Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-foreground/60 mb-3">
          <MapPin className="w-4 h-4" />
          <span>{property.city}, {property.country}</span>
        </div>

        {property.description && (
          <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
            {property.description}
          </p>
        )}

        <div className="flex items-center gap-4 mb-4 text-sm">
          {property.bedrooms !== null && (
            <div className="flex items-center gap-1">
              <BedDouble className="w-4 h-4 text-primary" />
              <span>{property.bedrooms} beds</span>
            </div>
          )}
          {property.bathrooms !== null && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-primary" />
              <span>{property.bathrooms} baths</span>
            </div>
          )}
          {property.sqft !== null && (
            <div className="flex items-center gap-1">
              <Maximize className="w-4 h-4 text-primary" />
              <span>{property.sqft.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        {property.lifestyle_tags && property.lifestyle_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {property.lifestyle_tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="font-serif text-2xl font-bold text-primary">
            {formatPrice(property.price)}
          </span>
          <Button variant="hero">View Details</Button>
        </div>
      </div>
    </Card>
  );
};
