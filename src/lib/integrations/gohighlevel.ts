/**
 * GoHighLevel CRM Integration Adapter
 * 
 * Syncs leads, contacts, and service requests to GHL pipeline.
 * Starts in mock mode - toggle USE_MOCK to false for production.
 */

const USE_MOCK = true;

interface GHLContact {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  source: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

interface GHLOpportunity {
  pipelineId: string;
  pipelineStageId: string;
  name: string;
  contactId: string;
  monetaryValue?: number;
  status: string;
  customFields?: Record<string, any>;
}

interface GHLLeadPayload {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyPrice?: number;
  requestType?: string;
  source: string;
}

interface GHLConciergePayload {
  userId: string;
  userEmail: string;
  userName?: string;
  category: string;
  title: string;
  description?: string;
  budget?: string;
  preferredDate?: string;
}

/**
 * Create or update a contact in GoHighLevel
 */
export async function createGHLContact(payload: GHLContact) {
  if (USE_MOCK) {
    console.log('[GHL Mock] Creating contact:', payload);
    return {
      success: true,
      contactId: `mock_contact_${Date.now()}`,
      message: 'Contact created in mock mode'
    };
  }

  // Production implementation
  const GHL_API_KEY = import.meta.env.VITE_GHL_API_KEY;
  const GHL_LOCATION_ID = import.meta.env.VITE_GHL_LOCATION_ID;

  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    throw new Error('GHL credentials not configured');
  }

  try {
    const response = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        ...payload
      })
    });

    if (!response.ok) {
      throw new Error(`GHL API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      contactId: data.contact.id,
      message: 'Contact created successfully'
    };
  } catch (error) {
    console.error('[GHL] Contact creation failed:', error);
    throw error;
  }
}

/**
 * Create an opportunity (pipeline item) in GoHighLevel
 */
export async function createGHLOpportunity(payload: GHLOpportunity) {
  if (USE_MOCK) {
    console.log('[GHL Mock] Creating opportunity:', payload);
    return {
      success: true,
      opportunityId: `mock_opp_${Date.now()}`,
      message: 'Opportunity created in mock mode'
    };
  }

  // Production implementation
  const GHL_API_KEY = import.meta.env.VITE_GHL_API_KEY;

  try {
    const response = await fetch('https://rest.gohighlevel.com/v1/opportunities/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`GHL API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      opportunityId: data.id,
      message: 'Opportunity created successfully'
    };
  } catch (error) {
    console.error('[GHL] Opportunity creation failed:', error);
    throw error;
  }
}

/**
 * Send property lead to GHL
 */
export async function sendPropertyLeadToGHL(payload: GHLLeadPayload) {
  // Create contact first
  const contactResult = await createGHLContact({
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    source: payload.source,
    tags: ['Real Estate', 'Property Inquiry'],
    customFields: {
      property_id: payload.propertyId,
      property_title: payload.propertyTitle,
      property_price: payload.propertyPrice,
    }
  });

  if (!contactResult.success) {
    return contactResult;
  }

  // Create opportunity if contact created successfully
  if (USE_MOCK) {
    return {
      success: true,
      contactId: contactResult.contactId,
      message: 'Property lead sent to GHL (mock mode)'
    };
  }

  // In production, create opportunity in pipeline
  return createGHLOpportunity({
    pipelineId: import.meta.env.VITE_GHL_PIPELINE_ID || '',
    pipelineStageId: import.meta.env.VITE_GHL_STAGE_NEW_LEAD || '',
    name: `Property Inquiry: ${payload.propertyTitle}`,
    contactId: contactResult.contactId,
    monetaryValue: payload.propertyPrice,
    status: 'open',
    customFields: {
      property_id: payload.propertyId,
      request_type: payload.requestType || 'showing'
    }
  });
}

/**
 * Send concierge request to GHL
 */
export async function sendConciergeRequestToGHL(payload: GHLConciergePayload) {
  // Create contact
  const contactResult = await createGHLContact({
    firstName: payload.userName?.split(' ')[0],
    lastName: payload.userName?.split(' ').slice(1).join(' '),
    email: payload.userEmail,
    source: 'Concierge Portal',
    tags: ['Concierge', payload.category],
  });

  if (!contactResult.success) {
    return contactResult;
  }

  if (USE_MOCK) {
    console.log('[GHL Mock] Concierge request sent:', payload);
    return {
      success: true,
      contactId: contactResult.contactId,
      message: 'Concierge request sent to GHL (mock mode)'
    };
  }

  // In production, create opportunity
  return createGHLOpportunity({
    pipelineId: import.meta.env.VITE_GHL_CONCIERGE_PIPELINE_ID || '',
    pipelineStageId: import.meta.env.VITE_GHL_STAGE_NEW_REQUEST || '',
    name: `${payload.category}: ${payload.title}`,
    contactId: contactResult.contactId,
    status: 'open',
    customFields: {
      category: payload.category,
      description: payload.description,
      budget: payload.budget,
      preferred_date: payload.preferredDate,
    }
  });
}

/**
 * Update contact tags (for membership tier changes)
 */
export async function updateGHLContactTags(email: string, tags: string[]) {
  if (USE_MOCK) {
    console.log('[GHL Mock] Updating contact tags:', { email, tags });
    return {
      success: true,
      message: 'Tags updated in mock mode'
    };
  }

  // Production: Find contact by email, then update tags
  const GHL_API_KEY = import.meta.env.VITE_GHL_API_KEY;

  try {
    // Search for contact by email
    const searchResponse = await fetch(
      `https://rest.gohighlevel.com/v1/contacts/?email=${encodeURIComponent(email)}`,
      {
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
        }
      }
    );

    if (!searchResponse.ok) {
      throw new Error('Failed to find contact');
    }

    const searchData = await searchResponse.json();
    if (!searchData.contacts || searchData.contacts.length === 0) {
      throw new Error('Contact not found');
    }

    const contactId = searchData.contacts[0].id;

    // Update tags
    const updateResponse = await fetch(
      `https://rest.gohighlevel.com/v1/contacts/${contactId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags })
      }
    );

    if (!updateResponse.ok) {
      throw new Error('Failed to update tags');
    }

    return {
      success: true,
      message: 'Tags updated successfully'
    };
  } catch (error) {
    console.error('[GHL] Tag update failed:', error);
    throw error;
  }
}
