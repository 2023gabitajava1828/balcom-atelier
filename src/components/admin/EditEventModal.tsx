import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Image as ImageIcon, X, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  venue: string | null;
  city: string;
  min_tier: string | null;
  capacity: number | null;
  dress_code: string | null;
  image_url: string | null;
  status: string | null;
}

interface EditEventModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditEventModal({ event, open, onOpenChange, onSuccess }: EditEventModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    event_time: "18:00",
    venue: "",
    city: "",
    min_tier: "none",
    capacity: "",
    dress_code: "Cocktail Attire",
    image_url: "",
  });

  // Populate form when event changes
  useEffect(() => {
    if (event) {
      const eventDate = new Date(event.event_date);
      setFormData({
        title: event.title || "",
        description: event.description || "",
        event_date: format(eventDate, "yyyy-MM-dd"),
        event_time: format(eventDate, "HH:mm"),
        venue: event.venue || "",
        city: event.city || "",
        min_tier: event.min_tier || "none",
        capacity: event.capacity?.toString() || "",
        dress_code: event.dress_code || "Cocktail Attire",
        image_url: event.image_url || "",
      });
    }
  }, [event]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    
    setIsLoading(true);

    try {
      const eventDateTime = new Date(`${formData.event_date}T${formData.event_time}:00`);
      
      const { error } = await supabase
        .from("events")
        .update({
          title: formData.title,
          description: formData.description || null,
          event_date: eventDateTime.toISOString(),
          venue: formData.venue || null,
          city: formData.city,
          min_tier: formData.min_tier === "none" ? null : formData.min_tier,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          dress_code: formData.dress_code || null,
          image_url: formData.image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", event.id);

      if (error) throw error;

      toast({
        title: "Event Updated",
        description: `"${formData.title}" has been updated successfully.`,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Edit Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Preview & Upload */}
          <div className="space-y-2">
            <Label>Event Image</Label>
            {formData.image_url ? (
              <div className="relative">
                <img 
                  src={formData.image_url} 
                  alt="Event preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => setFormData({ ...formData, image_url: "" })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
              </div>
            )}
            
            {/* Upload Button */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <Button type="button" variant="outline" className="w-full" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* URL Input */}
            <Input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="Or paste an image URL..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-title">Event Title *</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Monaco Grand Prix VIP Experience"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Exclusive VIP access including..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-event_date">Date *</Label>
              <Input
                id="edit-event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-event_time">Time</Label>
              <Input
                id="edit-event_time"
                type="time"
                value={formData.event_time}
                onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-venue">Venue</Label>
              <Input
                id="edit-venue"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="Circuit de Monaco"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city">City *</Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Monaco"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-min_tier">Minimum Tier</Label>
              <Select
                value={formData.min_tier}
                onValueChange={(value) => setFormData({ ...formData, min_tier: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All Members</SelectItem>
                  <SelectItem value="silver">Silver+</SelectItem>
                  <SelectItem value="gold">Gold+</SelectItem>
                  <SelectItem value="platinum">Platinum+</SelectItem>
                  <SelectItem value="black">Black Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Capacity</Label>
              <Input
                id="edit-capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-dress_code">Dress Code</Label>
            <Select
              value={formData.dress_code}
              onValueChange={(value) => setFormData({ ...formData, dress_code: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select dress code" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Black Tie">Black Tie</SelectItem>
                <SelectItem value="Cocktail Attire">Cocktail Attire</SelectItem>
                <SelectItem value="Resort Elegant">Resort Elegant</SelectItem>
                <SelectItem value="Smart Casual">Smart Casual</SelectItem>
                <SelectItem value="Business Casual">Business Casual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
