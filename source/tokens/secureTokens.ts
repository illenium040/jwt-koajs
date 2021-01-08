import { Token, IToken } from './token';

export interface IVerifiedAccessTokenJWT {
    exp: number;
    iat: number;
    data: IAccessTokenData;
}

export interface IAccessTokenData {
    userGuid: string;
}

export interface IAccessToken extends IToken {
    readonly secret: string;
}

export interface IRefreshToken extends IToken {

}

export class AccessToken extends Token implements IAccessToken {
    private _secret: string;
    public constructor(value: string, secret: string, expiresIn?: string | number) {
        super(value, expiresIn);
        this._secret = secret;
    }

    public get secret(): string {
        return this._secret;
    }
}

export class RefreshToken extends Token implements IRefreshToken {
    public constructor(value: string, expiresIn?: string | number) {
        super(value, expiresIn);
    }
}