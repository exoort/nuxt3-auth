import {
  defineEventHandler, H3Event,
} from 'h3';
import { AuthCookieHandlers, IJwt } from '~/libs/auth/server';
import { createAuthResponse } from '~/libs/auth/server/utils/authMethods';

interface ISignOutRouteHandlerConfiguration<JwtPayload> {
  onRequest?: (jwtPayload: IJwt<JwtPayload> | null) => Promise<any>,
  onError?(error: any): Promise<any>
}

interface IProvider<JwtPayload> {
  configure(event: H3Event): ISignOutRouteHandlerConfiguration<JwtPayload>,
}

export function signOutRouteHandler<JwtPayload>(providerConfiguration: IProvider<JwtPayload>) {
  return defineEventHandler(async (event) => {
    const provider = providerConfiguration.configure(event);

    if (provider.onRequest) {
      try {
        const jwtPayload = AuthCookieHandlers.getJwtPayload<JwtPayload>(event);

        await provider.onRequest(jwtPayload);
      } catch (error) {
        if (provider.onError) {
          await provider.onError(error);
        }
      }
    }

    AuthCookieHandlers.removeJwtCookies(event);

    return createAuthResponse(event, {
      status: 'ok',
    });
  });
}
