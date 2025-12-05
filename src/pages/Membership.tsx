import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Sparkles, Lock, Diamond } from "lucide-react";
import { useMembership, TIER_LABELS, TIER_COLORS } from "@/hooks/useMembership";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const tiers = [
  {
    id: "silver" as const,
    name: "Silver",
    icon: Star,
    priceAnnual: "Free",
    priceQuarterly: null,
    initiation: "$0",
    description: "Essential luxury services",
    benefits: [
      "Property browsing access",
      "Basic concierge messaging",
      "Event invitations",
      "Lifestyle vendor directory",
    ],
  },
  {
    id: "gold" as const,
    name: "Gold",
    icon: Crown,
    priceAnnual: "7,500",
    priceQuarterly: "2,250",
    initiation: "$500",
    description: "Priority lifestyle management",
    benefits: [
      "Priority concierge response (4-hour)",
      "Exclusive member events",
      "Property preview access",
      "24/7 global support",
      "Restaurant & nightlife reservations",
      "Luxury car rentals coordination",
    ],
    popular: true,
  },
  {
    id: "platinum" as const,
    name: "Platinum",
    icon: Sparkles,
    priceAnnual: "25,000",
    priceQuarterly: "7,500",
    initiation: "$1,000",
    description: "Elite white-glove experience",
    benefits: [
      "Dedicated lifestyle manager",
      "Athlete & agent services",
      "Private jet coordination",
      "Yacht charter access",
      "VIP event tables & suites",
      "International property search",
      "Priority response (1-hour)",
      "Family office integration",
    ],
  },
  {
    id: "black" as const,
    name: "Black",
    icon: Diamond,
    priceAnnual: "50,000",
    priceQuarterly: null,
    initiation: "$2,500",
    description: "Invitation Only",
    inviteOnly: true,
    benefits: [
      "Senior dedicated concierge team",
      "Global property portfolio management",
      "Private jet ownership coordination",
      "Superyacht access & charters",
      "Art & collectibles advisory",
      "Family security coordination",
      "Estate management services",
      "Philanthropic advisory",
      "Legacy planning support",
    ],
  },
];

const Membership = () => {
  const { user } = useAuth();
  const { tier: currentTier, loading } = useMembership();
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-20 md:pb-0">
        <section className="py-12 md:py-20 bg-gradient-to-b from-background to-background-elevated">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
                Elevate Your <span className="gradient-text-gold">Experience</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose the membership tier that matches your lifestyle
              </p>
              {user && !loading && (
                <Badge className={`mt-4 text-sm px-4 py-1.5 ${TIER_COLORS[currentTier]}`}>
                  CURRENT MEMBERSHIP: {TIER_LABELS[currentTier].toUpperCase()}
                </Badge>
              )}
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-10">
              <Label 
                htmlFor="billing-toggle" 
                className={`text-sm font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}
              >
                Quarterly
              </Label>
              <Switch
                id="billing-toggle"
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
              />
              <Label 
                htmlFor="billing-toggle" 
                className={`text-sm font-medium ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}
              >
                Annual <span className="text-primary">(Save 15%)</span>
              </Label>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {tiers.map((tier) => {
                const isCurrentTier = user && currentTier === tier.id;
                const currentTierIndex = tiers.findIndex(t => t.id === currentTier);
                const tierIndex = tiers.findIndex(t => t.id === tier.id);
                const isUpgrade = user && currentTierIndex < tierIndex;
                const isDowngrade = user && currentTierIndex > tierIndex;
                
                const displayPrice = tier.priceAnnual === "Free" 
                  ? "Free" 
                  : isAnnual 
                    ? tier.priceAnnual 
                    : tier.priceQuarterly;
                
                const period = tier.priceAnnual === "Free" 
                  ? null 
                  : isAnnual 
                    ? "year" 
                    : tier.priceQuarterly 
                      ? "quarter" 
                      : null;
                
                return (
                  <Card
                    key={tier.name}
                    className={`p-6 relative flex flex-col ${
                      tier.popular ? "border-2 border-primary shadow-gold" : "border-border/50"
                    } ${isCurrentTier ? "ring-2 ring-primary/50" : ""}`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                        Most Popular
                      </div>
                    )}
                    {tier.inviteOnly && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-card text-foreground border border-primary/30 px-3 py-1 rounded-full text-xs font-semibold">
                        Invitation Only
                      </div>
                    )}
                    {isCurrentTier && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                          Current
                        </Badge>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <tier.icon className={`w-10 h-10 mx-auto mb-3 ${
                        tier.id === "black" ? "text-foreground" : "text-primary"
                      }`} />
                      <h3 className="font-serif text-xl font-bold mb-1">{tier.name}</h3>
                      <p className="text-xs text-muted-foreground mb-4">{tier.description}</p>
                      
                      {displayPrice === "Free" ? (
                        <div className="text-2xl font-bold text-foreground">Free</div>
                      ) : displayPrice ? (
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl font-bold gradient-text-gold">${displayPrice}</span>
                          {period && <span className="text-muted-foreground text-sm">/{period}</span>}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Annual billing only</div>
                      )}
                      
                      {tier.initiation !== "$0" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          + {tier.initiation} one-time initiation
                        </p>
                      )}
                    </div>

                    <div className="mb-6 flex-1">
                      <p className="text-eyebrow text-muted-foreground mb-3">
                        Benefits Include
                      </p>
                      <ul className="space-y-2">
                        {tier.benefits.map((benefit) => (
                          <li key={benefit} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {user ? (
                      isCurrentTier ? (
                        <Button variant="outline" size="lg" className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : tier.inviteOnly ? (
                        <Button variant="premium" size="lg" className="w-full">
                          Request Invitation
                        </Button>
                      ) : isUpgrade ? (
                        <Button variant={tier.popular ? "hero" : "premium"} size="lg" className="w-full">
                          Upgrade to {tier.name}
                        </Button>
                      ) : isDowngrade ? (
                        <Button variant="outline" size="lg" className="w-full text-muted-foreground" disabled>
                          Included in your plan
                        </Button>
                      ) : null
                    ) : (
                      <Link to="/auth" className="w-full">
                        <Button 
                          variant={tier.popular ? "hero" : tier.inviteOnly ? "outline" : "premium"} 
                          size="lg" 
                          className="w-full"
                        >
                          {tier.inviteOnly ? "Request Invitation" : "Get Started"}
                        </Button>
                      </Link>
                    )}
                  </Card>
                );
              })}
            </div>

            <div className="text-center mt-10 space-y-2">
              <p className="text-sm text-muted-foreground">
                All memberships include secure payment processing via Stripe.
              </p>
              <p className="text-xs text-muted-foreground">
                Cancel anytime. Terms and conditions apply.
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
