import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ProfileSkeleton, 
  SavedPropertyRowSkeleton, 
  RsvpRowSkeleton, 
  RequestCardSkeleton,
  SkeletonGrid 
} from "@/components/ui/skeletons";
import {
  User, Settings, CreditCard, Mail, Shield, Calendar, 
  Home, MessageSquare, Heart, MapPin, Clock, Edit2, Save, X 
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMembership, TIER_LABELS, TIER_COLORS } from "@/hooks/useMembership";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Profile {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

interface SavedProperty {
  id: string;
  property_id: string;
  created_at: string;
  properties: {
    id: string;
    title: string;
    city: string;
    price: number;
    images: string[] | null;
  } | null;
}

interface EventRsvp {
  id: string;
  created_at: string;
  events: {
    id: string;
    title: string;
    event_date: string;
    city: string;
    venue: string | null;
  } | null;
}

interface ConciergeRequest {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
}

const Account = () => {
  const { user, loading } = useAuth();
  const { tier, loading: membershipLoading } = useMembership();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile>({ first_name: null, last_name: null, phone: null });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [rsvps, setRsvps] = useState<EventRsvp[]>([]);
  const [requests, setRequests] = useState<ConciergeRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;
    setLoadingData(true);

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (profileData) {
      setProfile(profileData);
    }

    // Fetch saved properties with property details
    const { data: savedData } = await supabase
      .from("saved_properties")
      .select(`
        id,
        property_id,
        created_at,
        properties (id, title, city, price, images)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (savedData) {
      setSavedProperties(savedData as SavedProperty[]);
    }

    // Fetch RSVPs with event details
    const { data: rsvpData } = await supabase
      .from("event_rsvps")
      .select(`
        id,
        created_at,
        events (id, title, event_date, city, venue)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (rsvpData) {
      setRsvps(rsvpData as EventRsvp[]);
    }

    // Fetch concierge requests
    const { data: requestData } = await supabase
      .from("concierge_requests")
      .select("id, title, category, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (requestData) {
      setRequests(requestData);
    }

    setLoadingData(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } else {
      toast({ title: "Profile Updated", description: "Your changes have been saved" });
      setIsEditing(false);
    }
    setSaving(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/20 text-green-500";
      case "in_progress": return "bg-blue-500/20 text-blue-500";
      case "submitted": return "bg-yellow-500/20 text-yellow-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20 pb-24 md:pb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-8">
            <Card className="p-6 md:p-8 mb-8">
              <ProfileSkeleton />
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = profile.first_name || user.user_metadata?.first_name || "Member";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="page-main">
        <div className="content-narrow section-sm">
          {/* Profile Header */}
          <Card className="p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
              </div>
              <div className="flex-1 w-full">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profile.first_name || ""}
                          onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profile.last_name || ""}
                          onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profile.phone || ""}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="gap-2">
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h1 className="text-2xl md:text-3xl font-serif font-bold">
                        {displayName} {profile.last_name || user.user_metadata?.last_name || ""}
                      </h1>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      {profile.phone && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{profile.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={TIER_COLORS[tier]}>
                        {membershipLoading ? "..." : TIER_LABELS[tier]}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Shield className="w-3 h-3" />
                        Active
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="overview" className="py-3 text-xs md:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="saved" className="py-3 text-xs md:text-sm gap-1">
                <Heart className="w-3 h-3 hidden md:block" />
                Saved ({savedProperties.length})
              </TabsTrigger>
              <TabsTrigger value="rsvps" className="py-3 text-xs md:text-sm gap-1">
                <Calendar className="w-3 h-3 hidden md:block" />
                RSVPs ({rsvps.length})
              </TabsTrigger>
              <TabsTrigger value="requests" className="py-3 text-xs md:text-sm gap-1">
                <MessageSquare className="w-3 h-3 hidden md:block" />
                Requests ({requests.length})
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Link to="/membership">
                  <Card className="p-5 hover:border-primary/30 transition-colors cursor-pointer h-full">
                    <CreditCard className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-1">Membership</h3>
                    <p className="text-sm text-muted-foreground">View and upgrade tier</p>
                  </Card>
                </Link>
                <Link to="/concierge">
                  <Card className="p-5 hover:border-primary/30 transition-colors cursor-pointer h-full">
                    <MessageSquare className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-1">Concierge</h3>
                    <p className="text-sm text-muted-foreground">Submit new requests</p>
                  </Card>
                </Link>
                <Link to="/events">
                  <Card className="p-5 hover:border-primary/30 transition-colors cursor-pointer h-full">
                    <Calendar className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-1">Events</h3>
                    <p className="text-sm text-muted-foreground">Browse upcoming events</p>
                  </Card>
                </Link>
              </div>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Account Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Email</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Member Since</span>
                    <span>{format(new Date(user.created_at), "MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Tier</span>
                    <span className="text-primary">{TIER_LABELS[tier]}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-green-500">Active</span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Saved Properties Tab */}
            <TabsContent value="saved">
              {loadingData ? (
                <SkeletonGrid 
                  count={4} 
                  Component={SavedPropertyRowSkeleton} 
                  className="grid-cols-1 md:grid-cols-2" 
                />
              ) : savedProperties.length === 0 ? (
                <Card className="p-12 text-center">
                  <Heart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Saved Properties</h3>
                  <p className="text-muted-foreground mb-4">Properties you save will appear here</p>
                  <Link to="/search">
                    <Button>Browse Properties</Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {savedProperties.map((item) => (
                    <Link key={item.id} to={`/property/${item.property_id}`}>
                      <Card className="flex overflow-hidden hover:border-primary/30 transition-colors">
                        <div className="w-32 h-28 flex-shrink-0 bg-muted">
                          {item.properties?.images?.[0] ? (
                            <img 
                              src={item.properties.images[0]} 
                              alt={item.properties.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Home className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-1">
                          <h4 className="font-semibold line-clamp-1">{item.properties?.title || "Property"}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {item.properties?.city}
                          </p>
                          <p className="text-primary font-semibold mt-2">
                            ${item.properties?.price?.toLocaleString()}
                          </p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* RSVPs Tab */}
            <TabsContent value="rsvps">
              {loadingData ? (
                <SkeletonGrid 
                  count={3} 
                  Component={RsvpRowSkeleton} 
                  className="grid-cols-1" 
                />
              ) : rsvps.length === 0 ? (
                <Card className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No RSVPs Yet</h3>
                  <p className="text-muted-foreground mb-4">Events you RSVP to will appear here</p>
                  <Link to="/events">
                    <Button>Browse Events</Button>
                  </Link>
                </Card>
              ) : (
                <div className="space-y-3">
                  {rsvps.map((rsvp) => (
                    <Card key={rsvp.id} className="p-4 hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-center flex-shrink-0">
                          {rsvp.events?.event_date && (
                            <>
                              <div className="text-lg font-bold leading-none">
                                {format(new Date(rsvp.events.event_date), "d")}
                              </div>
                              <div className="text-xs uppercase">
                                {format(new Date(rsvp.events.event_date), "MMM")}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{rsvp.events?.title}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {rsvp.events?.venue || rsvp.events?.city}
                          </p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-500">Confirmed</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Concierge Requests Tab */}
            <TabsContent value="requests">
              {loadingData ? (
                <SkeletonGrid 
                  count={3} 
                  Component={RequestCardSkeleton} 
                  className="grid-cols-1" 
                />
              ) : requests.length === 0 ? (
                <Card className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Requests Yet</h3>
                  <p className="text-muted-foreground mb-4">Your concierge request history will appear here</p>
                  <Link to="/concierge">
                    <Button>Submit a Request</Button>
                  </Link>
                </Card>
              ) : (
                <div className="space-y-3">
                  {requests.map((request) => (
                    <Link key={request.id} to={`/concierge/request/${request.id}`}>
                      <Card className="p-4 hover:border-primary/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{request.title}</h4>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              <span>{request.category}</span>
                              <span>•</span>
                              <Clock className="w-3 h-3" />
                              {format(new Date(request.created_at), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer className="hidden md:block" />
      <BottomTabs />
    </div>
  );
};

export default Account;
