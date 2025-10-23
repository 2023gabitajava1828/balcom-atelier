import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import heroAtlanta from "@/assets/hero-atlanta.jpg";
import heroDubai from "@/assets/hero-dubai.jpg";
import heroMiami from "@/assets/hero-miami.jpg";

const slides = [
  { image: heroAtlanta, city: "Atlanta", tagline: "Southern Elegance Meets Modern Luxury" },
  { image: heroDubai, city: "Dubai", tagline: "Global Investment Gateway" },
  { image: heroMiami, city: "Miami", tagline: "Coastal Paradise Living" },
];

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.city}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={`${slide.city} luxury real estate`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Global Luxury Real Estate & Concierge</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
            Curating Your
            <br />
            <span className="gradient-text-gold">Elite Lifestyle</span>
          </h1>

          <p className="text-xl text-foreground/80 max-w-2xl mx-auto font-light">
            Unifying global luxury real estate, white-glove concierge, and tailored style across 84+ countries
          </p>

          {/* Current City Indicator */}
          <div className="text-sm text-primary/80 font-medium">
            {slides[currentSlide].tagline}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to="/real-estate">
              <Button variant="hero" size="xl" className="group">
                Explore Properties
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/concierge">
              <Button variant="premium" size="xl">
                Book Concierge
              </Button>
            </Link>
          </div>

          {/* Slide Indicators */}
          <div className="flex gap-2 justify-center pt-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1 rounded-full transition-all ${
                  index === currentSlide ? "w-12 bg-primary" : "w-8 bg-primary/30"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
