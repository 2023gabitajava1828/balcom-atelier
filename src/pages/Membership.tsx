import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Sparkles, Lock } from "lucide-react";
import { useMembership, TIER_LABELS } from "@/hooks/useMembership";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const tiers = [
  {
    id: "silver" as const,
    name: "Silver",
    icon: Star,
    price: "Free",
    period: null,
    description: "Essential luxury services",
    conciergeServices: ["Travel & Transportation", "Fine Dining & Reservations", "Other Requests"],
    features: [
      "Global property search access",
      "Basic concierge requests (5/month)",
      "Event invitations",
      "Member community access",
    ],
  },
  {
    id: "gold" as const,
    name: "Gold",
    icon: Crown,
    price: "2,500",
    period: "month",
    description: "Priority lifestyle management",
    conciergeServices: ["All Silver services", "Event Planning & VIP Access", "Personal Shopping & Styling"],
    features: [
      "Everything in Silver",
      "Priority concierge (unlimited)",
      "Tailored To You™ styling",
      "VIP event access",
      "Personal advisor calls",
      "24/7 support",
    ],
    popular: true,
  },
  {
    id: "platinum" as const,
    name: "Platinum",
    icon: Sparkles,
    price: "10,000",
    period: "month",
    description: "Elite white-glove experience",
    conciergeServices: ["All Gold services", "Lifestyle Services", "Investment Advisory"],
    features: [
      "Everything in Gold",
      "Dedicated concierge team",
      "Off-market property access",
      "Global estate management",
      "Exclusive partner access",
      "Custom travel arrangements",
      "Private events hosting",
    ],
  },
];

const Membership = () => {
  const { user } = useAuth();
  const { tier: currentTier, loading } = useMembership();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-20 md:pb-0">
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="font-serif text-5xl font-bold mb-4">
                Choose Your <span className="gradient-text-gold">Membership</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Elevate your lifestyle with our tiered membership program
              </p>
              {user && !loading && (
                <Badge className="mt-4 text-sm px-4 py-1.5 bg-primary/10 text-primary border-primary/30">
                  Current Plan: {TIER_LABELS[currentTier]}
                </Badge>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {tiers.map((tier) => {
                const isCurrentTier = user && currentTier === tier.id;
                const isUpgrade = user && tiers.findIndex(t => t.id === currentTier) < tiers.findIndex(t => t.id === tier.id);
                
                return (
                  <Card
                    key={tier.name}
                    className={`p-8 relative ${tier.popular ? "border-2 border-primary shadow-gold" : ""} ${isCurrentTier ? "ring-2 ring-primary/50" : ""}`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    )}
                    {isCurrentTier && (
                      <div className="absolute -top-4 right-4 bg-card text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary">
                        Current Plan
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <tier.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                      <h3 className="font-serif text-2xl font-bold mb-2">{tier.name}</h3>
                      <p className="text-sm mb-4 text-muted-foreground">{tier.description}</p>
                      <div className="flex items-baseline justify-center">
                        {tier.price === "Free" ? (
                          <span className="text-3xl font-bold text-foreground">Free</span>
                        ) : (
                          <>
                            <span className="text-4xl font-bold gradient-text-gold">${tier.price}</span>
                            <span className="text-muted-foreground ml-2">/{tier.period}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Concierge Services */}
                    <div className="mb-6">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                        Concierge Services
                      </p>
                      <ul className="space-y-2">
                        {tier.conciergeServices.map((service) => (
                          <li key={service} className="flex items-start">
                            <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-foreground">{service}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-8">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <Check className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {user ? (
                      isCurrentTier ? (
                        <Button variant="outline" size="lg" className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : isUpgrade ? (
                        <Button variant={tier.popular ? "hero" : "premium"} size="lg" className="w-full">
                          Upgrade to {tier.name}
                        </Button>
                      ) : (
                        <Button variant="outline" size="lg" className="w-full" disabled>
                          <Lock className="w-4 h-4 mr-2" />
                          Included in {TIER_LABELS[currentTier]}
                        </Button>
                      )
                    ) : (
                      <Link to="/auth">
                        <Button variant={tier.popular ? "hero" : "premium"} size="lg" className="w-full">
                          Get Started
                        </Button>
                      </Link>
                    )}
                  </Card>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <p className="text-sm text-muted-foreground">
                All paid memberships include 30-day satisfaction guarantee
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer className="hidden md:block" />
      <BottomTabs />
    </div>
  );
};

export default Membership;
