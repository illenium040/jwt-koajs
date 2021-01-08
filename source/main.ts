import Koa from 'koa';
import json = require('koa-json');
import bodyParser = require('koa-bodyparser');
import Router = require('koa-router');
import * as Db from './db';
import * as Dotenv from 'dotenv';
import err from './err';
import { TokenServiceBuidler } from './services/tokenServiceBuilder';
import { TokenService } from './services/tokenService';


export default class KoaBuilder {
    private _koa: Koa;
    private _router: Router;
    private _tokenService: TokenService;
    public constructor() {
        this._koa = new Koa();
        this._router = new Router();
        //first init .env
        Dotenv.config();
        //then create service
        this._tokenService = new TokenServiceBuidler().build(true);
    }

    public async build(): Promise<Koa> {
        await Db.connect();
        this._router
            .get('/createTokens/:userguid', async (ctx, next) => {
                const tokens = await this._tokenService.createTokens(ctx.params["userguid"]);
                ctx.body = await this._tokenService.storeTokens(tokens, ctx.cookies);
            })
            .get('/updateTokens/:refreshtoken', async (ctx, next) => {
                const updatedTokens = await this._tokenService
                    .updateTokens(ctx.cookies.get(this._tokenService.cookieName)!, ctx.params["refreshtoken"]);
                ctx.body = await this._tokenService.updateStorage(updatedTokens, ctx.cookies);
            });

        this._koa.use(json())
            .use(err)
            .use(bodyParser())
            .use(this._router.allowedMethods())
            .use(this._router.routes());
        return this._koa;
    }
}