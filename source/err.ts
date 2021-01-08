import Koa from 'koa';

export default async (ctx: Koa.BaseContext, next: Koa.Next) => {
    try {
        await next();
    } catch (err) {
        // will only respond with JSON
        ctx.status = err.statusCode || err.status || 500;
        ctx.body = {
            message: err.message
        };
    }
};