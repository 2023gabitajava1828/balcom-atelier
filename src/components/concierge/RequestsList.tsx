import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";
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
}

export const RequestsList = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from("concierge_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setRequests(data);
      }
      setLoading(false);
    };

    fetchRequests();

    // Set up realtime subscription
    const channel = supabase
      .channel("user-requests")
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

    return () => {
      supabase.removeChannel(channel);
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
                <span className="text-xs text-foreground/60">
                  {format(new Date(request.created_at), "MMM d, yyyy")}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-1">{request.title}</h3>
              {request.description && (
                <p className="text-sm text-foreground/70 mb-2">{request.description}</p>
              )}
              {request.preferred_date && (
                <p className="text-xs text-foreground/60">
                  Preferred: {format(new Date(request.preferred_date), "PPP")}
                </p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            View Messages
          </Button>
        </Card>
      ))}
    </div>
  );
};
