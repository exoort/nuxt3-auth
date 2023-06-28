import { useAuthAPI } from '../api/useAuthAPI';
import { createClientProvider } from '../utils/createClientProvider';

interface IGoogleOauthProviderParams {
  client_id: string,
  redirect_uri: string,
  scope: string[],
  response_type: 'code',
  access_type: 'online' | 'offline',
  state?: Record<string, any>,
  include_granted_scopes?: boolean,
  login_hint?: string,
  prompt?: 'none' | 'consent' | 'select_account',
}

const PROVIDER_NAME = 'googleOauth';

interface ErrorPayload {
  failURL: string,
  successURL: string,
}

export class GoogleOauthProviderError extends Error {
  errorPayload: ErrorPayload;

  readonly provider = PROVIDER_NAME;

  constructor(error: any, payload: ErrorPayload) {
    super(error);

    this.errorPayload = payload;
  }
}

export const GoogleOauthProvider = createClientProvider<IGoogleOauthProviderParams>({
  providerName: PROVIDER_NAME,

  setup(options) {
    if (!options?.redirect_uri || !options?.client_id || !options?.response_type) {
      throw new Error('GoogleOauthProvider requires redirect_uri, client_id, and response_type');
    }

    return {
      providerName: PROVIDER_NAME,

      createError: (error, queryObject) => {
        try {
          const payload = JSON.parse(String(queryObject?.state));
          return new GoogleOauthProviderError(error, payload);
        } catch (e) {
          const url = `/?error=${GoogleOauthProviderError.name}`;
          return new GoogleOauthProviderError(error, {
            failURL: url,
            successURL: url,
          });
        }
      },

      async signIn(signInParams: {
        successURL?: string,
        failURL: string,
      }) {
        const query = new URLSearchParams();

        const encodeValue = (val: any) => {
          if (Array.isArray(val)) {
            return val.join(' ');
          }

          if (val !== undefined && val !== null && typeof val === 'object') {
            return JSON.stringify(val);
          }

          return String(val);
        };

        Object.entries(options).forEach(([key, value]) => {
          if ([null, undefined].includes(value)) {
            return;
          }

          query.append(key, encodeValue(value));
        });

        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const failURL = new URL(`${origin}${signInParams.failURL}`);
        failURL.searchParams.set('error', GoogleOauthProviderError.name);

        query.set('state', encodeValue({
          ...(options.state || {}),
          failURL: failURL.toString().replace(origin, ''),
          successURL: signInParams.successURL || '/',
        }));

        window.location.href = new URL(`https://accounts.google.com/o/oauth2/v2/auth?${query.toString()}`).toString();
      },

      async callback(routeQuery) {
        if (!routeQuery?.code) {
          throw new Error('GoogleOauthProvider requires code for callback handler');
        }

        await useAuthAPI().signIn(PROVIDER_NAME, {
          code: routeQuery?.code,
          redirect_uri: options.redirect_uri,
        });

        const state = routeQuery?.state && JSON.parse(routeQuery.state as string);

        return state || null;
      },
    };
  },
});
