import { IAccessToken, IAccessTokenData, AccessToken, RefreshToken, IVerifiedAccessTokenJWT } from './secureTokens';
import * as JWT from 'jsonwebtoken';
import base64url from 'base64url';
import * as Crypto from 'crypto';


export interface IRefreshTokenHandler {
    /**
    *Create refresh token by access token.
    *@param accessToken access token that used for connection with refresh token.
    *@return refresh token instance.
    */
    create(accessToken: IAccessToken): RefreshToken;
    /**
    *Check connection between tokens.
    *@param refreshToken refresh token value.
    *@param accessToken access token value.
    */
    checkAccessToken(refreshToken: string, accessToken: string): boolean;
}


export interface IAccessTokenHandler {
    /**
    *Encode some data to access token.
    *@param data data that will be ecoded.
    *@param secret some secret string to encode with.
    *@return access token instance.
    */
    encode<TData extends IAccessTokenData>(data: TData, secret: string): IAccessToken;
    /**
    *Decode access token.
    *@param accessToken access token instance.
    *@return decoded data.
    */
    decode<TData extends IAccessTokenData>(accessToken: IAccessToken): TData;
}

/**
*Encode and decode access token in JWT format.
*/
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

/**
*Create refresh token by access token in base64url format.
*Provides check function for tokens.
*/
export class RefreshTokenHandler implements IRefreshTokenHandler {
    public create(accessToken: IAccessToken): RefreshToken {
        const encrypted = base64url(Crypto.randomBytes(18)) + accessToken.value.substr(-6);
        return new RefreshToken(encrypted);
    }

    public checkAccessToken(refreshToken: string, accessToken: string): boolean {
        return accessToken.substr(-6) == refreshToken.substr(-6);
    }
}