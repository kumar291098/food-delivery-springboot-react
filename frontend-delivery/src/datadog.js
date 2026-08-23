import { datadogRum } from '@datadog/browser-rum';

export const initDatadogRum = (serviceName = 'food-delivery-frontend-delivery') => {
  const appId = import.meta.env.VITE_DATADOG_APP_ID;
  const clientToken = import.meta.env.VITE_DATADOG_CLIENT_TOKEN;
  const site = import.meta.env.VITE_DATADOG_SITE || 'datadoghq.com';
  const env = import.meta.env.VITE_DATADOG_ENV || 'production';

  if (!appId || !clientToken) {
    console.info(`[Datadog RUM] Skipped initialization for ${serviceName} (set VITE_DATADOG_APP_ID and VITE_DATADOG_CLIENT_TOKEN to enable).`);
    return;
  }

  try {
    datadogRum.init({
      applicationId: appId,
      clientToken: clientToken,
      site: site,
      service: serviceName,
      env: env,
      version: '1.0.0',
      sessionSampleRate: 100,
      sessionReplaySampleRate: 100,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'mask-user-input',
      allowedTracingUrls: [
        { match: "http://localhost:8080/api/.*", propagatorTypes: ["tracecontext", "b3"] }
      ]
    });

    datadogRum.startSessionReplayRecording();
    console.info(`[Datadog RUM] Active for ${serviceName} (tracing linked to Gateway)`);
  } catch (err) {
    console.warn('[Datadog RUM] Initialization error:', err);
  }
};
