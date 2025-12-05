import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type MembershipTier = "silver" | "gold" | "platinum" | "black";

interface Membership {
  tier: MembershipTier;
  status: string;
  current_period_end: string | null;
}

export const TIER_HIERARCHY: Record<MembershipTier, number> = {
  silver: 1,
  gold: 2,
  platinum: 3,
  black: 4,
};

export const TIER_LABELS: Record<MembershipTier, string> = {
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  black: "Black",
};

export const TIER_COLORS: Record<MembershipTier, string> = {
  silver: "tier-silver",
  gold: "tier-gold",
  platinum: "tier-platinum",
  black: "tier-black",
};

export const useMembership = () => {
  const { user } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMembership();
    } else {
      setMembership(null);
      setLoading(false);
    }
  }, [user]);

  const fetchMembership = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("memberships")
      .select("tier, status, current_period_end")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (data) {
      setMembership(data as Membership);
    } else {
      // Default to silver if no membership found
      setMembership({ tier: "silver", status: "active", current_period_end: null });
    }
    setLoading(false);
  };

  const canAccessTier = (requiredTier: MembershipTier): boolean => {
    if (!membership) return false;
    return TIER_HIERARCHY[membership.tier] >= TIER_HIERARCHY[requiredTier];
  };

  const getUpgradeTier = (): MembershipTier | null => {
    if (!membership) return "gold";
    if (membership.tier === "silver") return "gold";
    if (membership.tier === "gold") return "platinum";
    if (membership.tier === "platinum") return "black";
    return null;
  };

  return {
    membership,
    tier: membership?.tier || "silver",
    loading,
    canAccessTier,
    getUpgradeTier,
    isGold: membership?.tier === "gold" || membership?.tier === "platinum" || membership?.tier === "black",
    isPlatinum: membership?.tier === "platinum" || membership?.tier === "black",
    isBlack: membership?.tier === "black",
  };
};
