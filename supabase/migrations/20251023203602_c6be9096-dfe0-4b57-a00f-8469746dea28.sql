-- Add read status tracking for messages
ALTER TABLE concierge_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE concierge_messages ADD COLUMN IF NOT EXISTS sender_type TEXT DEFAULT 'user' CHECK (sender_type IN ('user', 'concierge', 'system'));

-- Create index for faster message queries
CREATE INDEX IF NOT EXISTS idx_messages_request_id ON concierge_messages(request_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON concierge_messages(request_id, is_read) WHERE is_read = false;