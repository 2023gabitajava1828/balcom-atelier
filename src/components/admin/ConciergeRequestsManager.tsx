import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Search, Clock, AlertCircle, CheckCircle2, Loader2, Calendar, DollarSign, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ChatInterface } from "@/components/concierge/ChatInterface";
import { Separator } from "@/components/ui/separator";

interface Request {
  id: string;
  category: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  preferred_date: string | null;
  budget_min: number | null;
  budget_max: number | null;
  user_id: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
  unread_count?: number;
}

export const ConciergeRequestsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchRequests();

    // Set up realtime subscription
    const channel = supabase
      .channel("admin-requests")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "concierge_requests",
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let filtered = requests;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${req.profiles?.first_name} ${req.profiles?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [requests, statusFilter, searchTerm]);

  const fetchRequests = async () => {
    try {
      const { data: requestsData, error: requestsError } = await supabase
        .from("concierge_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch profiles separately
      const profileIds = requestsData?.map(r => r.user_id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .in("user_id", profileIds);

      // Merge profiles with requests
      const requestsWithProfiles = requestsData?.map(request => ({
        ...request,
        profiles: profilesData?.find(p => p.user_id === request.user_id)
      })) || [];

      // Fetch unread message counts
      const requestsWithUnread = await Promise.all(
        requestsWithProfiles.map(async (request) => {
          const { count } = await supabase
            .from("concierge_messages")
            .select("*", { count: "exact", head: true })
            .eq("request_id", request.id)
            .eq("is_read", false)
            .eq("sender_type", "user");

          return {
            ...request,
            unread_count: count || 0,
          };
        })
      );

      setRequests(requestsWithUnread as Request[]);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("concierge_requests")
        .update({ status: newStatus })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Request status changed to ${newStatus.replace("_", " ")}`,
      });

      fetchRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <Clock className="w-4 h-4" />;
      case "in_progress":
        return <AlertCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "submitted":
        return "secondary";
      case "in_progress":
        return "default";
      case "completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
        <p className="text-foreground/60">Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
            <Input
              placeholder="Search by title, description, or member name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Request List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">No Requests Found</h3>
            <p className="text-foreground/60">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "No concierge requests yet"}
            </p>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="p-6 hover:shadow-gold transition-elegant">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={getStatusVariant(request.status)} className="gap-1">
                      {getStatusIcon(request.status)}
                      {request.status.replace("_", " ")}
                    </Badge>
                    {request.unread_count && request.unread_count > 0 && (
                      <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-xs">
                        {request.unread_count} unread
                      </Badge>
                    )}
                    <span className="text-sm text-foreground/60">
                      {request.profiles?.first_name} {request.profiles?.last_name}
                    </span>
                    <span className="text-xs text-foreground/60">
                      {format(new Date(request.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{request.title}</h3>
                  {request.description && (
                    <p className="text-sm text-foreground/70 mb-2 line-clamp-2">
                      {request.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-foreground/60 mt-2">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {request.category.replace("_", " ")}
                    </span>
                    {request.preferred_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(request.preferred_date), "MMM d")}
                      </span>
                    )}
                    {(request.budget_min || request.budget_max) && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {request.budget_min && `$${request.budget_min.toLocaleString()}`}
                        {request.budget_min && request.budget_max && " - "}
                        {request.budget_max && `$${request.budget_max.toLocaleString()}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Select
                  value={request.status}
                  onValueChange={(value) => updateRequestStatus(request.id, value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setSelectedRequest(request);
                    setDialogOpen(true);
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                  View Chat
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Chat Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          {selectedRequest && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Request Details */}
              <div>
                <DialogHeader>
                  <DialogTitle>Request Details</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[600px] pr-4 mt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{selectedRequest.title}</h3>
                      <Badge variant={getStatusVariant(selectedRequest.status)}>
                        {selectedRequest.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Tag className="h-4 w-4 text-foreground/60" />
                        <span className="capitalize">{selectedRequest.category.replace("_", " ")}</span>
                      </div>

                      {selectedRequest.preferred_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-foreground/60" />
                          <span>{format(new Date(selectedRequest.preferred_date), "PPP")}</span>
                        </div>
                      )}

                      {(selectedRequest.budget_min || selectedRequest.budget_max) && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-foreground/60" />
                          <span>
                            {selectedRequest.budget_min && `$${selectedRequest.budget_min.toLocaleString()}`}
                            {selectedRequest.budget_min && selectedRequest.budget_max && " - "}
                            {selectedRequest.budget_max && `$${selectedRequest.budget_max.toLocaleString()}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedRequest.description && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">Description</h4>
                          <p className="text-sm text-foreground/70 whitespace-pre-wrap">
                            {selectedRequest.description}
                          </p>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div className="text-xs text-foreground/50">
                      Member: {selectedRequest.profiles?.first_name} {selectedRequest.profiles?.last_name}
                      <br />
                      Submitted: {format(new Date(selectedRequest.created_at), "PPP")}
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* Chat Interface */}
              <div>
                <DialogHeader>
                  <DialogTitle>Conversation</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <ChatInterface
                    requestId={selectedRequest.id}
                    requestTitle={selectedRequest.title}
                    requestStatus={selectedRequest.status}
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
