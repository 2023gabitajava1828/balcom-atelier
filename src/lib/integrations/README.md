# API Integration Guide

This directory contains adapters for third-party services. Each adapter is designed to work in **mock mode** initially, allowing you to test the full application flow before connecting real APIs.

## 🔌 Integration Adapters

### 1. GoHighLevel CRM (`gohighlevel.ts`)

**Purpose**: Sync leads, contacts, and service requests to your GHL pipeline.

**Mock Mode**: Returns success responses without actual API calls.

**Production Setup**:
```typescript
// Set environment variables
GHL_API_KEY=your_api_key_here
GHL_LOCATION_ID=your_location_id

// API endpoints used:
POST https://rest.gohighlevel.com/v1/contacts/
POST https://rest.gohighlevel.com/v1/opportunities/
```

**Webhook Events**:
- `lead.created` - New property inquiry
- `request.created` - New concierge request
- `member.upgraded` - Membership tier change

---

### 2. Perfect.Live Concierge SDK (`perfectlive.ts`)

**Purpose**: Real-time concierge chat and service request management.

**Mock Mode**: Simulates chat threads and status updates.

**Production Setup**:
```typescript
// Set environment variables
PERFECTLIVE_API_KEY=your_api_key
PERFECTLIVE_WORKSPACE_ID=your_workspace_id

// SDK Installation (when ready):
npm install @perfectlive/sdk

// Key methods:
- createThread(userId, category)
- sendMessage(threadId, message)
- updateRequestStatus(requestId, status)
```

---

### 3. RealtyCandy IDX (`realtycandy-idx.ts`)

**Purpose**: Fetch luxury property listings with search and filtering.

**Mock Mode**: Returns curated sample properties (Atlanta, Dubai, Miami, Mexico City).

**Production Setup**:
```typescript
// Set environment variables
REALTYCANDY_API_KEY=your_api_key
REALTYCANDY_FEED_ID=your_feed_id

// API endpoints:
GET https://api.realtycandy.com/v2/properties/search
GET https://api.realtycandy.com/v2/properties/:id

// Supported filters:
- city, region, country
- priceMin, priceMax
- beds, baths
- propertyType (house, condo, villa, penthouse)
- lifestyleTags (beach, golf, city, desert)
```

---

## 🚀 Switching from Mock to Production

1. **Update environment variables** in Lovable Cloud secrets
2. **Toggle mock flags** in each adapter file:
   ```typescript
   const USE_MOCK = false; // Change to false
   ```
3. **Test with Postman/curl** before deploying
4. **Monitor edge function logs** for API errors

---

## 📊 Webhook Configuration

For GHL webhooks, configure these URLs in your GHL account:

```
https://YOUR_PROJECT.supabase.co/functions/v1/ghl-webhook
```

Add webhook secret to environment variables:
```
GHL_WEBHOOK_SECRET=your_secret_here
```

---

## 🔐 Security Notes

- All API keys stored in Lovable Cloud secrets (encrypted)
- Never commit API keys to git
- Use environment variables in edge functions
- Implement rate limiting for production APIs

---

## 📞 Support Contacts

- **GoHighLevel**: https://help.gohighlevel.com
- **Perfect.Live**: support@perfect.live
- **RealtyCandy**: https://realtycandy.com/support
