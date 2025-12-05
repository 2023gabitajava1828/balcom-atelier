import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export const SplashScreen = ({ onComplete, minDuration = 2000 }: SplashScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 600); // Wait for exit animation
    }, minDuration);

    return () => clearTimeout(timer);
  }, [onComplete, minDuration]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background",
        "transition-all duration-600 ease-luxury",
        isExiting && "opacity-0 scale-105"
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card opacity-50" />
      
      {/* Animated glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={cn(
          "w-64 h-64 rounded-full bg-primary/5 blur-3xl",
          "animate-pulse"
        )} />
      </div>

      {/* Logo container */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo mark */}
        <div className={cn(
          "relative",
          "animate-[splash-logo_1s_ease-out_forwards]"
        )}>
          {/* Decorative frame */}
          <div className="absolute -inset-4 border border-primary/20 animate-[splash-frame_1.2s_ease-out_forwards]" />
          
          {/* Logo text */}
          <div className="px-8 py-6">
            <h1 className="font-display text-4xl md:text-5xl tracking-wider text-foreground">
              BALCOM
            </h1>
            <p className="text-center font-display text-lg md:text-xl tracking-[0.3em] text-primary mt-1">
              PRIVÉ
            </p>
          </div>
        </div>

        {/* Tagline */}
        <p className={cn(
          "text-muted-foreground text-sm tracking-widest uppercase",
          "opacity-0 animate-[splash-tagline_0.8s_ease-out_0.6s_forwards]"
        )}>
          Luxury Lifestyle Management
        </p>

        {/* Loading indicator */}
        <div className={cn(
          "flex items-center gap-2 mt-8",
          "opacity-0 animate-[splash-tagline_0.8s_ease-out_0.8s_forwards]"
        )}>
          <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-primary/50" />
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-[splash-dot_1.4s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-primary/50" />
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-[1px]",
        "bg-gradient-to-r from-transparent via-primary/30 to-transparent",
        "opacity-0 animate-[splash-tagline_0.8s_ease-out_1s_forwards]"
      )} />
    </div>
  );
};
