import { useAuthAPI } from '../api/useAuthAPI';
import { createClientProvider } from '../utils/createClientProvider';

interface IFacebookOauthProviderOptions {
  client_id: string,
  redirect_uri: string,
  state?: Record<string, any>,
}

interface ErrorPayload {
  failURL: string,
  successURL: string,
}

const PROVIDER_NAME = 'facebookOauth';

export class FacebookOauthProviderError extends Error {
  errorPayload: ErrorPayload;

  readonly provider = PROVIDER_NAME;

  constructor(error: any, payload: ErrorPayload) {
    super(error);

    this.errorPayload = payload;
  }
}

export const FacebookOauthProvider = createClientProvider<IFacebookOauthProviderOptions>({
  providerName: PROVIDER_NAME,

  setup(options) {
    if (!options?.redirect_uri || !options?.client_id) {
      throw new Error('FacebookOauthProvider requires redirect_uri, client_id');
    }

    return {
      providerName: PROVIDER_NAME,

      createError: (error, queryObject) => {
        try {
          const payload = JSON.parse(String(queryObject?.state));
          return new FacebookOauthProviderError(error, payload);
        } catch (e) {
          const url = `/?error=${FacebookOauthProviderError.name}`;
          return new FacebookOauthProviderError(error, {
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

          if (typeof val === 'object') {
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
        failURL.searchParams.set('error', FacebookOauthProviderError.name);

        query.set('state', encodeValue({
          ...(options.state || {}),
          failURL: failURL.toString().replace(origin, ''),
          successURL: signInParams.successURL || '',
        }));

        window.location.href = new URL(`https://www.facebook.com/v17.0/dialog/oauth?${query.toString()}`).toString();
      },

      async callback(routeQuery) {
        if (!routeQuery?.code) {
          throw new Error('FacebookOauthProvider requires code for callback handler');
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
