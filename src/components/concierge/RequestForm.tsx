import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Lock, Crown, Sparkles, Diamond } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMembership, MembershipTier, TIER_LABELS } from "@/hooks/useMembership";

interface Category {
  value: string;
  label: string;
  description: string;
  minTier: MembershipTier;
}

const categories: Category[] = [
  { 
    value: "travel", 
    label: "Travel & Transportation", 
    description: "Airport transfers, private jets, luxury car rentals",
    minTier: "silver" 
  },
  { 
    value: "dining", 
    label: "Fine Dining & Reservations", 
    description: "Michelin restaurants, private chefs, wine tastings",
    minTier: "silver" 
  },
  { 
    value: "events", 
    label: "Event Planning & Access", 
    description: "VIP access, private events, exclusive tickets",
    minTier: "gold" 
  },
  { 
    value: "shopping", 
    label: "Personal Shopping", 
    description: "Luxury goods, private showings, style curation",
    minTier: "gold" 
  },
  { 
    value: "lifestyle", 
    label: "Lifestyle Services", 
    description: "Property management, household staff, wellness",
    minTier: "platinum" 
  },
  { 
    value: "investment", 
    label: "Investment Advisory", 
    description: "Off-market properties, wealth management intros",
    minTier: "platinum" 
  },
  { 
    value: "other", 
    label: "Other Request", 
    description: "Any special request not listed above",
    minTier: "silver" 
  },
];

const tierIcons: Record<MembershipTier, React.ReactNode> = {
  silver: null,
  gold: <Crown className="w-3.5 h-3.5" />,
  platinum: <Sparkles className="w-3.5 h-3.5" />,
  black: <Diamond className="w-3.5 h-3.5" />,
};

export const RequestForm = () => {
  const { user } = useAuth();
  const { tier, canAccessTier, loading: membershipLoading } = useMembership();
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

  const handleCategorySelect = (value: string) => {
    const category = categories.find(c => c.value === value);
    if (category && !canAccessTier(category.minTier)) {
      toast({
        title: `${TIER_LABELS[category.minTier]} Required`,
        description: `Upgrade to ${TIER_LABELS[category.minTier]} to access ${category.label}`,
      });
      return;
    }
    setFormData({ ...formData, category: value });
  };

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

    // Double-check tier access
    const category = categories.find(c => c.value === formData.category);
    if (category && !canAccessTier(category.minTier)) {
      toast({
        title: "Upgrade Required",
        description: `This service requires ${TIER_LABELS[category.minTier]} membership`,
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-3xl font-bold">New Service Request</h2>
        <Badge 
          variant="outline" 
          className="capitalize border-primary/30 text-primary"
        >
          {tier} Member
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="category">Service Category *</Label>
          <Select
            value={formData.category}
            onValueChange={handleCategorySelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {categories.map((cat) => {
                const isLocked = !canAccessTier(cat.minTier);
                return (
                  <SelectItem 
                    key={cat.value} 
                    value={cat.value}
                    disabled={isLocked}
                    className={isLocked ? "opacity-60" : ""}
                  >
                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span>{cat.label}</span>
                          {isLocked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                          {cat.minTier !== "silver" && (
                            <span className={`text-xs ${cat.minTier === "gold" ? "text-yellow-500" : "text-primary"}`}>
                              {tierIcons[cat.minTier]}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {cat.description}
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          {/* Upgrade prompt for locked categories */}
          {tier === "silver" && (
            <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                <Crown className="w-4 h-4 inline mr-1 text-primary" />
                Upgrade to <span className="text-primary font-medium">Gold</span> or{" "}
                <span className="text-primary font-medium">Platinum</span> to unlock premium services
              </p>
              <Link to="/membership">
                <Button variant="link" size="sm" className="px-0 h-auto mt-1 text-primary">
                  View Membership Options →
                </Button>
              </Link>
            </div>
          )}
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

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading || membershipLoading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Request
        </Button>
      </form>
    </Card>
  );
};
