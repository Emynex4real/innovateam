let Sentry = null;
let sentryEnabled = false;

try {
  Sentry = require("@sentry/node");
  sentryEnabled = true;
} catch (error) {
  console.log('⚠️ Sentry not installed - error tracking disabled');
}

const initSentry = (app) => {
  if (!sentryEnabled || !Sentry) {
    console.log('ℹ️ Sentry disabled - package not available');
    return;
  }
  
  if (process.env.SENTRY_DSN) {
    try {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        integrations: [
          Sentry.httpIntegration(),
          Sentry.expressIntegration({ app }),
        ],
        beforeSend(event, hint) {
          if (event.request) {
            delete event.request.cookies;
            if (event.request.headers) {
              delete event.request.headers.authorization;
              delete event.request.headers.cookie;
            }
          }
          return event;
        },
      });
      console.log('✅ Sentry initialized');
    } catch (error) {
      console.log('⚠️ Sentry initialization failed:', error.message);
      sentryEnabled = false;
      Sentry = null;
    }
  } else {
    console.log('ℹ️ Sentry disabled - no DSN configured');
    sentryEnabled = false;
  }
};

const getSentryHandlers = () => {
  if (!sentryEnabled || !Sentry || !Sentry.Handlers) {
    return {
      requestHandler: () => (req, res, next) => next(),
      tracingHandler: () => (req, res, next) => next(),
      errorHandler: () => (err, req, res, next) => next(err)
    };
  }
  return {
    requestHandler: () => Sentry.Handlers.requestHandler(),
    tracingHandler: () => Sentry.Handlers.tracingHandler(),
    errorHandler: () => Sentry.Handlers.errorHandler()
  };
};

module.exports = { Sentry, initSentry, getSentryHandlers, sentryEnabled };
