# Google Analytics Integration

This document describes how Google Analytics 4 (GA4) has been integrated into the DataSpace Frontend application.

## Setup

### 1. Environment Configuration

Add your Google Analytics tracking ID to your environment variables:

```bash
# .env.local
NEXT_PUBLIC_GA_ID='G-XXXXXXXXXX'
```

Replace `G-XXXXXXXXXX` with your actual Google Analytics 4 tracking ID.

### 2. Files Added/Modified

- `lib/gtag.ts` - Core Google Analytics utilities and tracking functions
- `components/GoogleAnalytics/` - React component for GA initialization
- `hooks/use-analytics.ts` - Custom hook for easy analytics tracking
- `types/index.d.ts` - TypeScript definitions for gtag
- `env.ts` - Environment variable validation
- `app/[locale]/layout.tsx` - GA component integration

## Usage

### Basic Tracking

The Google Analytics component is automatically loaded in the main layout and will track page views automatically.

### Custom Event Tracking

Use the `useAnalytics` hook for custom event tracking:

```tsx
import { useAnalytics } from '@/hooks/use-analytics';

const MyComponent = () => {
  const { track, trackDataset, trackUsecase, trackSearch } = useAnalytics();

  const handleClick = () => {
    track('button_click', { button_name: 'download' });
  };

  const handleDatasetView = (datasetId: string, title?: string) => {
    trackDataset(datasetId, title);
  };

  // ... rest of component
};
```

### Available Tracking Functions

#### From `lib/gtag.ts`:
- `pageview(url)` - Track page views
- `event({ action, category, label, value })` - Generic event tracking
- `trackEvent(eventName, parameters)` - Custom event tracking
- `trackPageView(pagePath, pageTitle)` - Page view tracking
- `trackUserInteraction(action, element)` - User interaction tracking
- `trackDatasetView(datasetId, datasetTitle)` - Dataset view tracking
- `trackUsecaseView(usecaseId, usecaseTitle)` - Usecase view tracking
- `trackSearch(query, resultCount)` - Search query tracking
- `trackDownload(fileName, fileType)` - File download tracking

#### From `useAnalytics` hook:
- `track(eventName, parameters)` - Generic event tracking
- `trackPage(pagePath, pageTitle)` - Page view tracking
- `trackInteraction(action, element)` - User interaction tracking
- `trackDataset(datasetId, datasetTitle)` - Dataset view tracking
- `trackUsecase(usecaseId, usecaseTitle)` - Usecase view tracking
- `trackSearchQuery(query, resultCount)` - Search query tracking
- `trackFileDownload(fileName, fileType)` - File download tracking

## Examples

### Track Dataset Views
```tsx
useEffect(() => {
  if (datasetId) {
    trackDataset(datasetId, datasetTitle);
  }
}, [datasetId, datasetTitle, trackDataset]);
```

### Track Search Queries
```tsx
const handleSearch = (query: string, results: any[]) => {
  trackSearchQuery(query, results.length);
};
```

### Track File Downloads
```tsx
const handleDownload = (fileName: string) => {
  trackFileDownload(fileName, fileName.split('.').pop());
};
```

### Track User Interactions
```tsx
const handleButtonClick = () => {
  trackInteraction('click', 'export_button');
};
```

## Implementation Details

### Automatic Page Tracking

The `GoogleAnalytics` component automatically tracks page views using Next.js router events. It's integrated into the main layout at `app/[locale]/layout.tsx`.

### Privacy Considerations

- Google Analytics only loads when `NEXT_PUBLIC_GA_ID` is provided
- All tracking functions check for the presence of `window.gtag` before executing
- The implementation follows Google's recommended practices for GA4

### TypeScript Support

Full TypeScript support is provided with proper type definitions for the `gtag` function and all tracking utilities.

## Testing

To test the implementation:

1. Set up a Google Analytics 4 property
2. Add the tracking ID to your `.env.local` file
3. Run the application in development mode
4. Open browser developer tools and check the Network tab for GA requests
5. Use Google Analytics Real-time reports to verify events are being tracked

## Troubleshooting

### GA not loading
- Verify `NEXT_PUBLIC_GA_ID` is set correctly
- Check browser console for any JavaScript errors
- Ensure ad blockers are not interfering

### Events not tracking
- Verify the `gtag` function is available (`window.gtag`)
- Check that events are being called after GA initialization
- Use browser developer tools to inspect network requests to Google Analytics

### Development vs Production
- GA tracking works in both development and production
- Use different GA properties for development and production environments
- Consider using Google Analytics Debug mode for development testing
