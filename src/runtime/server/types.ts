import { H3Event } from 'h3';

export type IJwt<T = any> = T & {
  accessTokenValidTill: number,
  refreshTokenValidTill: number,
  signInProvider: string,
};

export interface ISignInConfigure<JwtPayload, AuthData> {
  authenticate: () => Promise<AuthData>,
  createJwtPayload: (data: AuthData) => Promise<IJwt<JwtPayload>>,
  response: (args: {
    authResponse: AuthData,
    jwtPayload: IJwt<JwtPayload>,
  }) => Promise<any>,
  onError(error: any): Promise<any>
}

export interface ISignInProviderSetup<JwtPayload = any, AuthData = any> {
  providerName: string,
  configure(event: H3Event): ISignInConfigure<JwtPayload, AuthData>
}

export interface ISignInProvider<Options = any, JwtPayload = any, AuthData = any> {
  providerName: ISignInProviderSetup<JwtPayload, AuthData>['providerName'],
  setup(options?: Options): ISignInProviderSetup<JwtPayload, AuthData>,
}
