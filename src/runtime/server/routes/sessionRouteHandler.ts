import {
  defineEventHandler, H3Event,
} from 'h3';
import { AuthCookieHandlers } from '../utils/AuthCookieHandlers';
import { IJwt } from '../types';

interface Options<JwtPayload = Record<string, any>> {
  onAccessTokenExpired: (jwtPayload: IJwt<JwtPayload>) => Promise<IJwt<JwtPayload> | null>;
  onRefreshTokenExpired: (jwtPayload: IJwt<JwtPayload>) => Promise<IJwt<JwtPayload> | null>;
  session: (jwtPayload: IJwt<JwtPayload>) => any;
  onTokenExpiration?: (data: IJwt<JwtPayload>) => Promise<any>,
  onError?: (error: any)=> Promise<any>
}

interface ProviderOptions<JwtPayload> {
  configure(event: H3Event): Options<JwtPayload>
}
export function sessionRouteHandler<JwtPayload>(options: ProviderOptions<JwtPayload>) {
  return defineEventHandler(async (event) => {
    const provider = options.configure(event);

    try {
      let jwtPayload = AuthCookieHandlers.getJwtPayload<JwtPayload>(event);

      if (!jwtPayload) {
        return {};
      }

      const now = Date.now();

      if (now > jwtPayload.refreshTokenValidTill) {
        jwtPayload = await provider.onRefreshTokenExpired(jwtPayload);
      } else if (now > jwtPayload.accessTokenValidTill) {
        jwtPayload = await provider.onAccessTokenExpired(jwtPayload);
      }

      if (jwtPayload && Object.keys(jwtPayload).length) {
        AuthCookieHandlers.setJwtPayload(event, jwtPayload);
      } else {
        AuthCookieHandlers.removeJwtCookies(event);
        return {};
      }

      const session = await provider.session(jwtPayload);

      return session || {};
    } catch (error) {
      AuthCookieHandlers.removeJwtCookies(event);
      return provider.onError ? provider.onError(error) : {};
    }
  });
}
