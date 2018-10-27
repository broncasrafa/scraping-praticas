/* importar o módulo do framework express */
var express = require('express');

/* importar o módulo do consign */
//var consign = require('consign');

/* importar o módulo do body-parser */
var bodyParser = require('body-parser');

/* importar o módulo do express-validator */
var expressValidator = require('express-validator');

/* importar o módulo do error-handler */
var errorhandler = require('errorhandler')

/* iniciar o objeto do express */
var app = express();

/* setar as variáveis 'view engine' e 'views' do express */
app.set('view engine', 'ejs');
app.set('views', './app/views');

/* configurar o middleware express.static */
app.use(express.static('./app/public'));

/* configurar o middleware body-parser */
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }));

/* configurar o middleware express-validator */
app.use(expressValidator());

/* efetua o autoload das rotas, dos models e dos controllers para o objeto app */
// consign()
// 	.include('app/routes')
// 	.then('app/models')
// 	.then('app/controllers')
// 	.into(app);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//#region Rotas
var pornstarRoute = require('../app/routes/pornstars');
var collectionsRoute = require('../app/routes/collections');
var videosRouter = require('../app/routes/videos');
var categoriesRouter = require('../app/routes/categories');
var brandsRouter = require('../app/routes/brands');
var tracksRouter = require('../app/routes/tracks');
var highlightsRouter = require('../app/routes/highlights');
var bannersRouter = require('../app/routes/banners');
var searchRouter = require('../app/routes/search');

app.use('/api/v1/stars', pornstarRoute);
app.use('/api/v1/collections', collectionsRoute);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/videos', videosRouter);
app.use('/api/v1/brands', brandsRouter);
app.use('/api/v1/highlights', highlightsRouter);
app.use('/api/v1/tracks', tracksRouter);
app.use('/api/v1/banners', bannersRouter);
app.use('/api/v1/search', searchRouter);
//#endregion

//#region Errors
var isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
    app.use(errorhandler());
}

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
    // next(createError(404));
});

// development error handler
// will print stacktrace
if (!isProduction) {
    app.use(function (err, req, res, next) {
		//console.log(err.stack);
		console.log(err.message);
        res.status(err.status || 500).json({
            'errors': {
                message: err.message,
                error: err
            }
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500).json({
        'errors': {
            message: err.message,
            error: {}
        }
    });
});
//#endregion

/* exportar o objeto app */
module.exports = app;