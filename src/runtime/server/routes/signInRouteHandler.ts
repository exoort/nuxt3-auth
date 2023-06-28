import {
  defineEventHandler,
} from 'h3';
import { AuthCookieHandlers } from '../utils/AuthCookieHandlers';
import { ISignInProviderSetup } from '../types';

export function signInRouteHandler(providers: ISignInProviderSetup[]) {
  return defineEventHandler(async (event) => {
    const name = event.context.params?.provider;

    if (!name) {
      throw new Error(`Empty provider param: ${name}`);
    }

    const providerConfiguration = providers.find(({ providerName }) => name === providerName);

    if (!providerConfiguration) {
      throw new Error(`Unknown provider: ${name}`);
    }

    const provider = providerConfiguration.configure(event);

    try {
      const authResponse = await provider.authenticate();

      const jwtPayload = await provider.createJwtPayload(authResponse);

      AuthCookieHandlers.setJwtPayload(event, jwtPayload);

      return await provider.response({
        authResponse,
        jwtPayload,
      });
    } catch (error) {
      AuthCookieHandlers.removeJwtCookies(event);
      return await provider.onError(error);
    }
  });
}
