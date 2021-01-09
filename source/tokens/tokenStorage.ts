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
    /**
    *Save access and refresh tokens.
    *@param tokens tokens to save.
    *@param cookies context cookies instance.
    *@param cookieName access token cookie name.
    *@return tokens values.
    */
    saveTokens(tokens: ITokensPair, cookies: Cookies, cookieName: string): Promise<ITokensBody>;
    /**
    *Update access and refresh tokens.
    *@param tokens tokens to update.
    *@param cookies context cookies instance.
    *@param cookieName access token cookie name.
    *@return tokens values.
    */
    updateTokens(tokens: ITokensPair, cookies: Cookies, cookieName: string): Promise<ITokensBody>;
    /**
    *Check refresh token with hashed token in database by user_guid.
    *@param userGuid current user_guid.
    *@param refreshToken unhashed refresh token from client.
    *@return compare result.
    */
    isValid(userGuid: string, refreshToken: IRefreshToken): Promise<boolean>;
}

export class TokenStorage implements ITokensStorage {
    public async saveTokens(tokens: ITokensPair, cookies: Cookies, cookieName: string): Promise<ITokensBody> {
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


