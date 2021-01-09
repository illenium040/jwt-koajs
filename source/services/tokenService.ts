import { UserTokenModel } from '../models/userTokens';
import { IAccessTokenData } from '../tokens/secureTokens';
import { ITokensManager } from './tokenServiceBuilder';
import Cookies from 'cookies';
import { ITokensPair, ITokensBody } from '../tokens/tokenStorage';


export class TokenService {

    private readonly _cookieName: string;
    private _secret: string;
    private _tokensManager: ITokensManager;

    public constructor(tokensManager: ITokensManager) {
        this._tokensManager = tokensManager;
        this._secret = <string>process.env.SECRET;
        this._cookieName = "jwt_accesstoken";
    }

    /**
    *Cookie name for access token. Can be used to get access token string from context cookies.
    *@return access token cookie name.
    */
    public get cookieName(): string {
        return this._cookieName;
    }

    /**
    *Create tokens. If tokens was created for current user_guid return an exception.
    *@param userGuid user_guid from uri query string.
    *@return access and refresh token pair.
    */
    public async createTokens(userGuid: string): Promise<ITokensPair> {
        if (await UserTokenModel.findOne({ userGuid: userGuid }) != null)
            throw new Error("Tokens are already created");

        return this.generateTokensPair({ userGuid });
    }

    /**
    *Update access and refresh token.
    *Access token must be connected with refresh token and refresh token have to be the same as in database.
    *@param accessTokenFromCookie access token from context cookies.
    *@param refreshTokenfromQuery refresh token from uri query string.
    *@return if validation is successful return new pair of access and refresh tokens.
    */
    public async updateTokens(accessTokenFromCookie: string, refreshTokenfromQuery: string): Promise<ITokensPair> {
        try {
            if (!this._tokensManager.refreshTokenHandler.checkAccessToken(refreshTokenfromQuery, accessTokenFromCookie))
                throw new Error("Wrong refresh token for current access token");

            const data = this._tokensManager.accessTokenHandler
                .decode({ secret: this._secret, value: accessTokenFromCookie });

            const isRefreshTokenValid = await this._tokensManager.tokensStorage
                .isValid(data.userGuid, { value: refreshTokenfromQuery });

            if (!isRefreshTokenValid)
                throw new Error("Wrong refresh token for current access token. Cheked by db hash");

            return this.generateTokensPair(data);
        } catch (err) {
            throw new Error(`Failed while updating tokens. Msg: ${err.message}`);
        }
    }

    /**
    *Save refresh token to database and access token to cookies.
    *@param tokens tokens to save.
    *@param cookies context cookies instance.
    *@return tokens values.
    */
    public async saveTokens(tokens: ITokensPair, cookies: Cookies): Promise<ITokensBody> {
        return await this._tokensManager.tokensStorage.saveTokens(tokens, cookies, this._cookieName);
    }

    /**
    *Update refresh token in database and access token in cookies.
    *@param tokens tokens to update.
    *@param cookies context cookies instance.
    *@return tokens values.
    */
    public async updateStorage(tokens: ITokensPair, cookies: Cookies): Promise<ITokensBody> {
        return await this._tokensManager.tokensStorage.updateTokens(tokens, cookies, this._cookieName);
    }

    private generateTokensPair(data: IAccessTokenData): ITokensPair {
        try {
            const accessToken = this._tokensManager
                .accessTokenHandler
                .encode(data, this._secret);

            const refreshToken = this._tokensManager
                .refreshTokenHandler
                .create(accessToken);

            return { accessToken, refreshToken, userGuid: data.userGuid };
        } catch (err) {
            throw new Error(`Failed while generating tokens. Msg: ${err.message}`);
        }
    }

}