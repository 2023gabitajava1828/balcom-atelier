// Concierge request and message types

export type ConciergeCategory =
  | 'Travel'
  | 'Dining'
  | 'Chauffeur'
  | 'Events & Tickets'
  | 'Housing & Relocation'
  | 'Wellness'
  | 'Other';

export type ConciergeStatus = 
  | 'submitted'
  | 'in_progress'
  | 'pending_info'
  | 'completed'
  | 'cancelled';

export interface ConciergeRequest {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string | null;
  status: ConciergeStatus | string | null;
  preferred_date: string | null;
  budget_min: number | null;
  budget_max: number | null;
  assigned_to: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ConciergeMessage {
  id: string;
  request_id: string;
  sender_id: string;
  sender_type: 'user' | 'concierge' | string | null;
  message: string;
  attachments: string[] | null;
  is_read: boolean | null;
  created_at: string | null;
}

export interface CreateConciergeRequestParams {
  user_id: string;
  category: ConciergeCategory | string;
  title: string;
  description?: string;
  preferred_date?: string;
  budget_min?: number;
  budget_max?: number;
}

export interface SendMessageParams {
  request_id: string;
  sender_id: string;
  message: string;
  sender_type?: 'user' | 'concierge';
  attachments?: string[];
}

export const CONCIERGE_CATEGORIES: ConciergeCategory[] = [
  'Travel',
  'Dining',
  'Chauffeur',
  'Events & Tickets',
  'Housing & Relocation',
  'Wellness',
  'Other',
];
