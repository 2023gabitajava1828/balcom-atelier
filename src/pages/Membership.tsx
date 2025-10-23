import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Crown, Star, Sparkles } from "lucide-react";

const tiers = [
  {
    name: "Silver",
    icon: Sparkles,
    price: "2,500",
    period: "month",
    description: "Core luxury services",
    features: [
      "Global property search access",
      "Basic concierge requests (5/month)",
      "Event invitations",
      "Member community access",
      "Quarterly lookbook",
    ],
  },
  {
    name: "Gold",
    icon: Star,
    price: "5,000",
    period: "month",
    description: "Priority lifestyle management",
    features: [
      "Everything in Silver",
      "Priority concierge (unlimited)",
      "Tailored To You™ styling",
      "VIP event access",
      "Personal advisor calls",
      "24/7 support",
      "Private showings",
    ],
    popular: true,
  },
  {
    name: "Black",
    icon: Crown,
    price: "10,000",
    period: "month",
    description: "Elite white-glove experience",
    features: [
      "Everything in Gold",
      "Dedicated concierge team",
      "Athlete relocation services",
      "Global estate management",
      "Exclusive partner access",
      "Custom travel arrangements",
      "Trust & will planning",
      "Private events hosting",
    ],
  },
];

const Membership = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="font-serif text-5xl font-bold mb-4">
                Choose Your <span className="gradient-text-gold">Membership</span>
              </h1>
              <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                Elevate your lifestyle with our tiered membership program
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {tiers.map((tier) => (
                <Card
                  key={tier.name}
                  className={`p-8 relative ${
                    tier.popular ? "border-2 border-primary shadow-gold" : ""
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <tier.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="font-serif text-2xl font-bold mb-2">{tier.name}</h3>
                    <p className="text-sm text-foreground/60 mb-4">{tier.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold gradient-text-gold">${tier.price}</span>
                      <span className="text-foreground/60 ml-2">/{tier.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={tier.popular ? "hero" : "premium"}
                    size="lg"
                    className="w-full"
                  >
                    Select {tier.name}
                  </Button>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-sm text-foreground/60">
                All memberships include 30-day satisfaction guarantee
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Membership;
