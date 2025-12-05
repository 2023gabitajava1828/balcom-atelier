import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  ClipboardList, 
  History, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  DollarSign,
  AlertCircle,
  Trophy,
  Mail,
  Phone
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AthleteProfile {
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

interface AthleteRequest {
  id: string;
  category: string;
  title: string;
  description: string | null;
  preferred_date: string | null;
  budget_min: number | null;
  budget_max: number | null;
  status: string;
  priority: string;
  athlete_approval: string;
  athlete_notes: string | null;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  travel: "Travel & Logistics",
  shopping: "Personal Shopping",
  "real-estate": "Real Estate",
  events: "Events & Entertainment",
  automotive: "Automotive",
  dining: "Dining & Hospitality",
  other: "Other Services"
};

const AthletePortal = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [requests, setRequests] = useState<AthleteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionRequest, setActionRequest] = useState<{request: AthleteRequest; action: 'approve' | 'reject'} | null>(null);
  const [actionNotes, setActionNotes] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAthleteProfile();
    }
  }, [user]);

  const fetchAthleteProfile = async () => {
    if (!user) return;

    // First try to find athlete by user_id
    let { data: athleteData } = await supabase
      .from("athletes")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // If not found, try by email
    if (!athleteData && user.email) {
      const { data: athleteByEmail } = await supabase
        .from("athletes")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      if (athleteByEmail) {
        // Link this user to the athlete record
        await supabase
          .from("athletes")
          .update({ user_id: user.id })
          .eq("id", athleteByEmail.id);
        
        athleteData = athleteByEmail;
      }
    }

    if (athleteData) {
      setAthlete(athleteData);
      fetchRequests(athleteData.id);
    }
    setLoading(false);
  };

  const fetchRequests = async (athleteId: string) => {
    const { data } = await supabase
      .from("athlete_requests")
      .select("*")
      .eq("athlete_id", athleteId)
      .order("created_at", { ascending: false });

    if (data) {
      setRequests(data);
    }
  };

  const handleApproval = async (action: 'approve' | 'reject') => {
    if (!actionRequest) return;

    const { error } = await supabase
      .from("athlete_requests")
      .update({
        athlete_approval: action === 'approve' ? 'approved' : 'rejected',
        athlete_approval_date: new Date().toISOString(),
        athlete_notes: actionNotes || null
      })
      .eq("id", actionRequest.request.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update request. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: action === 'approve' ? "Request Approved" : "Request Rejected",
        description: `You have ${action === 'approve' ? 'approved' : 'rejected'} this request.`
      });
      if (athlete) fetchRequests(athlete.id);
    }

    setActionRequest(null);
    setActionNotes("");
  };

  const pendingRequests = requests.filter(r => r.athlete_approval === 'pending');
  const processedRequests = requests.filter(r => r.athlete_approval !== 'pending');

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navigation />
        <main className="container mx-auto px-4 py-20 max-w-2xl text-center">
          <div className="p-6 bg-muted/50 rounded-2xl">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Athlete Portal</h1>
            <p className="text-muted-foreground mb-6">
              No athlete profile is linked to your account. Please contact your agent to set up your profile.
            </p>
            <Button onClick={() => navigate("/")}>Return Home</Button>
          </div>
        </main>
        <BottomTabs />
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={athlete.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {getInitials(athlete.first_name, athlete.last_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {athlete.first_name}
            </h1>
            <p className="text-muted-foreground">
              {athlete.sport} {athlete.position && `• ${athlete.position}`}
            </p>
          </div>
        </div>

        {/* Pending Requests Alert */}
        {pendingRequests.length > 0 && (
          <Card className="mb-6 bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <div className="flex-1">
                <p className="font-medium">You have {pendingRequests.length} pending request{pendingRequests.length > 1 ? 's' : ''}</p>
                <p className="text-sm text-muted-foreground">Review and approve requests from your agent</p>
              </div>
              <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                {pendingRequests.length} Pending
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue={pendingRequests.length > 0 ? "pending" : "profile"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2 relative">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Pending</span>
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">First Name</p>
                      <p className="font-medium">{athlete.first_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Name</p>
                      <p className="font-medium">{athlete.last_name}</p>
                    </div>
                  </div>
                  
                  {athlete.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{athlete.email}</span>
                    </div>
                  )}
                  
                  {athlete.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{athlete.phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Career Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Sport</p>
                    <p className="font-medium">{athlete.sport}</p>
                  </div>
                  
                  {athlete.team && (
                    <div>
                      <p className="text-sm text-muted-foreground">Team</p>
                      <p className="font-medium">{athlete.team}</p>
                    </div>
                  )}
                  
                  {athlete.position && (
                    <div>
                      <p className="text-sm text-muted-foreground">Position</p>
                      <p className="font-medium">{athlete.position}</p>
                    </div>
                  )}
                  
                  {athlete.contract_end && (
                    <div>
                      <p className="text-sm text-muted-foreground">Contract Ends</p>
                      <p className="font-medium">
                        {format(new Date(athlete.contract_end), "MMMM d, yyyy")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Request Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-amber-500/10 rounded-lg">
                      <p className="text-2xl font-bold text-amber-600">{pendingRequests.length}</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                    <div className="p-4 bg-emerald-500/10 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-600">
                        {requests.filter(r => r.athlete_approval === 'approved').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Approved</p>
                    </div>
                    <div className="p-4 bg-red-500/10 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {requests.filter(r => r.athlete_approval === 'rejected').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Rejected</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pending Requests Tab */}
          <TabsContent value="pending">
            {pendingRequests.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">All Caught Up!</h3>
                  <p className="text-muted-foreground">
                    No pending requests to review.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending Approval
                            </Badge>
                            <Badge variant="outline">
                              {categoryLabels[request.category] || request.category}
                            </Badge>
                          </div>
                          
                          <h3 className="text-lg font-semibold mb-2">{request.title}</h3>
                          
                          {request.description && (
                            <p className="text-muted-foreground mb-4">{request.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {request.preferred_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(request.preferred_date), "MMM d, yyyy 'at' h:mm a")}
                              </span>
                            )}
                            
                            {(request.budget_min || request.budget_max) && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {request.budget_min && request.budget_max
                                  ? `$${request.budget_min.toLocaleString()} - $${request.budget_max.toLocaleString()}`
                                  : request.budget_max 
                                    ? `Up to $${request.budget_max.toLocaleString()}`
                                    : `From $${request.budget_min?.toLocaleString()}`
                                }
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="border-red-500/50 text-red-600 hover:bg-red-500/10"
                            onClick={() => setActionRequest({ request, action: 'reject' })}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button 
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => setActionRequest({ request, action: 'approve' })}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            {processedRequests.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No request history yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {processedRequests.map((request) => {
                  const isApproved = request.athlete_approval === 'approved';
                  
                  return (
                    <Card key={request.id} className={isApproved ? "bg-emerald-500/5" : "bg-red-500/5"}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${isApproved ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                            {isApproved ? (
                              <CheckCircle className="h-5 w-5 text-emerald-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">{request.title}</h4>
                              <Badge variant="outline" className={isApproved 
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-red-500/10 text-red-600 border-red-500/20"
                              }>
                                {isApproved ? "Approved" : "Rejected"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {categoryLabels[request.category]} • {format(new Date(request.created_at), "MMM d, yyyy")}
                            </p>
                            {request.athlete_notes && (
                              <p className="text-sm text-muted-foreground mt-1 italic">
                                "{request.athlete_notes}"
                              </p>
                            )}
                          </div>
                          
                          <div className="text-right hidden sm:block">
                            {(request.budget_max || request.budget_min) && (
                              <p className="font-medium">
                                ${(request.budget_max || request.budget_min)?.toLocaleString()}
                              </p>
                            )}
                            <Badge variant="outline" className={
                              request.status === 'completed' 
                                ? "bg-emerald-500/10 text-emerald-600" 
                                : request.status === 'in_progress'
                                  ? "bg-blue-500/10 text-blue-600"
                                  : "bg-muted text-muted-foreground"
                            }>
                              {request.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Approval Dialog */}
      <AlertDialog open={!!actionRequest} onOpenChange={(open) => !open && setActionRequest(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionRequest?.action === 'approve' ? 'Approve Request?' : 'Reject Request?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionRequest?.action === 'approve' 
                ? 'This will notify your agent that you have approved this request.'
                : 'This will notify your agent that you have rejected this request.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-2">
            <p className="text-sm font-medium mb-2">Add a note (optional)</p>
            <Textarea 
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder={actionRequest?.action === 'approve' 
                ? "Any special instructions or preferences..."
                : "Reason for rejection..."
              }
              rows={3}
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setActionNotes("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleApproval(actionRequest!.action)}
              className={actionRequest?.action === 'approve' 
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
              }
            >
              {actionRequest?.action === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomTabs />
    </div>
  );
};

export default AthletePortal;
