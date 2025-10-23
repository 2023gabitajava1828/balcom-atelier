import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface Request {
  id: string;
  category: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  preferred_date: string | null;
  unread_count?: number;
}

export const RequestsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      try {
        const { data: requestsData, error: requestsError } = await supabase
          .from("concierge_requests")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (requestsError) throw requestsError;

        // Fetch unread message counts for each request
        const requestsWithUnread = await Promise.all(
          (requestsData || []).map(async (request) => {
            const { count } = await supabase
              .from('concierge_messages')
              .select('*', { count: 'exact', head: true })
              .eq('request_id', request.id)
              .eq('is_read', false)
              .neq('sender_id', user.id);

            return {
              ...request,
              unread_count: count || 0
            };
          })
        );

        setRequests(requestsWithUnread);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    // Set up realtime subscriptions
    const requestsChannel = supabase
      .channel("user-requests-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "concierge_requests",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel("concierge-messages-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "concierge_messages",
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user]);

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
        <p className="text-foreground/60">Loading your requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="p-12 text-center">
        <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
        <h3 className="font-semibold text-lg mb-2">No Requests Yet</h3>
        <p className="text-foreground/60">Submit your first request to get started</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-bold mb-6">Your Requests</h2>
      {requests.map((request) => (
        <Card key={request.id} className="p-6 hover:shadow-gold transition-elegant">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant={getStatusVariant(request.status)} className="gap-1">
                  {getStatusIcon(request.status)}
                  {request.status.replace("_", " ")}
                </Badge>
                {request.unread_count && request.unread_count > 0 && (
                  <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-xs">
                    {request.unread_count} new
                  </Badge>
                )}
                <span className="text-xs text-foreground/60">
                  {format(new Date(request.created_at), "MMM d, yyyy")}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-1">{request.title}</h3>
              {request.description && (
                <p className="text-sm text-foreground/70 mb-2 line-clamp-2">{request.description}</p>
              )}
              {request.preferred_date && (
                <p className="text-xs text-foreground/60">
                  Preferred: {format(new Date(request.preferred_date), "PPP")}
                </p>
              )}
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => navigate(`/concierge/request/${request.id}`)}
          >
            <MessageSquare className="w-4 h-4" />
            {request.unread_count && request.unread_count > 0 ? 'View New Messages' : 'View Chat'}
          </Button>
        </Card>
      ))}
    </div>
  );
};
