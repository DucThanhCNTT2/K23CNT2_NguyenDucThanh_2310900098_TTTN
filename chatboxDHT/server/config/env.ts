import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

dotenv.config({ path: path.join(projectRoot, '.env') });

if (!['development', 'production'].includes(process.env.NODE_ENV || '')) {
  throw new Error('NODE_ENV must be set to either development or production.');
}

const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 5000);
const jwtAccessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'dht-dev-access-secret-change-me';
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dht-dev-refresh-secret-change-me';
const clientUrlValue = process.env.CLIENT_URL?.trim() || (isProduction ? '' : 'http://localhost:5173');
let clientUrl = '';
if (clientUrlValue) {
  let parsed: URL;
  try {
    parsed = new URL(clientUrlValue);
  } catch {
    throw new Error('CLIENT_URL must be a valid origin URL.');
  }
  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.origin !== clientUrlValue ||
    parsed.username ||
    parsed.password ||
    (isProduction && parsed.protocol !== 'https:')
  ) {
    throw new Error('CLIENT_URL must be an origin without credentials or a path and use HTTPS in production.');
  }
  clientUrl = parsed.origin;
}
const oauthCallbackBaseUrlValue = process.env.OAUTH_CALLBACK_BASE_URL?.trim() ||
  (isProduction ? process.env.PUBLIC_URL?.trim() || '' : `http://localhost:${port}`);
let oauthCallbackBaseUrl = '';
if (oauthCallbackBaseUrlValue) {
  let parsed: URL;
  try {
    parsed = new URL(oauthCallbackBaseUrlValue);
  } catch {
    throw new Error('OAUTH_CALLBACK_BASE_URL must be a valid origin URL.');
  }
  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.origin !== oauthCallbackBaseUrlValue ||
    parsed.username ||
    parsed.password ||
    (isProduction && parsed.protocol !== 'https:')
  ) {
    throw new Error('OAUTH_CALLBACK_BASE_URL must be an origin without credentials or a path and use HTTPS in production.');
  }
  oauthCallbackBaseUrl = parsed.origin;
}
const oauthCredentials = {
  google: {
    clientId: process.env.OAUTH_GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET || ''
  },
  facebook: {
    clientId: process.env.OAUTH_FACEBOOK_CLIENT_ID || '',
    clientSecret: process.env.OAUTH_FACEBOOK_CLIENT_SECRET || ''
  },
  github: {
    clientId: process.env.OAUTH_GITHUB_CLIENT_ID || '',
    clientSecret: process.env.OAUTH_GITHUB_CLIENT_SECRET || ''
  }
};

Object.entries(oauthCredentials).forEach(([provider, credentials]) => {
  if (Boolean(credentials.clientId) !== Boolean(credentials.clientSecret)) {
    throw new Error(`Both OAuth client ID and client secret are required for ${provider}.`);
  }
});
const hasConfiguredOAuthProvider = Object.values(oauthCredentials).some(
  ({ clientId, clientSecret }) => Boolean(clientId && clientSecret)
);
const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',').map(value => value.trim()).filter(Boolean)
  ?? [process.env.CLIENT_URL?.trim(), ...(isProduction ? [] : ['http://localhost:5173', 'http://localhost:3000'])].filter(
    (value): value is string => Boolean(value)
  );
const corsAllowedOrigins = [...new Set(configuredOrigins.map(value => {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error('CORS_ALLOWED_ORIGINS must contain valid origin URLs.');
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== value || value === '*') {
    throw new Error('CORS_ALLOWED_ORIGINS must contain origin URLs without paths or wildcards.');
  }
  if (isProduction && parsed.protocol !== 'https:') {
    throw new Error('Production CORS origins must use HTTPS.');
  }
  return parsed.origin;
}))];
const configuredPublicUrl = process.env.PUBLIC_URL?.trim();
let publicUrl = '';
if (configuredPublicUrl) {
  let parsed: URL;
  try {
    parsed = new URL(configuredPublicUrl);
  } catch {
    throw new Error('PUBLIC_URL must be a valid HTTPS origin.');
  }
  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    (isProduction && parsed.protocol !== 'https:') ||
    parsed.origin !== configuredPublicUrl ||
    parsed.username ||
    parsed.password
  ) {
    throw new Error('PUBLIC_URL must be an origin without credentials or a path, and HTTPS in production.');
  }
  publicUrl = parsed.origin;
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

if (isProduction) {
  if (corsAllowedOrigins.length === 0) {
    throw new Error('CORS_ALLOWED_ORIGINS is required in production.');
  }
  if (!publicUrl) {
    throw new Error('PUBLIC_URL must be an HTTPS URL in production.');
  }
  if (!process.env.MONGODB_URI?.trim()) {
    throw new Error('MONGODB_URI is required when NODE_ENV=production.');
  }
  if (
    !process.env.JWT_ACCESS_SECRET ||
    process.env.JWT_ACCESS_SECRET.length < 32 ||
    !process.env.JWT_REFRESH_SECRET ||
    process.env.JWT_REFRESH_SECRET.length < 32
  ) {
    throw new Error('Production requires separate JWT_ACCESS_SECRET and JWT_REFRESH_SECRET values of at least 32 characters.');
  }
  if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different values.');
  }
  if (hasConfiguredOAuthProvider && (!clientUrl || !oauthCallbackBaseUrl)) {
    throw new Error('CLIENT_URL and OAUTH_CALLBACK_BASE_URL are required when social login is configured.');
  }
  if (process.env.FB_PAGE_ACCESS_TOKEN && !process.env.FB_APP_SECRET) {
    throw new Error('FB_APP_SECRET is required in production when Facebook Messenger is enabled.');
  }
}

export const env = {
  isProduction,
  corsAllowedOrigins,
  publicUrl,
  clientUrl,
  oauthCallbackBaseUrl,
  oauthCredentials,
  oauthFacebookGraphVersion: process.env.META_GRAPH_API_VERSION || 'v26.0',
  billingBankId: process.env.BILLING_BANK_ID?.trim() || '',
  billingBankName: process.env.BILLING_BANK_NAME?.trim() || '',
  billingAccountNumber: process.env.BILLING_ACCOUNT_NUMBER?.trim() || '',
  billingAccountName: process.env.BILLING_ACCOUNT_NAME?.trim() || '',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dht_chatai',
  port,
  resetPasswordExpiresMinutes: Number(process.env.RESET_PASSWORD_EXPIRES_MINUTES || 15),
  jwtAccessSecret,
  jwtRefreshSecret,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};
