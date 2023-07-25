export { AuthProvider, AuthProviderConfig } from './types';

export { default as OauthCallback } from './components/OauthCallback.vue';

export { useAuth } from './composables/useAuth';

export { CredentialsProvider } from './providers/CredentialsProvider';

export { FacebookOauthProvider, FacebookOauthProviderError } from './providers/FacebookOauthProvider';

export { GoogleOauthProvider, GoogleOauthProviderError } from './providers/GoogleOauthProvider';

export { createSessionMiddleware } from './middlewares/createSessionMiddleware';
