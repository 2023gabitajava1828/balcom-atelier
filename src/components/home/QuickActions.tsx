import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Plane, UtensilsCrossed, Car, Ticket, Home, Sparkles } from "lucide-react";

const services = [
  {
    icon: Plane,
    label: "Travel",
    description: "Private jets & hotels",
    link: "/concierge?service=travel",
  },
  {
    icon: UtensilsCrossed,
    label: "Dining",
    description: "Exclusive reservations",
    link: "/concierge?service=dining",
  },
  {
    icon: Car,
    label: "Chauffeur",
    description: "Luxury transport",
    link: "/concierge?service=chauffeur",
  },
  {
    icon: Ticket,
    label: "Events",
    description: "VIP access",
    link: "/community",
  },
  {
    icon: Home,
    label: "Housing",
    description: "Property services",
    link: "/real-estate",
  },
  {
    icon: Sparkles,
    label: "Wellness",
    description: "Spa & health",
    link: "/concierge?service=wellness",
  },
];

export const QuickActions = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Your Lifestyle, <span className="gradient-text-gold">One Tap Away</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Access our suite of premium services instantly
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {services.map((service, index) => (
            <Link key={service.label} to={service.link}>
              <Card 
                className="p-5 md:p-6 bg-card hover:bg-card-hover border-border/50 hover:border-primary/30 transition-elegant cursor-pointer group hover-card-lift animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col items-start gap-3">
                  <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-fast">
                    <service.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-fast">
                      {service.label}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {service.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
