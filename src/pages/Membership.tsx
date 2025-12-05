import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Sparkles, Diamond } from "lucide-react";
import { useMembership, TIER_LABELS, TIER_COLORS } from "@/hooks/useMembership";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface BenefitCategory {
  label: string;
  items: string[];
}

interface TierData {
  id: "silver" | "gold" | "platinum" | "black";
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  priceAnnual: string;
  priceQuarterly: string | null;
  initiation: string;
  description: string;
  benefits: BenefitCategory[];
  recommended?: boolean;
  inviteOnly?: boolean;
}

const tiers: TierData[] = [
  {
    id: "silver",
    name: "Silver",
    icon: Star,
    priceAnnual: "Free",
    priceQuarterly: null,
    initiation: "$0",
    description: "Essential luxury services",
    benefits: [
      {
        label: "Access",
        items: ["Property browsing", "Event invitations", "Vendor directory"],
      },
      {
        label: "Concierge",
        items: ["Basic messaging support"],
      },
    ],
  },
  {
    id: "gold",
    name: "Gold",
    icon: Crown,
    priceAnnual: "7,500",
    priceQuarterly: "2,250",
    initiation: "$500",
    description: "Priority lifestyle management",
    recommended: true,
    benefits: [
      {
        label: "Response Time",
        items: ["4-hour priority response", "24/7 global support"],
      },
      {
        label: "Access & Events",
        items: ["Exclusive member events", "Property preview access"],
      },
      {
        label: "Concierge",
        items: ["Restaurant reservations", "Luxury car coordination"],
      },
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    icon: Sparkles,
    priceAnnual: "25,000",
    priceQuarterly: "7,500",
    initiation: "$1,000",
    description: "Elite white-glove experience",
    benefits: [
      {
        label: "Response Time",
        items: ["1-hour priority response", "Dedicated lifestyle manager"],
      },
      {
        label: "Access & Events",
        items: ["VIP event tables & suites", "Athlete & agent services"],
      },
      {
        label: "Concierge",
        items: ["Private jet coordination", "Yacht charter access"],
      },
      {
        label: "Property Services",
        items: ["International property search", "Family office integration"],
      },
    ],
  },
  {
    id: "black",
    name: "Black",
    icon: Diamond,
    priceAnnual: "50,000",
    priceQuarterly: null,
    initiation: "$2,500",
    description: "By Invitation Only",
    inviteOnly: true,
    benefits: [
      {
        label: "Response Time",
        items: ["Immediate response", "Senior concierge team"],
      },
      {
        label: "Access & Events",
        items: ["Global property portfolio", "Art & collectibles advisory"],
      },
      {
        label: "Concierge",
        items: ["Private jet ownership", "Superyacht access"],
      },
      {
        label: "Legacy Services",
        items: ["Estate management", "Philanthropic advisory", "Legacy planning"],
      },
    ],
  },
];

const TierCard = ({ 
  tier, 
  isCurrentTier, 
  isUpgrade, 
  isDowngrade, 
  displayPrice, 
  period, 
  user 
}: {
  tier: TierData;
  isCurrentTier: boolean;
  isUpgrade: boolean;
  isDowngrade: boolean;
  displayPrice: string | null;
  period: string | null;
  user: boolean;
}) => {
  const cardStyles = {
    silver: "border-border/30 bg-card hover:border-border/60",
    gold: "border-t-4 border-t-primary border-border/30 bg-card hover:shadow-gold",
    platinum: "border-border/50 bg-gradient-to-b from-card to-card/80 hover:border-primary/30",
    black: "border-primary/40 bg-gradient-to-br from-[hsl(var(--background))] to-card relative overflow-hidden",
  };

  const buttonVariants = {
    silver: "outline" as const,
    gold: "hero" as const,
    platinum: "premium" as const,
    black: "outline" as const,
  };

  return (
    <div
      className={`relative rounded-xl p-6 flex flex-col border transition-all duration-300 ${cardStyles[tier.id]} ${
        isCurrentTier ? "ring-2 ring-primary/50" : ""
      } ${tier.id === "black" ? "lg:col-span-full lg:flex-row lg:items-start lg:gap-8 lg:p-8" : ""}`}
    >
      {/* Black tier animated border effect */}
      {tier.id === "black" && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 opacity-50" />
      )}

      {/* Recommended badge - subtle top text */}
      {tier.recommended && (
        <div className="absolute -top-3 left-6 text-xs font-medium text-primary tracking-wide">
          RECOMMENDED
        </div>
      )}

      {/* Current tier badge */}
      {isCurrentTier && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="outline" className="text-xs border-primary/50 text-primary bg-card">
            Current
          </Badge>
        </div>
      )}

      {/* Header section */}
      <div className={`text-center relative z-10 ${tier.id === "black" ? "lg:text-left lg:min-w-[280px]" : ""} mb-6`}>
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
          tier.id === "black" 
            ? "bg-primary/10 border border-primary/30" 
            : tier.id === "platinum"
              ? "bg-muted/50"
              : tier.id === "gold"
                ? "bg-primary/10"
                : "bg-muted/30"
        }`}>
          <tier.icon className={`w-6 h-6 ${
            tier.id === "black" ? "text-primary" : 
            tier.id === "gold" ? "text-primary" : 
            "text-foreground"
          }`} />
        </div>
        
        <h3 className="font-serif text-2xl font-bold mb-1">{tier.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
        
        {displayPrice === "Free" ? (
          <div className="text-3xl font-bold text-foreground">Free</div>
        ) : displayPrice ? (
          <div className="flex items-baseline justify-center lg:justify-start gap-1">
            <span className={`text-4xl font-bold ${tier.id === "black" ? "text-foreground" : "gradient-text-gold"}`}>
              ${displayPrice}
            </span>
            {period && <span className="text-muted-foreground text-sm">/{period}</span>}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic">Annual billing only</div>
        )}
        
        {tier.initiation !== "$0" && (
          <p className="text-xs text-muted-foreground mt-2">
            + {tier.initiation} one-time initiation
          </p>
        )}

        {/* CTA Button - shown in header for Black tier on desktop */}
        {tier.id === "black" && (
          <div className="hidden lg:block mt-6">
            {renderButton(tier, user, isCurrentTier, isUpgrade, isDowngrade, buttonVariants[tier.id])}
          </div>
        )}
      </div>

      {/* Benefits section */}
      <div className={`flex-1 relative z-10 ${tier.id === "black" ? "lg:border-l lg:border-border/30 lg:pl-8" : ""}`}>
        <div className={`space-y-4 ${tier.id === "black" ? "lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0" : ""}`}>
          {tier.benefits.map((category) => (
            <div key={category.label}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {category.label}
              </p>
              <ul className="space-y-1.5">
                {category.items.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2">
                    <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      tier.id === "black" ? "text-primary" : "text-primary/70"
                    }`} />
                    <span className="text-sm text-foreground/80">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button - bottom for non-Black tiers, and mobile Black tier */}
      <div className={`mt-6 relative z-10 ${tier.id === "black" ? "lg:hidden" : ""}`}>
        {renderButton(tier, user, isCurrentTier, isUpgrade, isDowngrade, buttonVariants[tier.id])}
      </div>
    </div>
  );
};

const renderButton = (
  tier: TierData,
  user: boolean,
  isCurrentTier: boolean,
  isUpgrade: boolean,
  isDowngrade: boolean,
  variant: "outline" | "hero" | "premium"
) => {
  if (user) {
    if (isCurrentTier) {
      return (
        <Button variant="outline" size="lg" className="w-full opacity-50" disabled>
          Current Plan
        </Button>
      );
    }
    if (tier.inviteOnly) {
      return (
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full border-primary/50 text-primary hover:bg-primary/10"
        >
          Request Invitation
        </Button>
      );
    }
    if (isUpgrade) {
      return (
        <Button variant={variant} size="lg" className="w-full">
          Upgrade to {tier.name}
        </Button>
      );
    }
    if (isDowngrade) {
      return (
        <Button variant="outline" size="lg" className="w-full opacity-40" disabled>
          Included in your plan
        </Button>
      );
    }
    return null;
  }

  return (
    <Link to="/auth" className="w-full block">
      <Button 
        variant={tier.inviteOnly ? "outline" : variant} 
        size="lg" 
        className={`w-full ${tier.inviteOnly ? "border-primary/50 text-primary hover:bg-primary/10" : ""}`}
      >
        {tier.inviteOnly ? "Request Invitation" : "Get Started"}
      </Button>
    </Link>
  );
};

const Membership = () => {
  const { user } = useAuth();
  const { tier: currentTier, loading } = useMembership();
  const [isAnnual, setIsAnnual] = useState(true);

  const mainTiers = tiers.filter(t => t.id !== "black");
  const blackTier = tiers.find(t => t.id === "black")!;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="page-main-compact">
        <section className="section">
          <div className="content-narrow">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
                Elevate Your <span className="gradient-text-gold">Experience</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose the membership tier that matches your lifestyle
              </p>
              {user && !loading && (
                <Badge className={`mt-4 text-sm px-4 py-1.5 ${TIER_COLORS[currentTier]}`}>
                  {TIER_LABELS[currentTier].toUpperCase()} MEMBER
                </Badge>
              )}
            </div>

            {/* Billing Toggle - Sticky on mobile */}
            <div className="sticky top-16 z-20 bg-background/95 backdrop-blur-sm py-4 -mx-4 px-4 mb-8 md:static md:bg-transparent md:backdrop-blur-none md:py-0">
              <div className="flex items-center justify-center gap-4">
                <Label 
                  htmlFor="billing-toggle" 
                  className={`text-sm font-medium cursor-pointer ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}
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
                  className={`text-sm font-medium cursor-pointer ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}
                >
                  Annual <span className="text-primary text-xs">(Save 15%)</span>
                </Label>
              </div>
            </div>

            {/* Main Tiers Grid - 3 columns on desktop */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
              {mainTiers.map((tier) => {
                const isCurrentTier = !!user && currentTier === tier.id;
                const currentTierIndex = tiers.findIndex(t => t.id === currentTier);
                const tierIndex = tiers.findIndex(t => t.id === tier.id);
                const isUpgrade = !!user && currentTierIndex < tierIndex;
                const isDowngrade = !!user && currentTierIndex > tierIndex;
                
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
                  <TierCard
                    key={tier.id}
                    tier={tier}
                    isCurrentTier={isCurrentTier}
                    isUpgrade={isUpgrade}
                    isDowngrade={isDowngrade}
                    displayPrice={displayPrice}
                    period={period}
                    user={!!user}
                  />
                );
              })}
            </div>

            {/* Black Tier - Full width exclusive section */}
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Exclusive Membership
                </p>
              </div>
              <TierCard
                tier={blackTier}
                isCurrentTier={!!user && currentTier === "black"}
                isUpgrade={!!user && currentTier !== "black"}
                isDowngrade={false}
                displayPrice={isAnnual ? blackTier.priceAnnual : null}
                period={isAnnual ? "year" : null}
                user={!!user}
              />
            </div>

            {/* Footer text */}
            <div className="text-center mt-12 space-y-2">
              <p className="text-sm text-muted-foreground">
                All memberships include secure payment processing.
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
