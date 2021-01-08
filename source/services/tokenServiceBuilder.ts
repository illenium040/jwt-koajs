import { TokenService } from './tokenService';
import { IAccessTokenHandler, IRefreshTokenHandler, AccessTokenJWTHandler, RefreshTokenHandler } from '../tokens/tokenHandlers';
import { TokenStorage, ITokensStorage } from '../tokens/tokenStorage';

export interface ITokensManager {
    accessTokenHandler: IAccessTokenHandler;
    refreshTokenHandler: IRefreshTokenHandler;
    tokensStorage: ITokensStorage;
}

export class TokenServiceBuidler {

    private _accessTokenHandler!: IAccessTokenHandler;
    private _refreshTokenHandler!: IRefreshTokenHandler;
    private _tokensStorage!: ITokensStorage;

    public build(useDefaultIfNull: boolean = false): TokenService {
        if (useDefaultIfNull)
            return new TokenService({
                accessTokenHandler: this._accessTokenHandler ?? new AccessTokenJWTHandler(),
                refreshTokenHandler: this._refreshTokenHandler ?? new RefreshTokenHandler(),
                tokensStorage: this._tokensStorage ?? new TokenStorage()
            } as ITokensManager);

        if (!this._accessTokenHandler)
            throw new Error("_accessTokenHandler instance is null");
        if (!this._refreshTokenHandler)
            throw new Error("_refreshTokenHandler instance is null");
        if (!this._tokensStorage)
            throw new Error("_tokensChecking instance is null");

        return new TokenService({
            accessTokenHandler: this._accessTokenHandler,
            refreshTokenHandler: this._refreshTokenHandler,
            tokensStorage: this._tokensStorage
        } as ITokensManager);
    }

    public addAccessTokenHandler<THandler extends IAccessTokenHandler>(generator: THandler): TokenServiceBuidler {
        this._accessTokenHandler = generator;
        return this;
    }

    public addRefreshTokenHandler<THandler extends IRefreshTokenHandler>(generator: THandler): TokenServiceBuidler {
        this._refreshTokenHandler = generator;
        return this;
    }

    public addTokensStorage<TStorage extends ITokensStorage>(checking: TStorage): TokenServiceBuidler {
        this._tokensStorage = checking;
        return this;
    }


}