import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Users, Calendar, FileText, Settings, Home } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ConciergeRequestsManager } from "@/components/admin/ConciergeRequestsManager";

const Admin = () => {
  const [stats, setStats] = useState({
    members: 0,
    requests: 0,
    events: 0,
    properties: 0,
  });
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchEvents();
  }, []);

  const fetchStats = async () => {
    const [membersRes, requestsRes, eventsRes, propertiesRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("concierge_requests").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase.from("properties").select("id", { count: "exact", head: true }),
    ]);

    setStats({
      members: membersRes.count || 0,
      requests: requestsRes.count || 0,
      events: eventsRes.count || 0,
      properties: propertiesRes.count || 0,
    });
  };

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true })
      .limit(10);

    if (data) setEvents(data);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
          <section className="py-20 bg-gradient-to-b from-background to-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h1 className="font-serif text-5xl font-bold mb-4">
                  <span className="gradient-text-gold">Admin</span> Dashboard
                </h1>
                <p className="text-xl text-foreground/70">
                  Manage members, requests, and content
                </p>
              </div>

              {/* Stats Overview */}
              <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
                <Card className="p-6 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold mb-1">{stats.members}</div>
                  <p className="text-sm text-foreground/60">Total Members</p>
                </Card>
                <Card className="p-6 text-center">
                  <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold mb-1">{stats.requests}</div>
                  <p className="text-sm text-foreground/60">Concierge Requests</p>
                </Card>
                <Card className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold mb-1">{stats.events}</div>
                  <p className="text-sm text-foreground/60">Events</p>
                </Card>
                <Card className="p-6 text-center">
                  <Home className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold mb-1">{stats.properties}</div>
                  <p className="text-sm text-foreground/60">Properties</p>
                </Card>
              </div>

              {/* Management Tabs */}
              <Tabs defaultValue="requests" className="max-w-6xl mx-auto">
                <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 mb-8">
                  <TabsTrigger value="requests">Concierge Requests</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                </TabsList>

                <TabsContent value="requests">
                  <ConciergeRequestsManager />
                </TabsContent>

                <TabsContent value="events">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-serif text-2xl font-bold">Events</h2>
                      <Button variant="hero">Create Event</Button>
                    </div>
                    <div className="space-y-4">
                      {events.map((event) => (
                        <Card key={event.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{event.title}</h3>
                              <p className="text-sm text-foreground/70 mb-2">{event.description}</p>
                              <div className="flex items-center gap-4 text-xs text-foreground/60">
                                <span>{format(new Date(event.event_date), "PPP")}</span>
                                <span>{event.city}</span>
                                {event.capacity && <span>{event.capacity} capacity</span>}
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </main>
      </div>
    </AdminGuard>
  );
};

export default Admin;
