import * as Sentry from "@sentry/remix";

Sentry.init({
  dsn: "https://d740eb5f0961a4f56c87e6dd81f98c6e@o4506721770733568.ingest.us.sentry.io/4507607904616448",
  tracesSampleRate: 1,
  autoInstrumentRemix: true,
  enabled: !import.meta.env.DEV,
});
