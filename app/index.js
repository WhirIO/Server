'use strict';


require('attract')({ basePath: __dirname });
const [
    express,
    expressWS,
    server,
    router,
    models
] = attract('express', 'express-ws', 'controllers/server', 'router', 'models');
const app = express();
const wss = expressWS(app).getWss();
models.on('error', error => {
    console.error(error);
    process.exit();
});

models.on('loaded', () => {

    server.start(wss);
    app.locals.wss = wss;
    app.use(
        (req, res, next) => {
            res.setHeader('X-POWERED-BY', 'analogbird.com');
            next();
        },
        router(express)
    );

    app.listen(process.env.PORT, () => console.log(`Listening: ${process.env.PORT}`));
});

models.load();
