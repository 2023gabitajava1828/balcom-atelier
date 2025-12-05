import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Calendar,
  DollarSign,
  ArrowRight,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActivityCardSkeleton, SkeletonGrid } from "@/components/ui/skeletons";

interface AthleteRequest {
  id: string;
  athlete_id: string;
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
  athletes?: {
    first_name: string;
    last_name: string;
    sport: string;
  };
}

const approvalConfig = {
  pending: { label: "Awaiting Athlete", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  approved: { label: "Athlete Approved", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  rejected: { label: "Athlete Rejected", className: "bg-red-500/10 text-red-600 border-red-500/20" }
};

const statusConfig = {
  submitted: { label: "Submitted", icon: Clock, className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  in_progress: { label: "In Progress", icon: AlertCircle, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  completed: { label: "Completed", icon: CheckCircle, className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-red-500/10 text-red-600 border-red-500/20" }
};

const priorityConfig = {
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
  normal: { label: "Normal", className: "bg-blue-500/10 text-blue-600" },
  high: { label: "High", className: "bg-amber-500/10 text-amber-600" },
  urgent: { label: "Urgent", className: "bg-red-500/10 text-red-600" }
};

const categoryLabels: Record<string, string> = {
  travel: "Travel",
  shopping: "Shopping",
  "real-estate": "Real Estate",
  events: "Events",
  automotive: "Automotive",
  dining: "Dining",
  other: "Other"
};

const AgentActivityDashboard = () => {
  const [requests, setRequests] = useState<AthleteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("athlete_requests")
      .select(`
        *,
        athletes (
          first_name,
          last_name,
          sport
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRequests(data as AthleteRequest[]);
    }
    setLoading(false);
  };

  const filteredRequests = requests.filter(req => {
    if (filter === "all") return true;
    return req.status === filter;
  });

  const activeRequests = requests.filter(r => r.status === "submitted" || r.status === "in_progress");
  const completedRequests = requests.filter(r => r.status === "completed");

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Request Activity</h3>
        </div>
        <SkeletonGrid count={4} Component={ActivityCardSkeleton} className="grid-cols-1" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Request Activity</h3>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="active">Active ({activeRequests.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          {filteredRequests.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No requests yet. Submit your first request for an athlete.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const status = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.submitted;
                const priority = priorityConfig[request.priority as keyof typeof priorityConfig] || priorityConfig.normal;
                const StatusIcon = status.icon;

                return (
                  <Card key={request.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Status indicator */}
                        <div className={`p-2 rounded-lg self-start ${status.className.replace('text-', 'bg-').split(' ')[0]}/20`}>
                          <StatusIcon className={`h-5 w-5 ${status.className.split(' ')[1]}`} />
                        </div>

                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate">{request.title}</h4>
                            <Badge variant="outline" className={status.className}>
                              {status.label}
                            </Badge>
                            {request.athlete_approval && (
                              <Badge variant="outline" className={approvalConfig[request.athlete_approval as keyof typeof approvalConfig]?.className}>
                                {approvalConfig[request.athlete_approval as keyof typeof approvalConfig]?.label}
                              </Badge>
                            )}
                            <Badge variant="outline" className={priority.className}>
                              {priority.label}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            {request.athletes && (
                              <span>
                                {request.athletes.first_name} {request.athletes.last_name}
                              </span>
                            )}
                            <span>•</span>
                            <span>{categoryLabels[request.category] || request.category}</span>
                            
                            {request.preferred_date && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(request.preferred_date), "MMM d, yyyy")}
                                </span>
                              </>
                            )}
                            
                            {(request.budget_min || request.budget_max) && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {request.budget_min && request.budget_max
                                    ? `$${request.budget_min.toLocaleString()} - $${request.budget_max.toLocaleString()}`
                                    : request.budget_max 
                                      ? `Up to $${request.budget_max.toLocaleString()}`
                                      : `From $${request.budget_min?.toLocaleString()}`
                                  }
                                </span>
                              </>
                            )}
                          </div>

                          {request.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {request.description}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-start md:self-center">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(request.created_at), "MMM d")}
                          </span>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          {activeRequests.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No active requests. All caught up!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeRequests.map((request) => {
                const status = statusConfig[request.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;

                return (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${status.className.replace('text-', 'bg-').split(' ')[0]}/20`}>
                          <StatusIcon className={`h-4 w-4 ${status.className.split(' ')[1]}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{request.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {request.athletes?.first_name} {request.athletes?.last_name}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {categoryLabels[request.category]}
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

        <TabsContent value="completed">
          {completedRequests.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No completed requests yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {completedRequests.map((request) => (
                <Card key={request.id} className="bg-emerald-500/5 border-emerald-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <div className="flex-1">
                        <h4 className="font-medium">{request.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {request.athletes?.first_name} {request.athletes?.last_name} • Completed {format(new Date(request.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentActivityDashboard;
