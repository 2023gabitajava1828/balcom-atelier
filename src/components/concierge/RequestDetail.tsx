import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, DollarSign, Tag, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ChatInterface } from "./ChatInterface";
import { format } from "date-fns";

interface Request {
  id: string;
  category: string;
  title: string;
  description: string;
  status: string;
  preferred_date: string | null;
  budget_min: number | null;
  budget_max: number | null;
  created_at: string;
}

export const RequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRequest();
    }
  }, [id]);

  const fetchRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('concierge_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setRequest(data);
    } catch (error) {
      console.error('Error fetching request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Request Not Found</h2>
          <Button onClick={() => navigate('/concierge')} variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Concierge
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'submitted': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <Button
          onClick={() => navigate('/concierge')}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Requests
        </Button>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Request Details */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="font-serif text-3xl font-bold">{request.title}</h1>
              <Badge variant={getStatusVariant(request.status)}>
                {request.status}
              </Badge>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-foreground/70">
                <Tag className="h-4 w-4" />
                <span className="text-sm capitalize">{request.category.replace('_', ' ')}</span>
              </div>

              {request.preferred_date && (
                <div className="flex items-center gap-2 text-foreground/70">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {format(new Date(request.preferred_date), 'PPP')}
                  </span>
                </div>
              )}

              {(request.budget_min || request.budget_max) && (
                <div className="flex items-center gap-2 text-foreground/70">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">
                    {request.budget_min && `$${request.budget_min.toLocaleString()}`}
                    {request.budget_min && request.budget_max && ' - '}
                    {request.budget_max && `$${request.budget_max.toLocaleString()}`}
                    {!request.budget_min && request.budget_max && `Up to $${request.budget_max.toLocaleString()}`}
                  </span>
                </div>
              )}
            </div>

            {request.description && (
              <>
                <Separator className="my-4" />
                <div>
                  <h3 className="font-semibold mb-2">Details</h3>
                  <p className="text-sm text-foreground/70 whitespace-pre-wrap">
                    {request.description}
                  </p>
                </div>
              </>
            )}

            <Separator className="my-4" />

            <div className="text-xs text-foreground/50">
              Request submitted {format(new Date(request.created_at), 'PPP')}
            </div>
          </Card>

          {/* Chat Interface */}
          <ChatInterface
            requestId={request.id}
            requestTitle={request.title}
            requestStatus={request.status}
          />
        </div>
      </div>
    </div>
  );
};
