/**
 * Perfect.Live Concierge SDK Adapter
 * 
 * Real-time concierge chat and service request management.
 * Starts in mock mode - toggle USE_MOCK to false for production.
 */

const USE_MOCK = true;

export interface ConciergeThread {
  id: string;
  userId: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConciergeMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  attachments?: string[];
}

export interface CreateThreadPayload {
  userId: string;
  userEmail: string;
  userName?: string;
  category: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface SendMessagePayload {
  threadId: string;
  senderId: string;
  senderName: string;
  message: string;
  attachments?: string[];
}

export interface UpdateStatusPayload {
  requestId: string;
  status: string;
  notes?: string;
}

/**
 * Create a new concierge thread
 */
export async function createConciergeThread(payload: CreateThreadPayload): Promise<ConciergeThread> {
  if (USE_MOCK) {
    console.log('[Perfect.Live Mock] Creating thread:', payload);
    
    const mockThread: ConciergeThread = {
      id: `thread_${Date.now()}`,
      userId: payload.userId,
      category: payload.category,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockThread;
  }

  // Production implementation with Perfect.Live SDK
  const PERFECTLIVE_API_KEY = import.meta.env.VITE_PERFECTLIVE_API_KEY;
  const PERFECTLIVE_WORKSPACE_ID = import.meta.env.VITE_PERFECTLIVE_WORKSPACE_ID;

  if (!PERFECTLIVE_API_KEY || !PERFECTLIVE_WORKSPACE_ID) {
    throw new Error('Perfect.Live credentials not configured');
  }

  try {
    const response = await fetch('https://api.perfect.live/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERFECTLIVE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Workspace-ID': PERFECTLIVE_WORKSPACE_ID,
      },
      body: JSON.stringify({
        user_id: payload.userId,
        user_email: payload.userEmail,
        user_name: payload.userName,
        category: payload.category,
        title: payload.title,
        description: payload.description,
        metadata: payload.metadata,
      })
    });

    if (!response.ok) {
      throw new Error(`Perfect.Live API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.thread.id,
      userId: data.thread.user_id,
      category: data.thread.category,
      status: data.thread.status,
      createdAt: data.thread.created_at,
      updatedAt: data.thread.updated_at,
    };
  } catch (error) {
    console.error('[Perfect.Live] Thread creation failed:', error);
    throw error;
  }
}

/**
 * Send a message to a thread
 */
export async function sendConciergeMessage(payload: SendMessagePayload): Promise<ConciergeMessage> {
  if (USE_MOCK) {
    console.log('[Perfect.Live Mock] Sending message:', payload);
    
    const mockMessage: ConciergeMessage = {
      id: `msg_${Date.now()}`,
      threadId: payload.threadId,
      senderId: payload.senderId,
      senderName: payload.senderName,
      message: payload.message,
      timestamp: new Date().toISOString(),
      attachments: payload.attachments,
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockMessage;
  }

  // Production implementation
  const PERFECTLIVE_API_KEY = import.meta.env.VITE_PERFECTLIVE_API_KEY;

  try {
    const response = await fetch(`https://api.perfect.live/v1/threads/${payload.threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERFECTLIVE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender_id: payload.senderId,
        sender_name: payload.senderName,
        message: payload.message,
        attachments: payload.attachments,
      })
    });

    if (!response.ok) {
      throw new Error(`Perfect.Live API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.message.id,
      threadId: data.message.thread_id,
      senderId: data.message.sender_id,
      senderName: data.message.sender_name,
      message: data.message.content,
      timestamp: data.message.created_at,
      attachments: data.message.attachments,
    };
  } catch (error) {
    console.error('[Perfect.Live] Message send failed:', error);
    throw error;
  }
}

/**
 * Update concierge request status
 */
export async function updateConciergeStatus(payload: UpdateStatusPayload) {
  if (USE_MOCK) {
    console.log('[Perfect.Live Mock] Updating status:', payload);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      requestId: payload.requestId,
      status: payload.status,
      message: 'Status updated (mock mode)'
    };
  }

  // Production implementation
  const PERFECTLIVE_API_KEY = import.meta.env.VITE_PERFECTLIVE_API_KEY;

  try {
    const response = await fetch(`https://api.perfect.live/v1/requests/${payload.requestId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${PERFECTLIVE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: payload.status,
        notes: payload.notes,
      })
    });

    if (!response.ok) {
      throw new Error(`Perfect.Live API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      requestId: data.request.id,
      status: data.request.status,
      message: 'Status updated successfully'
    };
  } catch (error) {
    console.error('[Perfect.Live] Status update failed:', error);
    throw error;
  }
}

/**
 * Get thread messages
 */
export async function getThreadMessages(threadId: string): Promise<ConciergeMessage[]> {
  if (USE_MOCK) {
    console.log('[Perfect.Live Mock] Getting messages for thread:', threadId);
    
    // Return mock messages
    const mockMessages: ConciergeMessage[] = [
      {
        id: 'msg_1',
        threadId,
        senderId: 'system',
        senderName: 'Concierge Team',
        message: 'Thank you for your request. A team member will be with you shortly.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'msg_2',
        threadId,
        senderId: 'concierge_1',
        senderName: 'Sarah Johnson',
        message: 'Hello! I\'m Sarah, and I\'ll be assisting you with your request. Let me gather some details.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMessages;
  }

  // Production implementation
  const PERFECTLIVE_API_KEY = import.meta.env.VITE_PERFECTLIVE_API_KEY;

  try {
    const response = await fetch(`https://api.perfect.live/v1/threads/${threadId}/messages`, {
      headers: {
        'Authorization': `Bearer ${PERFECTLIVE_API_KEY}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Perfect.Live API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.messages.map((msg: any) => ({
      id: msg.id,
      threadId: msg.thread_id,
      senderId: msg.sender_id,
      senderName: msg.sender_name,
      message: msg.content,
      timestamp: msg.created_at,
      attachments: msg.attachments,
    }));
  } catch (error) {
    console.error('[Perfect.Live] Failed to get messages:', error);
    throw error;
  }
}

/**
 * Close/archive a thread
 */
export async function closeConciergeThread(threadId: string) {
  if (USE_MOCK) {
    console.log('[Perfect.Live Mock] Closing thread:', threadId);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      threadId,
      message: 'Thread closed (mock mode)'
    };
  }

  // Production implementation
  const PERFECTLIVE_API_KEY = import.meta.env.VITE_PERFECTLIVE_API_KEY;

  try {
    const response = await fetch(`https://api.perfect.live/v1/threads/${threadId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${PERFECTLIVE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'closed'
      })
    });

    if (!response.ok) {
      throw new Error(`Perfect.Live API error: ${response.statusText}`);
    }

    return {
      success: true,
      threadId,
      message: 'Thread closed successfully'
    };
  } catch (error) {
    console.error('[Perfect.Live] Failed to close thread:', error);
    throw error;
  }
}
