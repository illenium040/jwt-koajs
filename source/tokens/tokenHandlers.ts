import { IAccessToken, IAccessTokenData, AccessToken, RefreshToken, IVerifiedAccessTokenJWT } from './secureTokens';
import * as JWT from 'jsonwebtoken';
import base64url from 'base64url';
import * as Crypto from 'crypto';

export interface IRefreshTokenHandler {
    encode(accessToken: IAccessToken): RefreshToken;
    checkAccessToken(refreshToken: string, accessToken: string): boolean;
}

export interface IAccessTokenHandler {
    encode<TData extends IAccessTokenData>(data: TData, secret: string): IAccessToken;
    decode<TData extends IAccessTokenData>(accessToken: IAccessToken): TData;
}

export class AccessTokenJWTHandler implements IAccessTokenHandler {
    public encode<TData extends IAccessTokenData>(data: TData, secret: string): IAccessToken {
        const encodedToken = JWT.sign({ data: data }, secret, { algorithm: 'HS512' });
        return new AccessToken(encodedToken, secret);
    }

    public decode<TData extends IAccessTokenData>(accessToken: IAccessToken): TData {
        try {
            return <TData>(<IVerifiedAccessTokenJWT>JWT.verify(accessToken.value, accessToken.secret)).data;
        } catch (err) {
            throw new Error(`Can't verify access token. Error message: ${err.message}`);
        }
    }
}

export class RefreshTokenHandler implements IRefreshTokenHandler {
    public encode(accessToken: IAccessToken): RefreshToken {
        const encrypted = base64url(Crypto.randomBytes(18)) + accessToken.value.substr(-6);
        return new RefreshToken(encrypted);
    }

    public checkAccessToken(refreshToken: string, accessToken: string): boolean {
        return accessToken.substr(-6) == refreshToken.substr(-6);
    }
}