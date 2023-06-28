import { getCookie, H3Event, setCookie } from 'h3';
import type { CookieSerializeOptions } from 'cookie-es';
import { JWT } from './JWT';
import type { IJwt } from '../types';

interface CookieDetails {
  value: string;
  options?: CookieSerializeOptions;
}
export class AuthCookieHandlers {
  static setCookies(event: H3Event, cookies: Record<string, CookieDetails>) {
    Object.entries(cookies).forEach(([key, details]) => {
      setCookie(event, key, details.value, details.options);
    });
  }

  private static getSignature() {
    // TODO: get from module config
    return '123';
  }

  static setJwtPayload<T>(event: H3Event, jwtPayload: IJwt<T>) {
    AuthCookieHandlers.setCookies(event, {
      token: {
        value: JWT.encode(jwtPayload, AuthCookieHandlers.getSignature()),
        options: {
          sameSite: 'lax',
          httpOnly: true,
          maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
        },
      },
    });
  }

  static getJwtPayload<JwtPayload>(event: H3Event): IJwt<JwtPayload> | null {
    const jwtString = getCookie(event, 'token');

    if (!jwtString) {
      return null;
    }

    const jwt = JWT.decode<JwtPayload>(jwtString, AuthCookieHandlers.getSignature());

    return jwt?.data || null;
  }

  static removeJwtCookies(event: H3Event) {
    AuthCookieHandlers.removeCookies(event, ['token']);
  }

  static removeCookies(event: H3Event, cookieNames: string[]) {
    const cookies: Record<string, CookieDetails> = {};

    cookieNames.forEach((name) => {
      cookies[name] = {
        value: '',
        options: {
          maxAge: -1,
        },
      };
    });

    AuthCookieHandlers.setCookies(event, cookies);
  }
}
