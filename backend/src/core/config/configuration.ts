export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-this-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'change-this-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  kledo: {
    token: process.env.KLEDO_TOKEN,
    baseUrl: process.env.KLEDO_BASE_URL ?? 'https://api.kledo.com',
  },

  fonnte: {
    token: process.env.FONNTE_TOKEN,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '1000', 10),
  },
});
