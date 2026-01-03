import * as Sentry from "@sentry/react";

export const initSentry = () => {
  // Only initialize in production or if explicitly enabled
  if (process.env.NODE_ENV === 'production' || process.env.REACT_APP_ENABLE_SENTRY === 'true') {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true, // Hide sensitive text
          blockAllMedia: true, // Don't record images/videos
        }),
      ],
      
      // Performance Monitoring
      tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
      
      // Session Replay
      replaysSessionSampleRate: 0.1, // Record 10% of normal sessions
      replaysOnErrorSampleRate: 1.0, // Record 100% of sessions with errors
      
      // Environment
      environment: process.env.NODE_ENV || 'development',
      
      // Release tracking
      release: process.env.REACT_APP_VERSION || '1.0.0',
      
      // Filter out sensitive data
      beforeSend(event, hint) {
        // Remove sensitive data from error reports
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers;
        }
        
        // Don't send errors from localhost in development
        if (window.location.hostname === 'localhost' && process.env.NODE_ENV !== 'production') {
          return null;
        }
        
        return event;
      },
      
      // Ignore common non-critical errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        'Network request failed',
        'Failed to fetch',
      ],
    });
    
    console.log('✅ Sentry initialized');
  } else {
    console.log('ℹ️ Sentry disabled in development');
  }
};

export default Sentry;
