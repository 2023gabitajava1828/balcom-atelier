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
import { CalendarIcon, Loader2, Lock, Crown, Sparkles, Diamond, Plane, UtensilsCrossed, Car, Ticket, Home, Heart, Sparkle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMembership, MembershipTier, TIER_LABELS } from "@/hooks/useMembership";

interface Category {
  value: string;
  label: string;
  icon: React.ElementType;
  headline: string;
  description: string;
  minTier: MembershipTier;
}

const categories: Category[] = [
  { 
    value: "travel", 
    label: "Travel",
    icon: Plane,
    headline: "Seamless Travel Arrangements",
    description: "Private jets, first-class bookings, airport transfers, and custom itineraries",
    minTier: "silver" 
  },
  { 
    value: "dining", 
    label: "Dining",
    icon: UtensilsCrossed,
    headline: "Exclusive Culinary Experiences", 
    description: "Michelin reservations, private chefs, chef's tables, and wine tastings",
    minTier: "silver" 
  },
  { 
    value: "chauffeur", 
    label: "Chauffeur",
    icon: Car,
    headline: "Premium Ground Transportation",
    description: "24/7 luxury vehicles, professional chauffeurs, airport meet & greet",
    minTier: "silver" 
  },
  { 
    value: "events", 
    label: "Events & Tickets",
    icon: Ticket,
    headline: "VIP Access & Exclusive Events", 
    description: "Courtside seats, concert VIP, fashion week, art fairs, and galas",
    minTier: "gold" 
  },
  { 
    value: "housing", 
    label: "Housing / Relocation",
    icon: Home,
    headline: "Luxury Real Estate & Relocation",
    description: "Property sourcing, off-market listings, furnished rentals, move coordination",
    minTier: "gold" 
  },
  { 
    value: "wellness", 
    label: "Wellness",
    icon: Heart,
    headline: "Health & Wellness Concierge",
    description: "Luxury spa, personal trainers, in-home massage, wellness retreats",
    minTier: "platinum" 
  },
  { 
    value: "other", 
    label: "Other",
    icon: Sparkle,
    headline: "Bespoke Requests",
    description: "Personalized gifts, hard-to-find items, special occasions, anything else",
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

  const selectedCategory = categories.find(c => c.value === formData.category);

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
    <Card className="p-6 md:p-8 max-w-2xl mx-auto bg-card border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl md:text-3xl font-bold">New Service Request</h2>
        <Badge className={`capitalize ${tier === "silver" ? "tier-silver" : tier === "gold" ? "tier-gold" : tier === "platinum" ? "tier-platinum" : "tier-black"}`}>
          {tier}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div>
          <Label className="text-muted-foreground">Service Category *</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
            {categories.map((cat) => {
              const isLocked = !canAccessTier(cat.minTier);
              const isSelected = formData.category === cat.value;
              
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategorySelect(cat.value)}
                  disabled={isLocked}
                  className={`relative p-4 rounded-lg border text-left transition-all ${
                    isSelected 
                      ? "border-primary bg-primary/10" 
                      : isLocked 
                        ? "border-border/30 opacity-50 cursor-not-allowed" 
                        : "border-border/50 hover:border-primary/50 hover:bg-card-hover"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <cat.icon className={`w-4 h-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`font-medium text-sm ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                      {cat.label}
                    </span>
                  </div>
                  {isLocked && (
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    </div>
                  )}
                  {cat.minTier !== "silver" && !isLocked && (
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs ${cat.minTier === "gold" ? "text-yellow-500" : "text-primary"}`}>
                        {tierIcons[cat.minTier]}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Selected category info */}
          {selectedCategory && (
            <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-semibold text-foreground mb-1">{selectedCategory.headline}</h4>
              <p className="text-sm text-muted-foreground">{selectedCategory.description}</p>
            </div>
          )}
          
          {/* Upgrade prompt for locked categories */}
          {tier === "silver" && (
            <div className="mt-4 p-3 rounded-lg bg-secondary border border-border/50">
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
          <Label htmlFor="title" className="text-muted-foreground">Request Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Book dinner at Atlas for anniversary"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-2 bg-input border-border/50"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-muted-foreground">Special Requests</Label>
          <Textarea
            id="description"
            placeholder="Any special requests or preferences..."
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-2 bg-input border-border/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal mt-2 bg-input border-border/50">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.preferred_date ? format(formData.preferred_date, "PPP") : "Select date"}
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
          
          <div>
            <Label htmlFor="budget_max" className="text-muted-foreground">Budget (Optional)</Label>
            <Input
              id="budget_max"
              type="number"
              placeholder="Max budget"
              value={formData.budget_max}
              onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
              className="mt-2 bg-input border-border/50"
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
