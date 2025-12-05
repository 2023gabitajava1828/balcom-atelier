import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMembership } from "@/hooks/useMembership";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/layout/Navigation";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ClipboardList, TrendingUp, Plus, Trophy, Calendar, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AthleteRoster from "@/components/sports/AthleteRoster";
import AthleteRequestForm from "@/components/sports/AthleteRequestForm";
import AgentActivityDashboard from "@/components/sports/AgentActivityDashboard";
import AddAthleteModal from "@/components/sports/AddAthleteModal";
import { useToast } from "@/hooks/use-toast";

interface Athlete {
  id: string;
  first_name: string;
  last_name: string;
  sport: string;
  team: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  contract_end: string | null;
  status: string;
  notes: string | null;
}

const Sports = () => {
  const { user, loading: authLoading } = useAuth();
  const { tier } = useMembership();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [stats, setStats] = useState({
    totalAthletes: 0,
    activeRequests: 0,
    completedRequests: 0,
    totalSpend: 0
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAthletes();
      fetchStats();
    }
  }, [user]);

  const fetchAthletes = async () => {
    const { data, error } = await supabase
      .from("athletes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAthletes(data);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    // Get athlete count
    const { count: athleteCount } = await supabase
      .from("athletes")
      .select("*", { count: "exact", head: true });

    // Get request stats
    const { data: requests } = await supabase
      .from("athlete_requests")
      .select("status, budget_max");

    const activeRequests = requests?.filter(r => 
      r.status === "submitted" || r.status === "in_progress"
    ).length || 0;
    
    const completedRequests = requests?.filter(r => 
      r.status === "completed"
    ).length || 0;

    const totalSpend = requests?.reduce((sum, r) => 
      sum + (r.budget_max || 0), 0
    ) || 0;

    setStats({
      totalAthletes: athleteCount || 0,
      activeRequests,
      completedRequests,
      totalSpend
    });
  };

  const handleAthleteAdded = () => {
    fetchAthletes();
    fetchStats();
    setShowAddModal(false);
    toast({
      title: "Athlete Added",
      description: "The athlete has been added to your roster."
    });
  };

  const handleSelectAthlete = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              Agent Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your athletes and their concierge requests
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Athlete
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalAthletes}</p>
                  <p className="text-xs text-muted-foreground">Athletes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <ClipboardList className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeRequests}</p>
                  <p className="text-xs text-muted-foreground">Active Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completedRequests}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/20 rounded-lg">
                  <DollarSign className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${(stats.totalSpend / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-muted-foreground">Total Budget</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="roster" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="roster" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Roster</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">New Request</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roster">
            <AthleteRoster 
              athletes={athletes} 
              onRefresh={fetchAthletes}
              onSelectAthlete={handleSelectAthlete}
              selectedAthlete={selectedAthlete}
            />
          </TabsContent>

          <TabsContent value="requests">
            <AthleteRequestForm 
              athletes={athletes}
              selectedAthlete={selectedAthlete}
              onRequestSubmitted={() => {
                fetchStats();
                toast({
                  title: "Request Submitted",
                  description: "Your concierge request has been submitted."
                });
              }}
            />
          </TabsContent>

          <TabsContent value="activity">
            <AgentActivityDashboard />
          </TabsContent>
        </Tabs>
      </main>

      <AddAthleteModal 
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={handleAthleteAdded}
      />

      <BottomTabs />
    </div>
  );
};

export default Sports;
