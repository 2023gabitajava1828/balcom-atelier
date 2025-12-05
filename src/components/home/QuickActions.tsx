import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Search, MessageSquare, Car } from "lucide-react";

const actions = [
  {
    icon: Search,
    label: "Search",
    description: "Browse properties",
    link: "/search",
  },
  {
    icon: MessageSquare,
    label: "Concierge",
    description: "White-glove service",
    link: "/concierge",
  },
  {
    icon: Car,
    label: "Chauffeur",
    description: "Luxury transport",
    link: "/concierge?service=chauffeur",
  },
];

export const QuickActions = () => {
  return (
    <section className="py-8 md:py-12 -mt-16 relative z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-lg mx-auto">
          {actions.map((action, index) => (
            <Link key={action.label} to={action.link}>
              <Card 
                className="p-4 md:p-5 bg-card/95 backdrop-blur-sm hover:bg-card-hover border-border/50 hover:border-primary/30 transition-elegant cursor-pointer group text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2.5 md:p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-fast">
                    <action.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-fast">
                      {action.label}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 hidden md:block">
                      {action.description}
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
