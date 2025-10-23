import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Users } from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Event {
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
}

const Community = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRsvps] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .eq("status", "upcoming")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true });

      if (eventsData) {
        setEvents(eventsData);
      }

      if (user) {
        const { data: rsvpData } = await supabase
          .from("event_rsvps")
          .select("event_id")
          .eq("user_id", user.id);

        if (rsvpData) {
          setRsvps(new Set(rsvpData.map((r) => r.event_id)));
        }
      }

      setLoading(false);
    };

    fetchEvents();
  }, [user]);

  const handleRSVP = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to RSVP to events",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("event_rsvps").insert({
      event_id: eventId,
      user_id: user.id,
      status: "confirmed",
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to RSVP. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setRsvps(new Set(rsvps).add(eventId));
    toast({
      title: "RSVP Confirmed",
      description: "We look forward to seeing you at the event!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="font-serif text-5xl font-bold mb-4">
                Community & <span className="gradient-text-gold">Events</span>
              </h1>
              <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                Exclusive gatherings and member experiences
              </p>
            </div>

            {!user && (
              <Card className="max-w-2xl mx-auto p-8 text-center mb-12">
                <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Members Only</h3>
                <p className="text-foreground/70 mb-4">
                  Log in to view and RSVP to exclusive events
                </p>
                <Link to="/auth">
                  <Button variant="hero">Login / Sign Up</Button>
                </Link>
              </Card>
            )}

            {loading ? (
              <div className="text-center py-12">
                <p className="text-foreground/60">Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-block p-8 bg-muted/50 rounded-2xl border border-primary/20">
                  <div className="flex justify-center gap-4 mb-4">
                    <Calendar className="w-12 h-12 text-primary" />
                    <Users className="w-12 h-12 text-primary" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold mb-2">No Upcoming Events</h2>
                  <p className="text-foreground/70">
                    Check back soon for exclusive member experiences
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRSVP={handleRSVP}
                    isRSVPd={rsvps.has(event.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Community;
