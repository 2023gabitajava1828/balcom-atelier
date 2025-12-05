import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMembership, TIER_LABELS, TIER_COLORS } from "@/hooks/useMembership";
import heroAtlanta from "@/assets/hero-atlanta.jpg";
import heroDubai from "@/assets/hero-dubai.jpg";
import heroMiami from "@/assets/hero-miami.jpg";
import { cn } from "@/lib/utils";

const slides = [
  { image: heroAtlanta, city: "Atlanta", tagline: "Southern Elegance" },
  { image: heroDubai, city: "Dubai", tagline: "Global Gateway" },
  { image: heroMiami, city: "Miami", tagline: "Coastal Paradise" },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const { tier } = useMembership();

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Get first name from user metadata or email
  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Member';

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight - 80, behavior: 'smooth' });
  };

  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.city}
          className={cn(
            "absolute inset-0 transition-opacity duration-1500 ease-out",
            index === currentSlide ? "opacity-100" : "opacity-0"
          )}
        >
          <img
            src={slide.image}
            alt={`${slide.city} luxury real estate`}
            className="w-full h-full object-cover scale-105"
            style={{
              transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 8s ease-out'
            }}
          />
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className={cn(
          "max-w-2xl transition-all duration-1000 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {user ? (
            // Logged-in user - personalized greeting
            <>
              <Badge 
                className={cn(TIER_COLORS[tier], "mb-6")}
                style={{ transitionDelay: '200ms' }}
              >
                {TIER_LABELS[tier]} Member
              </Badge>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-4">
                {getGreeting()},
                <br />
                <span className="gradient-text-gold">{firstName}</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Your world of exclusive properties and bespoke services awaits.
              </p>
              
              {/* Single Primary CTA */}
              <Link to="/real-estate">
                <Button 
                  size="lg" 
                  className="group gap-3 px-8 py-6 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                >
                  Explore Properties
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </>
          ) : (
            // Guest view - Emotional, aspirational messaging
            <>
              <p className="text-eyebrow text-primary/90 mb-4 tracking-[0.2em]">
                BALCOM PRIVÉ
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground leading-[1.05] mb-6">
                Live Without
                <br />
                <span className="gradient-text-gold">Compromise</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
                Curated luxury estates and white-glove concierge for those who expect the&nbsp;extraordinary.
              </p>
              
              {/* Single Primary CTA */}
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="group gap-3 px-8 py-6 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-gold"
                >
                  Begin Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              {/* Secondary link - subtle, text only */}
              <p className="mt-6 text-sm text-muted-foreground">
                Already a member?{' '}
                <Link to="/auth" className="text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>

        {/* Bottom section - Progressive disclosure */}
        <div className={cn(
          "absolute bottom-8 left-0 right-0 container mx-auto px-4 sm:px-6 lg:px-8 flex items-end justify-between transition-all duration-1000 delay-500",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          {/* Current market indicator */}
          <div className="hidden sm:flex items-center gap-4">
            {slides.map((slide, index) => (
              <button
                key={slide.city}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "text-sm transition-all duration-300",
                  index === currentSlide 
                    ? "text-foreground font-medium" 
                    : "text-muted-foreground hover:text-foreground/70"
                )}
              >
                {slide.city}
              </button>
            ))}
          </div>

          {/* Slide progress indicators - mobile */}
          <div className="flex sm:hidden gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  index === currentSlide 
                    ? "w-8 bg-primary" 
                    : "w-2 bg-foreground/30"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Scroll indicator */}
          <button 
            onClick={scrollToContent}
            className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span>Explore</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
};
