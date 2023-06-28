import { ISignInProvider} from '../types';

export function defineProvider<Options, JwtPayload, AuthData>(setup: ISignInProvider<Options, JwtPayload, AuthData>): ISignInProvider<Options, JwtPayload, AuthData> {
  return setup;
}
