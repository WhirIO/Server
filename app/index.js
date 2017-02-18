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

/**
 * Pre-load all existing models so they are available everywhere else
 * in the application.
 * If loading succeeds, then continue loading the rest of the application.
 * This initial load relies on a synchronous call, only acceptable at boot time.
 * @see models/index.js
 */
models.on('loaded', () => {

    server.start(wss);
    app.locals.wss = wss;
    app.use(
        (req, res, next) => {
            res.setHeader('X-POWERED-BY', 'analogbird.com');
            next();
        },
        router(express),
        (req, res) => res.sendStatus(404).end()
    );

    app.listen(process.env.PORT, () => console.log(`Listening: ${process.env.PORT}`));
});

models.load();
