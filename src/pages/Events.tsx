import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMembership, TIER_LABELS, MembershipTier } from "@/hooks/useMembership";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  city: string;
  venue: string | null;
  capacity: number | null;
  min_tier: string | null;
  dress_code: string | null;
  image_url: string | null;
}

interface EventRsvp {
  event_id: string;
}

const Events = () => {
  const { user } = useAuth();
  const { tier, canAccessTier } = useMembership();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRsvps] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    if (user) fetchRsvps();
  }, [user]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("status", "upcoming")
      .order("event_date", { ascending: true });

    if (data) setEvents(data);
    setLoading(false);
  };

  const fetchRsvps = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("event_rsvps")
      .select("event_id")
      .eq("user_id", user.id);
    if (data) setRsvps(new Set(data.map((r: EventRsvp) => r.event_id)));
  };

  const handleRsvp = async (eventId: string, minTier: string | null) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to RSVP", variant: "destructive" });
      return;
    }

    if (minTier && !canAccessTier(minTier as MembershipTier)) {
      toast({ 
        title: "Upgrade Required", 
        description: `This event requires ${TIER_LABELS[minTier as MembershipTier]} membership` 
      });
      return;
    }

    if (rsvps.has(eventId)) {
      await supabase.from("event_rsvps").delete().eq("event_id", eventId).eq("user_id", user.id);
      const newRsvps = new Set(rsvps);
      newRsvps.delete(eventId);
      setRsvps(newRsvps);
      toast({ title: "RSVP Cancelled" });
    } else {
      await supabase.from("event_rsvps").insert({ event_id: eventId, user_id: user.id });
      setRsvps(new Set(rsvps).add(eventId));
      toast({ title: "RSVP Confirmed!" });
    }
  };

  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case "gold": return "text-yellow-500";
      case "platinum": return "text-primary";
      case "black": return "text-foreground";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-24 md:pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="py-8 md:py-12 text-center">
            <p className="text-eyebrow text-primary mb-2">MEMBER EVENTS</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">
              Exclusive <span className="gradient-text-gold">Experiences</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Private events, VIP access, and networking opportunities for our members
            </p>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[16/10] bg-muted rounded-lg mb-4"></div>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <Card className="p-12 text-center bg-card border-border/50">
              <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="font-serif text-2xl font-bold mb-2">No Upcoming Events</h2>
              <p className="text-muted-foreground">Check back soon for exclusive member events</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => {
                const isRsvped = rsvps.has(event.id);
                const isLocked = event.min_tier && !canAccessTier(event.min_tier as MembershipTier);
                const eventDate = new Date(event.event_date);

                return (
                  <Card 
                    key={event.id}
                    className="overflow-hidden bg-card border-border/50 hover:border-primary/30 transition-elegant animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                      {event.image_url ? (
                        <img 
                          src={event.image_url} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                          <Calendar className="w-12 h-12 text-primary/50" />
                        </div>
                      )}
                      
                      {/* Tier Badge */}
                      {event.min_tier && (
                        <Badge className={`absolute top-3 right-3 ${getTierColor(event.min_tier)} bg-background/80 backdrop-blur-sm`}>
                          {TIER_LABELS[event.min_tier as MembershipTier]}+ Only
                        </Badge>
                      )}
                      
                      {/* Date Badge */}
                      <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-center">
                        <div className="text-lg font-bold leading-none">{format(eventDate, 'd')}</div>
                        <div className="text-xs uppercase">{format(eventDate, 'MMM')}</div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-serif text-xl font-bold mb-2 line-clamp-1">{event.title}</h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{format(eventDate, 'EEEE, MMMM d · h:mm a')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{event.venue || event.city}</span>
                        </div>
                        {event.capacity && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <span>Limited to {event.capacity} guests</span>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {event.description}
                        </p>
                      )}

                      {user ? (
                        isLocked ? (
                          <Link to="/membership">
                            <Button variant="outline" className="w-full gap-2">
                              <Lock className="w-4 h-4" />
                              Upgrade to {TIER_LABELS[event.min_tier as MembershipTier]}
                            </Button>
                          </Link>
                        ) : (
                          <Button 
                            variant={isRsvped ? "outline" : "hero"} 
                            className="w-full"
                            onClick={() => handleRsvp(event.id, event.min_tier)}
                          >
                            {isRsvped ? "Cancel RSVP" : "RSVP Now"}
                          </Button>
                        )
                      ) : (
                        <Link to="/auth">
                          <Button variant="hero" className="w-full">
                            Sign In to RSVP
                          </Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer className="hidden md:block" />
      <BottomTabs />
    </div>
  );
};

export default Events;
