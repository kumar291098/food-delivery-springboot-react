import * as Sentry from "@sentry/react";

export const initSentry = (appName = "food-delivery-frontend-user") => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const env = import.meta.env.VITE_ENV || "development";

  if (!dsn) {
    console.info(`[Sentry Observability] Initialized in local mode for ${appName} (set VITE_SENTRY_DSN to stream to your free Sentry account).`);
    return;
  }

  try {
    Sentry.init({
      dsn: dsn,
      environment: env,
      release: `${appName}@1.0.0`,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
      // Trace propagation to Backend API Gateway
      tracePropagationTargets: ["localhost", /^https:\/\/.*\/api/, "http://localhost:8080"],
      // Session Replay
      replaysSessionSampleRate: 0.1, // Sample 10% of normal sessions
      replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
    });

    console.info(`[Sentry Observability] Active for ${appName}`);
  } catch (err) {
    console.warn('[Sentry Observability] Initialization error:', err);
  }
};
