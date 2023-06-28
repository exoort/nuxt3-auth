import { defineProvider } from '../utils/defineProvider';
import { ISignInConfigure } from "../types";

const PROVIDER_NAME = 'credentials';

export const CredentialsProvider = <JwtPayload, AuthData>() => defineProvider<ISignInConfigure<JwtPayload, AuthData>, JwtPayload, AuthData>(
  {
    providerName: PROVIDER_NAME,

    setup(config) {
      if (!config) {
        throw new Error('Missing config');
      }

      return {
        providerName: PROVIDER_NAME,

        configure() {
          return config;
        }
      };
    },
  },
);
