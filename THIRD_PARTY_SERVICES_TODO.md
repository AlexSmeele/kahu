# Third-party Services - API Integration TODOs

## Overview
This document outlines the remaining work needed to integrate real-world data sources for the third-party services feature (vet clinics, groomers, and dog walkers).

## Current Implementation Status

### ✅ Completed
- Database schema for `groomers`, `dog_groomers`, `dog_walkers`, and `dog_dog_walkers` tables
- Row-Level Security (RLS) policies for all new tables
- React hooks: `useGroomers` and `useDogWalkers`
- UI components: EmptyState, ServiceCard, section components
- Search functionality with stub data
- Add/Edit/Remove functionality for all service types
- Preferred service marking
- Multi-dog support

### 🔄 In Progress / Next Steps

## Google Places API Integration

### Required Setup

1. **Environment Variables & Secrets**
   ```bash
   # Add to Supabase Edge Function secrets
   GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

2. **Enable Google APIs**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the following APIs:
     - Places API (New)
     - Places API
     - Maps JavaScript API (optional, for map views)
   - Create API key with appropriate restrictions

3. **API Key Restrictions (Recommended)**
   - Application restrictions: HTTP referrers (websites)
   - API restrictions: Limit to Places API
   - Set referrer restrictions to your domain

### Edge Functions to Complete

#### 1. `search-groomers` Edge Function
**Location:** `supabase/functions/search-groomers/index.ts`

**Current Status:** Stub implementation returns only database results

**Implementation Steps:**
1. Import Google Places API client library
2. Implement text search for "dog grooming" + user query
3. Add location filtering using latitude/longitude
4. Parse Google Places response to match `Groomer` interface
5. Merge Google results with existing database results
6. Deduplicate by `google_place_id`
7. Sort by relevance and rating
8. Cache results to minimize API calls

**API Endpoint:**
```typescript
// Google Places API - Text Search
POST https://places.googleapis.com/v1/places:searchText

Body:
{
  "textQuery": "dog grooming near [location]",
  "locationBias": {
    "circle": {
      "center": {
        "latitude": 37.7749,
        "longitude": -122.4194
      },
      "radius": 5000.0
    }
  }
}
```

**Fields to Extract:**
- `name` → `groomer.name`
- `formattedAddress` → `groomer.address`
- `internationalPhoneNumber` → `groomer.phone`
- `websiteUri` → `groomer.website`
- `rating` → `groomer.rating`
- `userRatingCount` → `groomer.user_ratings_total`
- `location.latitude` → `groomer.latitude`
- `location.longitude` → `groomer.longitude`
- `id` → `groomer.google_place_id`

#### 2. `search-dog-walkers` Edge Function
**Location:** `supabase/functions/search-dog-walkers/index.ts`

**Current Status:** Stub implementation returns only database results

**Implementation Steps:**
1. Similar to groomers function
2. Use text query: "dog walking service" + user query
3. Parse results to match `DogWalker` interface
4. Extract service area from address components
5. Merge and deduplicate results

**API Query:**
```typescript
{
  "textQuery": "dog walking service near [location]",
  "includedType": "dog_walker",  // if available
  "locationBias": { ... }
}
```

### Implementation Example

```typescript
// supabase/functions/search-groomers/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

async function searchGooglePlaces(query: string, latitude?: number, longitude?: number) {
  const requestBody: any = {
    textQuery: `dog grooming ${query}`,
    languageCode: 'en',
  };

  if (latitude && longitude) {
    requestBody.locationBias = {
      circle: {
        center: { latitude, longitude },
        radius: 5000.0, // 5km radius
      },
    };
  }

  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY!,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.location',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.statusText}`);
  }

  return await response.json();
}

function mapGooglePlaceToGroomer(place: any): Groomer {
  return {
    name: place.displayName?.text || '',
    address: place.formattedAddress || '',
    phone: place.internationalPhoneNumber,
    website: place.websiteUri,
    rating: place.rating,
    user_ratings_total: place.userRatingCount,
    latitude: place.location?.latitude,
    longitude: place.location?.longitude,
    google_place_id: place.id,
    verified: false,
  };
}

// In main handler:
const googleResults = await searchGooglePlaces(query, latitude, longitude);
const googleGroomers = googleResults.places?.map(mapGooglePlaceToGroomer) || [];

// Merge with database results, deduplicating by google_place_id
const allResults = [...dbGroomers];
googleGroomers.forEach(google => {
  if (!allResults.some(db => db.google_place_id === google.google_place_id)) {
    allResults.push(google);
  }
});
```

### Rate Limiting & Caching

**Considerations:**
- Google Places API has usage limits and costs per request
- Implement caching to reduce API calls
- Consider creating a cron job to periodically update popular searches

**Caching Strategy:**
```typescript
// Create a cache table (optional)
CREATE TABLE public.service_search_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  service_type TEXT NOT NULL, -- 'groomer', 'walker', 'vet'
  latitude NUMERIC,
  longitude NUMERIC,
  results JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(query, service_type, latitude, longitude)
);

-- Set cache expiry to 7 days
CREATE INDEX idx_service_cache_expiry ON service_search_cache(cached_at);
```

### Error Handling

**Google API Error Codes:**
- `INVALID_ARGUMENT` - Check request format
- `PERMISSION_DENIED` - Verify API key permissions
- `RESOURCE_EXHAUSTED` - Rate limit exceeded
- `NOT_FOUND` - No results for query

**Fallback Strategy:**
1. Try Google Places API first
2. If API fails, return database results only
3. Log errors for monitoring
4. Show user-friendly message if no results

### Testing

**Test Cases:**
1. Search with valid query and location → Returns Google + DB results
2. Search with no location → Returns results without location bias
3. Search with no results → Returns empty array gracefully
4. API key invalid → Falls back to database results
5. Rate limit exceeded → Falls back to database results

**Test Queries:**
- "dog grooming Auckland"
- "mobile dog grooming"
- "pet salon near me"
- "dog walker Wellington"
- "professional dog walking service"

## Additional Enhancements (Future)

### 1. Google Maps Integration
- Show services on a map view
- Display driving directions
- Show service area coverage

### 2. Reviews & Ratings
- Fetch and display Google reviews
- Allow users to rate their own experiences
- Aggregate ratings from multiple sources

### 3. Booking Integration
- Deep link to booking pages
- Calendar integration for appointments
- Reminders for upcoming appointments

### 4. Recommendations
- Suggest services based on dog breed
- Show popular services in user's area
- Recommend based on other users' choices

### 5. Verification System
- Partner with verified service providers
- Badge system for Kahu-verified services
- Quality assurance checks

## Documentation Links

- [Google Places API - Text Search](https://developers.google.com/maps/documentation/places/web-service/text-search)
- [Google Places API - Place Details](https://developers.google.com/maps/documentation/places/web-service/place-details)
- [Google Places API (New) - Text Search](https://developers.google.com/maps/documentation/places/web-service/search-text)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Places API Pricing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)

## Notes

- The vet clinics search already has Google Places integration via `search-vet-clinics` edge function - use this as a reference
- Consider implementing autocomplete for search inputs to improve UX
- Add analytics to track which searches are most common
- Consider implementing a "Request to add" feature for services not found in search

## Component Architecture Summary

### Kahu Design System Components Used

| Kahu Component | shadcn/ui Mapping | Location | Purpose |
|----------------|-------------------|----------|---------|
| KButton | `Button` | `components/ui/button.tsx` | Primary actions, navigation |
| KCard | `Card` | `components/ui/card.tsx` | Service listing cards |
| KDialog | `Dialog` | `components/ui/dialog.tsx` | Add/Edit modals |
| KInput | `Input` | `components/ui/input.tsx` | Search fields, form inputs |
| KTabs | `Tabs` | `components/ui/tabs.tsx` | Service type navigation |
| KBadge | `Badge` | `components/ui/badge.tsx` | "Preferred" indicators |
| KCheckbox | `Checkbox` | `components/ui/checkbox.tsx` | Preferred selection |
| KTextarea | `Textarea` | `components/ui/textarea.tsx` | Notes fields |
| KEmptyState | `EmptyState` | `components/ui/empty-state.tsx` | Empty state messaging |

### Design Tokens Used

**Colors:**
- `primary` - Main action buttons, preferred badges
- `secondary` - Secondary UI elements
- `muted-foreground` - Subdued text
- `destructive` - Delete actions

**Typography:**
- Section titles: `text-2xl font-semibold`
- Card titles: `text-lg font-semibold`
- Body text: `text-sm`
- Helper text: `text-xs text-muted-foreground`

**Spacing:**
- Card padding: `p-4`
- Section spacing: `space-y-4`
- Button gaps: `gap-2`

**Interactive States:**
- Hover: `hover:shadow-md transition-all duration-base`
- Focus: `focus-visible:ring-2 focus-visible:ring-primary`

## Success Metrics

✅ **Database & Backend:** Complete
✅ **React Hooks:** Complete
✅ **UI Components:** Complete
✅ **Empty States:** Complete
✅ **CRUD Operations:** Complete
✅ **Design System Alignment:** Complete
🔄 **Google Places Integration:** In Progress (see above)
⏳ **Enhanced Features:** Planned (see Additional Enhancements)
