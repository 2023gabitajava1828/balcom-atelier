import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Car, Calendar, ChefHat, Plane, Shirt, Home } from "lucide-react";

const quickActions = [
  {
    icon: Car,
    title: "Book a Driver",
    description: "Premium chauffeur service",
    link: "/concierge?service=driver",
  },
  {
    icon: Calendar,
    title: "Reserve F1 Weekend",
    description: "VIP race experience",
    link: "/community",
  },
  {
    icon: ChefHat,
    title: "Private Chef",
    description: "Culinary excellence at home",
    link: "/concierge?service=chef",
  },
  {
    icon: Plane,
    title: "Yacht & Jet Inquiry",
    description: "Luxury travel arrangements",
    link: "/concierge?service=travel",
  },
  {
    icon: Shirt,
    title: "Wardrobe Refresh",
    description: "Tailored styling service",
    link: "/style",
  },
  {
    icon: Home,
    title: "Property Viewing",
    description: "Schedule private showings",
    link: "/real-estate",
  },
];

export const QuickActions = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl font-bold mb-4">
            Your Lifestyle, <span className="gradient-text-gold">One Tap Away</span>
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Access our suite of premium services instantly
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.link}>
              <Card className="p-6 hover:shadow-gold transition-elegant cursor-pointer group bg-card border-border/50">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-elegant">
                    <action.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-elegant">
                      {action.title}
                    </h3>
                    <p className="text-sm text-foreground/60">{action.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/membership">
            <Button variant="hero" size="lg">
              Become a Member
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
