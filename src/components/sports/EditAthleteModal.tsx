import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Athlete {
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

interface EditAthleteModalProps {
  athlete: Athlete;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const sports = [
  "Football", "Basketball", "Baseball", "Soccer", "Hockey", 
  "Golf", "Tennis", "Boxing", "MMA", "Track & Field", "Swimming", "Other"
];

const EditAthleteModal = ({ athlete, open, onOpenChange, onSuccess }: EditAthleteModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    sport: "",
    team: "",
    position: "",
    email: "",
    phone: "",
    contract_end: "",
    status: "active",
    notes: ""
  });

  useEffect(() => {
    if (athlete) {
      setForm({
        first_name: athlete.first_name,
        last_name: athlete.last_name,
        sport: athlete.sport,
        team: athlete.team || "",
        position: athlete.position || "",
        email: athlete.email || "",
        phone: athlete.phone || "",
        contract_end: athlete.contract_end || "",
        status: athlete.status,
        notes: athlete.notes || ""
      });
    }
  }, [athlete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.first_name || !form.last_name || !form.sport) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("athletes")
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        sport: form.sport,
        team: form.team || null,
        position: form.position || null,
        email: form.email || null,
        phone: form.phone || null,
        contract_end: form.contract_end || null,
        status: form.status,
        notes: form.notes || null
      })
      .eq("id", athlete.id);

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update athlete. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Athlete Updated",
        description: "The athlete information has been saved."
      });
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Athlete</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sport">Sport *</Label>
              <Select value={form.sport} onValueChange={(v) => setForm({ ...form, sport: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  {sports.map(sport => (
                    <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="team">Team</Label>
            <Input
              id="team"
              value={form.team}
              onChange={(e) => setForm({ ...form, team: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contract_end">Contract Ends</Label>
              <Input
                id="contract_end"
                type="date"
                value={form.contract_end}
                onChange={(e) => setForm({ ...form, contract_end: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAthleteModal;
