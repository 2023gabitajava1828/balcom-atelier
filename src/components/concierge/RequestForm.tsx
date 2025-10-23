import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const categories = [
  { value: "travel", label: "Travel & Transportation" },
  { value: "dining", label: "Fine Dining & Reservations" },
  { value: "events", label: "Event Planning & Access" },
  { value: "shopping", label: "Personal Shopping" },
  { value: "lifestyle", label: "Lifestyle Services" },
  { value: "other", label: "Other Request" },
];

export const RequestForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    preferred_date: undefined as Date | undefined,
    budget_min: "",
    budget_max: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a request",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!formData.category || !formData.title) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("concierge_requests").insert({
      user_id: user.id,
      category: formData.category,
      title: formData.title,
      description: formData.description || null,
      preferred_date: formData.preferred_date?.toISOString() || null,
      budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
      budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
      status: "submitted",
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Request Submitted",
      description: "Your concierge will be in touch shortly",
    });

    // Reset form
    setFormData({
      category: "",
      title: "",
      description: "",
      preferred_date: undefined,
      budget_min: "",
      budget_max: "",
    });
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <h2 className="font-serif text-3xl font-bold mb-6">New Service Request</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="category">Service Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="title">Request Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Book dinner at Michelin-starred restaurant"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="description">Details</Label>
          <Textarea
            id="description"
            placeholder="Provide any additional details, preferences, or special requirements..."
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <Label>Preferred Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.preferred_date ? format(formData.preferred_date, "PPP") : "Select a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.preferred_date}
                onSelect={(date) => setFormData({ ...formData, preferred_date: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="budget_min">Min Budget (Optional)</Label>
            <Input
              id="budget_min"
              type="number"
              placeholder="0"
              value={formData.budget_min}
              onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="budget_max">Max Budget (Optional)</Label>
            <Input
              id="budget_max"
              type="number"
              placeholder="No limit"
              value={formData.budget_max}
              onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
            />
          </div>
        </div>

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Request
        </Button>
      </form>
    </Card>
  );
};
