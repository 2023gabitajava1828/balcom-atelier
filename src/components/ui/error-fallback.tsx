import { AlertCircle, RefreshCw, Home, ArrowLeft, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";

interface ErrorFallbackProps {
  error?: Error | string;
  title?: string;
  description?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  variant?: "default" | "network" | "notfound" | "inline";
  className?: string;
}

export function ErrorFallback({
  error,
  title,
  description,
  onRetry,
  showHomeButton = true,
  showBackButton = false,
  variant = "default",
  className,
}: ErrorFallbackProps) {
  const navigate = useNavigate();
  
  const errorMessage = typeof error === "string" ? error : error?.message;
  
  // Determine icon and default messaging based on variant
  const config = {
    default: {
      icon: AlertCircle,
      title: title || "Something went wrong",
      description: description || "We encountered an unexpected error. Please try again.",
    },
    network: {
      icon: WifiOff,
      title: title || "Connection Error",
      description: description || "Unable to connect to our servers. Please check your internet connection and try again.",
    },
    notfound: {
      icon: AlertCircle,
      title: title || "Not Found",
      description: description || "The content you're looking for doesn't exist or has been moved.",
    },
    inline: {
      icon: AlertCircle,
      title: title || "Failed to load",
      description: description || "Unable to load this content.",
    },
  };
  
  const { icon: Icon, title: defaultTitle, description: defaultDescription } = config[variant];
  
  // Inline variant for smaller error states within cards/sections
  if (variant === "inline") {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center py-8 px-4 text-center",
        className
      )}>
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-destructive" />
        </div>
        <p className="text-sm text-muted-foreground mb-4">{defaultDescription}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[50vh] py-16 px-6 text-center",
      className
    )}>
      {/* Error illustration */}
      <div className="relative mb-8">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-destructive/5 animate-pulse scale-150" />
        
        {/* Middle ring */}
        <div className="absolute inset-2 rounded-full border border-destructive/20" />
        
        {/* Inner circle with icon */}
        <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-card border border-destructive/30">
          <Icon className="h-10 w-10 text-destructive/70" strokeWidth={1.5} />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive/40" />
        <div className="absolute -bottom-2 -left-1 h-1.5 w-1.5 rounded-full bg-destructive/30" />
      </div>
      
      <h2 className="text-2xl font-display font-semibold text-foreground mb-2">
        {defaultTitle}
      </h2>
      
      <p className="text-muted-foreground max-w-md mb-2">
        {defaultDescription}
      </p>
      
      {/* Show error details in development */}
      {errorMessage && process.env.NODE_ENV === "development" && (
        <p className="text-xs text-muted-foreground/60 font-mono bg-muted/30 px-3 py-1.5 rounded mb-6 max-w-md truncate">
          {errorMessage}
        </p>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        {onRetry && (
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
        
        {showBackButton && (
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        )}
        
        {showHomeButton && (
          <Button variant="outline" asChild className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

// Preset error components
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorFallback
      variant="network"
      onRetry={onRetry}
    />
  );
}

export function LoadingError({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  return (
    <ErrorFallback
      title="Failed to Load"
      description={message || "We couldn't load this content. Please try again."}
      onRetry={onRetry}
    />
  );
}

export function PropertyNotFound() {
  return (
    <ErrorFallback
      variant="notfound"
      title="Property Not Found"
      description="This property may have been sold, removed, or the link may be incorrect."
      showBackButton
    />
  );
}

export function EventNotFound() {
  return (
    <ErrorFallback
      variant="notfound"
      title="Event Not Found"
      description="This event may have ended or the link may be incorrect."
      showBackButton
    />
  );
}

// Inline error for cards/sections
export function InlineError({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  return (
    <ErrorFallback
      variant="inline"
      description={message}
      onRetry={onRetry}
    />
  );
}