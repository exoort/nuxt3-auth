import jsonwebtoken from 'jsonwebtoken';

interface JwtEncodeOptions {
  expiresIn?: number, // seconds
}

export class JWT {
  static encode(payload: any, signature: string, options: JwtEncodeOptions = {}) {
    return jsonwebtoken.sign(
      { data: payload },
      signature,
      { algorithm: 'HS256', ...options },
    );
  }

  static decode(token: string, signature: string): jsonwebtoken.JwtPayload | null {
    const payload = jsonwebtoken.verify(
      token,
      signature,
      { algorithms: ['HS256'] },
    );

    try {
      if (typeof payload === 'string') {
        return JSON.parse(payload);
      }

      return payload;
    } catch (e) {
      return null;
    }
  }
}
