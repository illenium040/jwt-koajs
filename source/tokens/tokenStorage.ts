import Cookies from 'cookies';
import { UserTokenModel } from '../models/userTokens';
import { IAccessToken, IRefreshToken } from './secureTokens';

export interface ITokensPair {
    readonly userGuid: string;
    accessToken: IAccessToken;
    refreshToken: IRefreshToken;
}

export interface ITokensBody {
    accessToken: string;
    refreshToken: string;
}


export interface ITokensStorage {
    storeTokens(tokens: ITokensPair, cookies: Cookies, cookieName: string): Promise<ITokensBody>;
    updateTokens(tokens: ITokensPair, cookies: Cookies, cookieName: string): Promise<ITokensBody>;
    isValid(userGuid: string, refreshToken: IRefreshToken): Promise<boolean>;
}

export class TokenStorage implements ITokensStorage {
    public async storeTokens(tokens: ITokensPair, cookies: Cookies, cookieName: string): Promise<ITokensBody> {
        this.storeAction(UserTokenModel.saveToken(tokens.userGuid, tokens.refreshToken));
        await cookies.set(cookieName, tokens.accessToken.value);
        return this.getTokensBody(tokens);
    }

    public async updateTokens(tokens: ITokensPair, cookies: Cookies, cookieName: string): Promise<ITokensBody> {
        this.storeAction(UserTokenModel.updateToken(tokens.userGuid, tokens.refreshToken));
        await cookies.set(cookieName, tokens.accessToken.value);
        return this.getTokensBody(tokens);
    }

    public async isValid(userGuid: string, refreshToken: IRefreshToken): Promise<boolean> {
        return await UserTokenModel.bcryptCompare(userGuid, refreshToken);
    }

    private async storeAction(action: Promise<void>): Promise<void> {
        try {
            await action;
        } catch (err) {
            throw new Error(err.message);
        }
    }

    private getTokensBody(tokens: ITokensPair): ITokensBody {
        return {
            accessToken: tokens.accessToken.value,
            refreshToken: tokens.refreshToken.value
        };
    }
}


