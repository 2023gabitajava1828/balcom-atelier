import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventDetailModal } from "@/components/events/EventDetailModal";
import { EventCardSkeleton, SkeletonGrid } from "@/components/ui/skeletons";
import { NoUpcomingEvents } from "@/components/ui/empty-state";
import { Calendar, MapPin, Users, Clock, Lock, Sparkles } from "lucide-react";
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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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
      toast({ title: "RSVP Cancelled", description: "You've been removed from the guest list" });
    } else {
      await supabase.from("event_rsvps").insert({ event_id: eventId, user_id: user.id });
      setRsvps(new Set(rsvps).add(eventId));
      toast({ title: "RSVP Confirmed!", description: "You're on the guest list" });
    }
  };

  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case "gold": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "platinum": return "bg-primary/20 text-primary border-primary/30";
      case "black": return "bg-foreground/20 text-foreground border-foreground/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-24 md:pb-8">
        {/* Hero Section */}
        <section className="relative py-12 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
          
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center gap-3 mb-6">
              <Calendar className="w-10 h-10 text-primary" />
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <p className="text-xs uppercase tracking-widest text-primary mb-3">Member Events</p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Exclusive <span className="gradient-text-gold">Experiences</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Private events, VIP access, and networking opportunities curated for our distinguished members
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Events Grid */}
          {loading ? (
            <SkeletonGrid 
              count={6} 
              Component={EventCardSkeleton} 
              className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            />
          ) : events.length === 0 ? (
            <NoUpcomingEvents />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => {
                const isRsvped = rsvps.has(event.id);
                const isLocked = event.min_tier && !canAccessTier(event.min_tier as MembershipTier);
                const eventDate = new Date(event.event_date);

                return (
                  <Card 
                    key={event.id}
                    className="group overflow-hidden bg-card border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => setSelectedEvent(event)}
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                      {event.image_url ? (
                        <img 
                          src={event.image_url} 
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                          <Calendar className="w-12 h-12 text-primary/50" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                      
                      {/* Tier Badge */}
                      {event.min_tier && (
                        <Badge className={`absolute top-3 right-3 ${getTierColor(event.min_tier)}`}>
                          {TIER_LABELS[event.min_tier as MembershipTier]}+
                        </Badge>
                      )}
                      
                      {/* RSVP Badge */}
                      {isRsvped && (
                        <Badge className="absolute top-3 left-14 bg-green-500/90 text-white border-0">
                          Going ✓
                        </Badge>
                      )}
                      
                      {/* Date Badge */}
                      <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-center shadow-lg">
                        <div className="text-lg font-bold leading-none">{format(eventDate, 'd')}</div>
                        <div className="text-[10px] uppercase tracking-wider">{format(eventDate, 'MMM')}</div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-serif text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="truncate">{format(eventDate, 'EEE, MMM d · h:mm a')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="truncate">{event.venue || event.city}</span>
                        </div>
                        {event.capacity && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>Limited to {event.capacity} guests</span>
                          </div>
                        )}
                      </div>

                      {user ? (
                        isLocked ? (
                          <Button 
                            variant="outline" 
                            className="w-full gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Lock className="w-4 h-4" />
                            {TIER_LABELS[event.min_tier as MembershipTier]} Only
                          </Button>
                        ) : (
                          <Button 
                            variant={isRsvped ? "outline" : "default"} 
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRsvp(event.id, event.min_tier);
                            }}
                          >
                            {isRsvped ? "Cancel RSVP" : "RSVP Now"}
                          </Button>
                        )
                      ) : (
                        <Button 
                          variant="default" 
                          className="w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link to="/auth" className="w-full">
                            Sign In to RSVP
                          </Link>
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Results count */}
          {!loading && events.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Showing {events.length} upcoming {events.length === 1 ? "event" : "events"}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer className="hidden md:block" />
      <BottomTabs />

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        isRsvped={selectedEvent ? rsvps.has(selectedEvent.id) : false}
        isLocked={selectedEvent?.min_tier ? !canAccessTier(selectedEvent.min_tier as MembershipTier) : false}
        isLoggedIn={!!user}
        onRsvp={() => {
          if (selectedEvent) {
            handleRsvp(selectedEvent.id, selectedEvent.min_tier);
          }
        }}
      />
    </div>
  );
};

export default Events;
