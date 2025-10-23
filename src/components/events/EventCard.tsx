import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    event_date: string;
    venue: string | null;
    city: string;
    capacity: number | null;
    min_tier: string | null;
    dress_code: string | null;
    image_url: string | null;
  };
  onRSVP: (eventId: string) => void;
  isRSVPd: boolean;
}

export const EventCard = ({ event, onRSVP, isRSVPd }: EventCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-gold transition-elegant">
      {event.image_url && (
        <div className="h-48 overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-serif text-xl font-bold">{event.title}</h3>
          {event.min_tier && (
            <Badge variant="secondary">{event.min_tier} tier</Badge>
          )}
        </div>
        
        {event.description && (
          <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{format(new Date(event.event_date), "PPP 'at' p")}</span>
          </div>
          
          {event.venue && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{event.venue}, {event.city}</span>
            </div>
          )}
          
          {event.capacity && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-primary" />
              <span>{event.capacity} spots available</span>
            </div>
          )}
        </div>

        {event.dress_code && (
          <p className="text-xs text-foreground/60 mb-4">
            Dress Code: {event.dress_code}
          </p>
        )}

        <Button
          variant={isRSVPd ? "outline" : "hero"}
          className="w-full"
          onClick={() => onRSVP(event.id)}
          disabled={isRSVPd}
        >
          {isRSVPd ? "Already RSVP'd" : "RSVP Now"}
        </Button>
      </div>
    </Card>
  );
};
