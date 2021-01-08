import KoaBuilder from './source/main';
import * as Http from 'http';
new KoaBuilder().build().then((resolve) => {
    Http.createServer(resolve.callback()).listen(3000);
});
