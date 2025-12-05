import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, User, Plane, ShoppingBag, Home, Calendar, Car, Utensils, Sparkles } from "lucide-react";

interface Athlete {
  id: string;
  first_name: string;
  last_name: string;
  sport: string;
  team: string | null;
  avatar_url: string | null;
}

interface AthleteRequestFormProps {
  athletes: Athlete[];
  selectedAthlete: Athlete | null;
  onRequestSubmitted: () => void;
}

const categories = [
  { value: "travel", label: "Travel & Logistics", icon: Plane, description: "Private jets, hotels, transportation" },
  { value: "shopping", label: "Personal Shopping", icon: ShoppingBag, description: "Fashion, jewelry, luxury items" },
  { value: "real-estate", label: "Real Estate", icon: Home, description: "Property search, rentals, purchases" },
  { value: "events", label: "Events & Entertainment", icon: Calendar, description: "VIP access, tickets, experiences" },
  { value: "automotive", label: "Automotive", icon: Car, description: "Vehicle acquisition, customization" },
  { value: "dining", label: "Dining & Hospitality", icon: Utensils, description: "Reservations, private chefs" },
  { value: "other", label: "Other Services", icon: Sparkles, description: "Custom requests" }
];

const priorities = [
  { value: "low", label: "Low", description: "Within 2 weeks" },
  { value: "normal", label: "Normal", description: "Within 1 week" },
  { value: "high", label: "High", description: "Within 48 hours" },
  { value: "urgent", label: "Urgent", description: "Same day" }
];

const AthleteRequestForm = ({ athletes, selectedAthlete, onRequestSubmitted }: AthleteRequestFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    athlete_id: selectedAthlete?.id || "",
    category: "",
    title: "",
    description: "",
    preferred_date: "",
    budget_min: "",
    budget_max: "",
    priority: "normal"
  });

  // Update athlete_id when selectedAthlete changes
  useState(() => {
    if (selectedAthlete) {
      setForm(prev => ({ ...prev, athlete_id: selectedAthlete.id }));
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!form.athlete_id || !form.category || !form.title) {
      toast({
        title: "Missing Information",
        description: "Please select an athlete and fill in the required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("athlete_requests").insert({
      athlete_id: form.athlete_id,
      agent_id: user.id,
      category: form.category,
      title: form.title,
      description: form.description || null,
      preferred_date: form.preferred_date || null,
      budget_min: form.budget_min ? parseFloat(form.budget_min) : null,
      budget_max: form.budget_max ? parseFloat(form.budget_max) : null,
      priority: form.priority
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } else {
      setForm({
        athlete_id: "",
        category: "",
        title: "",
        description: "",
        preferred_date: "",
        budget_min: "",
        budget_max: "",
        priority: "normal"
      });
      onRequestSubmitted();
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const currentAthlete = athletes.find(a => a.id === form.athlete_id);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Request Form */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Submit Concierge Request</CardTitle>
          <CardDescription>
            Create a request on behalf of your athlete. Our concierge team will handle everything.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Athlete Selection */}
            <div className="space-y-2">
              <Label>Select Athlete *</Label>
              <Select 
                value={form.athlete_id} 
                onValueChange={(v) => setForm({ ...form, athlete_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an athlete" />
                </SelectTrigger>
                <SelectContent>
                  {athletes.map(athlete => (
                    <SelectItem key={athlete.id} value={athlete.id}>
                      <div className="flex items-center gap-2">
                        <span>{athlete.first_name} {athlete.last_name}</span>
                        <span className="text-muted-foreground">• {athlete.sport}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = form.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat.value })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected 
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Icon className={`h-5 w-5 mb-1 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="text-sm font-medium">{cat.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Request Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Private jet to Miami for game weekend"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Details</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Provide any specific requirements, preferences, or details..."
                rows={4}
              />
            </div>

            {/* Date & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferred_date">Preferred Date</Label>
                <Input
                  id="preferred_date"
                  type="datetime-local"
                  value={form.preferred_date}
                  onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex flex-col">
                          <span>{p.label}</span>
                          <span className="text-xs text-muted-foreground">{p.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget_min">Budget Min ($)</Label>
                <Input
                  id="budget_min"
                  type="number"
                  value={form.budget_min}
                  onChange={(e) => setForm({ ...form, budget_min: e.target.value })}
                  placeholder="5,000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_max">Budget Max ($)</Label>
                <Input
                  id="budget_max"
                  type="number"
                  value={form.budget_max}
                  onChange={(e) => setForm({ ...form, budget_max: e.target.value })}
                  placeholder="25,000"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit Request
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Selected Athlete Preview */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selected Athlete</CardTitle>
          </CardHeader>
          <CardContent>
            {currentAthlete ? (
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={currentAthlete.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {getInitials(currentAthlete.first_name, currentAthlete.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {currentAthlete.first_name} {currentAthlete.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{currentAthlete.sport}</p>
                  {currentAthlete.team && (
                    <p className="text-sm text-muted-foreground">{currentAthlete.team}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="p-3 bg-muted rounded-full mb-3">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Select an athlete from the dropdown or roster tab
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <h4 className="font-medium text-primary mb-2">Pro Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Be specific about dates and locations</li>
              <li>• Include any dietary restrictions or preferences</li>
              <li>• Mention VIP or privacy requirements</li>
              <li>• Set realistic budget ranges for faster matching</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AthleteRequestForm;
