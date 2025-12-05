// Membership Service - handles membership tiers and access

import { supabase } from '@/integrations/supabase/client';
import type { ApiResponse, MembershipTier } from '../types/common';
import type { Membership } from '../types/user';
import { successResponse, errorResponse, TIER_HIERARCHY, TIER_LABELS } from '../types/common';

export const MembershipService = {
  /**
   * Get user's membership
   */
  async getMembership(userId: string): Promise<ApiResponse<Membership | null>> {
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        return errorResponse(error.message);
      }

      // Return default silver if no membership found
      if (!data) {
        return successResponse({
          id: '',
          user_id: userId,
          tier: 'silver' as MembershipTier,
          status: 'active',
          stripe_customer_id: null,
          stripe_subscription_id: null,
          current_period_start: null,
          current_period_end: null,
          created_at: null,
          updated_at: null,
        });
      }

      return successResponse(data as Membership);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch membership');
    }
  },

  /**
   * Check if user can access a required tier
   */
  canAccessTier(userTier: MembershipTier, requiredTier: MembershipTier): boolean {
    return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
  },

  /**
   * Get the next upgrade tier
   */
  getUpgradeTier(currentTier: MembershipTier): MembershipTier | null {
    switch (currentTier) {
      case 'silver': return 'gold';
      case 'gold': return 'platinum';
      case 'platinum': return 'black';
      case 'black': return null;
      default: return 'gold';
    }
  },

  /**
   * Get tier hierarchy
   */
  getTierHierarchy(): Record<MembershipTier, number> {
    return TIER_HIERARCHY;
  },

  /**
   * Get tier labels
   */
  getTierLabels(): Record<MembershipTier, string> {
    return TIER_LABELS;
  },

  /**
   * Check if tier is Gold or higher
   */
  isGoldOrHigher(tier: MembershipTier): boolean {
    return TIER_HIERARCHY[tier] >= TIER_HIERARCHY.gold;
  },

  /**
   * Check if tier is Platinum or higher
   */
  isPlatinumOrHigher(tier: MembershipTier): boolean {
    return TIER_HIERARCHY[tier] >= TIER_HIERARCHY.platinum;
  },

  /**
   * Check if tier is Black
   */
  isBlack(tier: MembershipTier): boolean {
    return tier === 'black';
  },

  /**
   * Get tier pricing (for display)
   */
  getTierPricing(): Record<MembershipTier, { annual: number; quarterly: number; initiation: number }> {
    return {
      silver: { annual: 0, quarterly: 0, initiation: 0 },
      gold: { annual: 7500, quarterly: 2250, initiation: 500 },
      platinum: { annual: 25000, quarterly: 7500, initiation: 1000 },
      black: { annual: 50000, quarterly: 0, initiation: 2500 },
    };
  },
};
