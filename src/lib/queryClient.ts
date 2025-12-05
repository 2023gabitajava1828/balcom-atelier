import { QueryClient } from "@tanstack/react-query";

/**
 * Optimized React Query client configuration
 * - Aggressive caching for property data (5 min stale, 30 min cache)
 * - Background refetching for fresh data
 * - Retry logic for failed requests
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep in cache for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Retry failed requests up to 2 times
      retry: 2,
      // Don't refetch on window focus for better UX
      refetchOnWindowFocus: false,
      // Refetch in background when data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

/**
 * Query keys for consistent caching
 */
export const queryKeys = {
  // Properties
  properties: ['properties'] as const,
  propertyById: (id: string) => ['properties', id] as const,
  idxProperties: (params?: Record<string, unknown>) => ['idx-properties', params] as const,
  
  // Events
  events: ['events'] as const,
  eventById: (id: string) => ['events', id] as const,
  
  // Luxury items
  luxuryItems: ['luxury-items'] as const,
  luxuryItemById: (id: string) => ['luxury-items', id] as const,
  
  // User data
  profile: (userId: string) => ['profile', userId] as const,
  membership: (userId: string) => ['membership', userId] as const,
  savedProperties: (userId: string) => ['saved-properties', userId] as const,
  
  // Concierge
  conciergeRequests: (userId: string) => ['concierge-requests', userId] as const,
  
  // Athletes
  athletes: (agentId: string) => ['athletes', agentId] as const,
  athleteRequests: (athleteId: string) => ['athlete-requests', athleteId] as const,
};
