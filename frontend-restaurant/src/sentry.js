import * as Sentry from "@sentry/react";

export const initSentry = (appName = "food-delivery-frontend-restaurant") => {
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
      tracesSampleRate: 1.0,
      tracePropagationTargets: ["localhost", /^https:\/\/.*\/api/, "http://localhost:8080"],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });

    console.info(`[Sentry Observability] Active for ${appName}`);
  } catch (err) {
    console.warn('[Sentry Observability] Initialization error:', err);
  }
};
