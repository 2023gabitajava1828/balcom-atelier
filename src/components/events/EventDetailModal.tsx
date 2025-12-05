import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { 
  X, Calendar, MapPin, Users, Clock, Shirt, Lock, 
  CalendarPlus, CheckCircle, Share2
} from "lucide-react";
import { Link } from "react-router-dom";
import { TIER_LABELS, MembershipTier } from "@/hooks/useMembership";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  city: string;
  venue: string | null;
  capacity: number | null;
  min_tier: string | null;
  dress_code: string | null;
  image_url: string | null;
}

interface EventDetailModalProps {
  event: Event | null;
  open: boolean;
  onClose: () => void;
  isRsvped: boolean;
  isLocked: boolean;
  isLoggedIn: boolean;
  onRsvp: () => void;
}

export const EventDetailModal = ({ 
  event, 
  open, 
  onClose, 
  isRsvped, 
  isLocked, 
  isLoggedIn,
  onRsvp 
}: EventDetailModalProps) => {
  if (!event) return null;

  const eventDate = new Date(event.event_date);
  const endDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000); // Assume 3 hour event

  const formatDateForCalendar = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '');
  };

  const generateGoogleCalendarUrl = () => {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDateForCalendar(eventDate)}/${formatDateForCalendar(endDate)}`,
      details: event.description || '',
      location: event.venue ? `${event.venue}, ${event.city}` : event.city,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const generateOutlookCalendarUrl = () => {
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: event.title,
      startdt: eventDate.toISOString(),
      enddt: endDate.toISOString(),
      body: event.description || '',
      location: event.venue ? `${event.venue}, ${event.city}` : event.city,
    });
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  };

  const generateICSFile = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Balcom Privé//Events//EN
BEGIN:VEVENT
UID:${event.id}@balcomprive.com
DTSTAMP:${formatDateForCalendar(new Date())}
DTSTART:${formatDateForCalendar(eventDate)}
DTEND:${formatDateForCalendar(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description?.replace(/\n/g, '\\n') || ''}
LOCATION:${event.venue ? `${event.venue}, ${event.city}` : event.city}
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `Join me at ${event.title} on ${format(eventDate, 'MMMM d, yyyy')}`,
      url: window.location.href,
    };
    
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case "gold": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "platinum": return "bg-primary/20 text-primary border-primary/30";
      case "black": return "bg-foreground/20 text-foreground border-foreground/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border p-0">
        {/* Image Header */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Calendar className="w-20 h-20 text-primary/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          
          {/* Date badge */}
          <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-center shadow-lg">
            <div className="text-2xl font-bold leading-none">{format(eventDate, 'd')}</div>
            <div className="text-xs uppercase tracking-wider">{format(eventDate, 'MMM')}</div>
          </div>

          {/* Tier badge */}
          {event.min_tier && (
            <Badge className={`absolute top-4 right-4 ${getTierColor(event.min_tier)}`}>
              {TIER_LABELS[event.min_tier as MembershipTier]}+ Only
            </Badge>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
            style={{ right: event.min_tier ? '140px' : '16px' }}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                {event.title}
              </DialogTitle>
            </DialogHeader>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Date & Time</p>
                <p className="text-foreground font-medium">{format(eventDate, 'EEEE, MMMM d, yyyy')}</p>
                <p className="text-sm text-muted-foreground">{format(eventDate, 'h:mm a')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Location</p>
                <p className="text-foreground font-medium">{event.venue || event.city}</p>
                <p className="text-sm text-muted-foreground">{event.city}</p>
              </div>
            </div>

            {event.capacity && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Capacity</p>
                  <p className="text-foreground font-medium">Limited to {event.capacity} guests</p>
                </div>
              </div>
            )}

            {event.dress_code && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <Shirt className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Dress Code</p>
                  <p className="text-foreground font-medium">{event.dress_code}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">About This Event</h4>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </div>
          )}

          <Separator className="bg-border/50" />

          {/* RSVP Status */}
          {isRsvped && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-semibold text-green-500">You're Going!</p>
                <p className="text-sm text-muted-foreground">We'll send you a reminder before the event</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {isLoggedIn ? (
              isLocked ? (
                <Link to="/membership" className="flex-1">
                  <Button variant="outline" className="w-full gap-2">
                    <Lock className="w-4 h-4" />
                    Upgrade to {TIER_LABELS[event.min_tier as MembershipTier]}
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant={isRsvped ? "outline" : "default"} 
                  className="flex-1 gap-2"
                  onClick={onRsvp}
                >
                  {isRsvped ? (
                    <>Cancel RSVP</>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      RSVP Now
                    </>
                  )}
                </Button>
              )
            ) : (
              <Link to="/auth" className="flex-1">
                <Button variant="default" className="w-full">
                  Sign In to RSVP
                </Button>
              </Link>
            )}

            {/* Add to Calendar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarPlus className="w-4 h-4" />
                  Add to Calendar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <a href={generateGoogleCalendarUrl()} target="_blank" rel="noopener noreferrer">
                    Google Calendar
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={generateOutlookCalendarUrl()} target="_blank" rel="noopener noreferrer">
                    Outlook Calendar
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={generateICSFile}>
                  Apple Calendar (.ics)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Share */}
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
