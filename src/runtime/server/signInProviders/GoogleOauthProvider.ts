import { readBody } from 'h3';

import {
  createAuthResponse,
} from '../utils/authMethods';
import { defineProvider } from '../utils/defineProvider';
import {ISignInConfigure} from "../types";

interface IGoogleOauthRequest {
  code: string,
  redirect_uri: string,
  client_id: string,
  client_secret: string,
}
interface IGoogleOauthResponse {
  access_token: string,
  id_token: string,
  expires_in: string,
  token_type: string,
  scope: string,
  refresh_token: string,
  client_id: string,
  client_secret: string,
}
async function getGoogleOauthToken(formData: IGoogleOauthRequest) {
  const body = new URLSearchParams({
    ...formData,
    grant_type: 'authorization_code',
  });

  const response = await $fetch<IGoogleOauthResponse>('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
  });

  return {
    ...response,
    client_id: formData.client_id,
    client_secret: formData.client_secret,
  };
}

interface ProviderOptions<JwtPayload, AuthData> extends Pick<ISignInConfigure<JwtPayload, AuthData>, 'createJwtPayload'>{
  clientId: string,
  clientSecret: string,
  convertOauthToken: (oauthToken: Awaited<ReturnType<typeof getGoogleOauthToken>>) => AuthData,
}

const PROVIDER_NAME = 'googleOauth';

export const GoogleOauthProvider = <JwtPayload, AuthData>() => defineProvider<ProviderOptions<JwtPayload, AuthData>, JwtPayload, AuthData>(
  {
    providerName: PROVIDER_NAME,

    setup(config) {
      if (!config?.clientId || !config?.clientSecret || !config?.convertOauthToken|| !config?.createJwtPayload) {
        throw new Error('Missing Google OAuth config');
      }

      return {
        providerName: PROVIDER_NAME,

        configure: (event) => ({
          async authenticate() {
            const formData = await readBody<IGoogleOauthRequest>(event);

            if (!formData?.code || !formData?.redirect_uri) {
              throw new Error('Bad request');
            }

            formData.client_id = config.clientId;
            formData.client_secret = config.clientSecret;

            const oauthData = await getGoogleOauthToken(formData);

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
