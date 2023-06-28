import { readBody } from 'h3';

import {
  createAuthResponse
} from '../utils/authMethods';
import { defineProvider } from '../utils/defineProvider';
import { ISignInConfigure } from "../types";

interface IFacebookOauthRequest {
  code: string,
  redirect_uri: string,
  client_id: string,
  client_secret: string,
}
interface IFacebookOauthResponse {
  access_token: string,
  expires_in: string,
  token_type: string,
  client_id: string,
  client_secret: string,
}
async function getFacebookOauthToken(formData: IFacebookOauthRequest) {
  const query = new URLSearchParams({
    ...formData,
    grant_type: 'authorization_code',
  });

  const url = new URL(`https://graph.facebook.com/v17.0/oauth/access_token?${query.toString()}`).toString();

  const response = await $fetch<IFacebookOauthResponse>(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  return {
    ...response,
    client_id: formData.client_id,
    client_secret: formData.client_secret,
  };
}

const PROVIDER_NAME = 'facebookOauth';

interface ProviderOptions<JwtPayload, AuthData> extends Pick<ISignInConfigure<JwtPayload, AuthData>, 'createJwtPayload'>{
  clientId: string,
  clientSecret: string,
  convertOauthToken: (oauthToken: Awaited<ReturnType<typeof getFacebookOauthToken>>) => AuthData,
}

export const FacebookOauthProvider = <JwtPayload, AuthData>() => defineProvider<ProviderOptions<JwtPayload, AuthData>, JwtPayload, AuthData>(
  {
    providerName: PROVIDER_NAME,

    setup: (config) => {
      if (!!config?.clientId || !config?.clientSecret || !config?.convertOauthToken|| !config?.createJwtPayload) {
        throw new Error('Missing FacebookOAuthProvider config');
      }

      return {
        providerName: PROVIDER_NAME,

        configure: (event) => ({
          async authenticate() {
            const formData = await readBody<IFacebookOauthRequest>(event);

            formData.client_id = config.clientId;
            formData.client_secret = config.clientSecret;

            const oauthData = await getFacebookOauthToken(formData);

            return config.convertOauthToken(oauthData);
          },

          createJwtPayload: config.createJwtPayload,

          async response() {
            return createAuthResponse(event, {
              status: 'ok',
            });
          },

          async onError(error) {
            return createAuthResponse(event, {
              status: 'error',
              response: {
                message: error.message,
              },
            });
          },
        }),
      };
    },
  },
);
