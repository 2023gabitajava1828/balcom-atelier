import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Search, 
  Calendar, 
  Heart, 
  ShoppingBag, 
  MessageSquare,
  Users,
  FileText,
  Bell,
  Inbox,
  LucideIcon
} from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
  children?: ReactNode;
}

// Luxury empty state illustration component
function EmptyIllustration({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
      
      {/* Middle ring */}
      <div className="absolute inset-3 rounded-full border border-primary/20" />
      
      {/* Inner circle with icon */}
      <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-card border border-border">
        <Icon className="h-10 w-10 text-primary/60" strokeWidth={1.5} />
      </div>
      
      {/* Decorative dots */}
      <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary/40" />
      <div className="absolute -bottom-2 -left-1 h-1.5 w-1.5 rounded-full bg-primary/30" />
    </div>
  );
}

export function EmptyState({
  icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-16 px-6",
      className
    )}>
      <EmptyIllustration icon={icon} className="mb-8" />
      
      <h3 className="text-h3 text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            action.href ? (
              <Button asChild>
                <Link to={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button onClick={action.onClick}>{action.label}</Button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Button variant="outline" asChild>
                <Link to={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
      
      {children}
    </div>
  );
}

// Preset empty states for common scenarios
export function NoPropertiesFound({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <EmptyState
      icon={Home}
      title="No Properties Found"
      description="We couldn't find any properties matching your criteria. Try adjusting your filters or explore all available listings."
      action={onClearFilters ? { label: "Clear Filters", onClick: onClearFilters } : undefined}
      secondaryAction={{ label: "View All Properties", href: "/real-estate" }}
    />
  );
}

export function NoSearchResults({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No Results Found"
      description={query 
        ? `We couldn't find anything matching "${query}". Try different keywords or browse our categories.`
        : "Try adjusting your search terms or browse our categories."
      }
      secondaryAction={{ label: "Browse Properties", href: "/real-estate" }}
    />
  );
}

export function NoSavedProperties() {
  return (
    <EmptyState
      icon={Heart}
      title="No Saved Properties"
      description="Properties you save will appear here. Start exploring our exclusive listings and save the ones that catch your eye."
      action={{ label: "Explore Properties", href: "/real-estate" }}
    />
  );
}

export function NoUpcomingEvents() {
  return (
    <EmptyState
      icon={Calendar}
      title="No Upcoming Events"
      description="There are no events scheduled at the moment. Check back soon for exclusive member gatherings and experiences."
    />
  );
}

export function NoRSVPs() {
  return (
    <EmptyState
      icon={Calendar}
      title="No RSVPs Yet"
      description="You haven't RSVP'd to any events yet. Explore upcoming events and secure your spot at exclusive gatherings."
      action={{ label: "Browse Events", href: "/events" }}
    />
  );
}

export function NoLuxuryItems() {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="No Items Available"
      description="Our luxury collection is being updated. Check back soon for exclusive pieces from the world's finest brands."
    />
  );
}

export function NoConciergeRequests() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No Requests Yet"
      description="Your concierge history will appear here. Start a conversation with our team to experience white-glove service."
      action={{ label: "New Request", href: "/concierge" }}
    />
  );
}

export function NoAthletes() {
  return (
    <EmptyState
      icon={Users}
      title="No Athletes in Roster"
      description="Start building your roster by adding athletes you represent. Manage their profiles and submit requests on their behalf."
      action={{ label: "Add Athlete", onClick: () => {} }}
    />
  );
}

export function NoDocuments() {
  return (
    <EmptyState
      icon={FileText}
      title="No Documents"
      description="Your documents and contracts will be stored here. Upload files or request documents from your concierge."
    />
  );
}

export function NoNotifications() {
  return (
    <EmptyState
      icon={Bell}
      title="All Caught Up"
      description="You have no new notifications. We'll let you know when something important happens."
    />
  );
}

export function GenericEmpty({ title, description }: { title?: string; description?: string }) {
  return (
    <EmptyState
      icon={Inbox}
      title={title || "Nothing Here Yet"}
      description={description || "This section is empty. Content will appear here once available."}
    />
  );
}
