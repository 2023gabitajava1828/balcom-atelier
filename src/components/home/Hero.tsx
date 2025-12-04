import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import heroAtlanta from "@/assets/hero-atlanta.jpg";
import heroDubai from "@/assets/hero-dubai.jpg";
import heroMiami from "@/assets/hero-miami.jpg";

const slides = [
  { image: heroAtlanta, city: "Atlanta", tagline: "Southern Elegance Meets Modern Luxury" },
  { image: heroDubai, city: "Dubai", tagline: "Global Investment Gateway" },
  { image: heroMiami, city: "Miami", tagline: "Coastal Paradise Living" },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Get first name from user metadata or email
  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Member';

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.city}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            index === currentSlide ? "opacity-100" : "opacity-0"
          )}
        >
          <img
            src={slide.image}
            alt={`${slide.city} luxury real estate`}
            className="w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0" 
            style={{ background: 'var(--gradient-hero)' }} 
          />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-32 md:pb-24">
        <div className="max-w-3xl space-y-6">
          {user ? (
            // Logged-in user greeting
            <>
              <p className="text-primary text-sm uppercase tracking-widest font-medium animate-fade-in">
                Member
              </p>
              <h1 
                className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight animate-fade-in"
                style={{ animationDelay: '100ms' }}
              >
                {getGreeting()}, <span className="gradient-text-gold">{firstName}</span>
              </h1>
              <p 
                className="text-lg text-muted-foreground max-w-xl animate-fade-in"
                style={{ animationDelay: '200ms' }}
              >
                Discover extraordinary properties across 84+ countries
              </p>
            </>
          ) : (
            // Guest view
            <>
              <p className="text-primary text-sm uppercase tracking-widest font-medium animate-fade-in">
                Global Luxury Real Estate & Concierge
              </p>
              <h1 
                className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight animate-fade-in"
                style={{ animationDelay: '100ms' }}
              >
                Curating Your <br />
                <span className="gradient-text-gold">Elite Lifestyle</span>
              </h1>
              <p 
                className="text-lg text-muted-foreground max-w-xl animate-fade-in"
                style={{ animationDelay: '200ms' }}
              >
                Unifying global luxury real estate, white-glove concierge, and tailored style across 84+ countries
              </p>
            </>
          )}

          {/* Current City Indicator */}
          <div 
            className="text-sm text-primary/80 font-medium animate-fade-in"
            style={{ animationDelay: '300ms' }}
          >
            {slides[currentSlide].tagline}
          </div>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in"
            style={{ animationDelay: '400ms' }}
          >
            {user ? (
              <>
                <Link to="/real-estate">
                  <Button variant="default" size="lg" className="group w-full sm:w-auto">
                    Explore Properties
                    <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/concierge">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Contact Concierge
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="default" size="lg" className="group w-full sm:w-auto">
                    Get Started
                    <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/membership">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    View Membership
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Slide Indicators */}
          <div className="flex gap-2 pt-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  index === currentSlide 
                    ? "w-12 bg-primary" 
                    : "w-6 bg-foreground/30 hover:bg-foreground/50"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper function
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
