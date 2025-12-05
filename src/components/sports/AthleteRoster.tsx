import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Phone, 
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  UserX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EditAthleteModal from "./EditAthleteModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface AthleteRosterProps {
  athletes: Athlete[];
  onRefresh: () => void;
  onSelectAthlete: (athlete: Athlete) => void;
  selectedAthlete: Athlete | null;
}

const statusConfig = {
  active: { label: "Active", icon: CheckCircle, className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  inactive: { label: "Inactive", icon: UserX, className: "bg-muted text-muted-foreground border-muted" },
  prospect: { label: "Prospect", icon: Clock, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" }
};

const AthleteRoster = ({ athletes, onRefresh, onSelectAthlete, selectedAthlete }: AthleteRosterProps) => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [deletingAthlete, setDeletingAthlete] = useState<Athlete | null>(null);

  const filteredAthletes = athletes.filter(athlete => {
    const searchLower = search.toLowerCase();
    return (
      athlete.first_name.toLowerCase().includes(searchLower) ||
      athlete.last_name.toLowerCase().includes(searchLower) ||
      athlete.sport.toLowerCase().includes(searchLower) ||
      (athlete.team?.toLowerCase().includes(searchLower))
    );
  });

  const handleDelete = async () => {
    if (!deletingAthlete) return;

    const { error } = await supabase
      .from("athletes")
      .delete()
      .eq("id", deletingAthlete.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove athlete.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Athlete Removed",
        description: `${deletingAthlete.first_name} ${deletingAthlete.last_name} has been removed.`
      });
      onRefresh();
    }
    setDeletingAthlete(null);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatContractEnd = (date: string | null) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const monthsLeft = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (monthsLeft < 0) return { text: "Expired", urgent: true };
    if (monthsLeft <= 6) return { text: `${monthsLeft}mo left`, urgent: true };
    return { text: d.toLocaleDateString("en-US", { month: "short", year: "numeric" }), urgent: false };
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search athletes by name, sport, or team..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Athletes Grid */}
      {filteredAthletes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {search ? "No athletes match your search." : "No athletes yet. Add your first athlete to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAthletes.map((athlete) => {
            const status = statusConfig[athlete.status as keyof typeof statusConfig] || statusConfig.active;
            const StatusIcon = status.icon;
            const contractInfo = formatContractEnd(athlete.contract_end);
            const isSelected = selectedAthlete?.id === athlete.id;

            return (
              <Card 
                key={athlete.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? "ring-2 ring-primary border-primary" : ""
                }`}
                onClick={() => onSelectAthlete(athlete)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                      <AvatarImage src={athlete.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(athlete.first_name, athlete.last_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground truncate">
                            {athlete.first_name} {athlete.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {athlete.sport} {athlete.position && `• ${athlete.position}`}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setEditingAthlete(athlete);
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingAthlete(athlete);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {athlete.team && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {athlete.team}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge variant="outline" className={status.className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                        
                        {contractInfo && (
                          <Badge 
                            variant="outline" 
                            className={contractInfo.urgent 
                              ? "bg-red-500/10 text-red-600 border-red-500/20" 
                              : "bg-muted text-muted-foreground"
                            }
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            {contractInfo.text}
                          </Badge>
                        )}
                      </div>

                      {(athlete.email || athlete.phone) && (
                        <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
                          {athlete.email && (
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{athlete.email}</span>
                            </span>
                          )}
                          {athlete.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {athlete.phone}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingAthlete && (
        <EditAthleteModal
          athlete={editingAthlete}
          open={!!editingAthlete}
          onOpenChange={(open) => !open && setEditingAthlete(null)}
          onSuccess={() => {
            onRefresh();
            setEditingAthlete(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingAthlete} onOpenChange={(open) => !open && setDeletingAthlete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Athlete?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deletingAthlete?.first_name} {deletingAthlete?.last_name} and all their request history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AthleteRoster;
