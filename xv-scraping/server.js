var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cors = require('cors');
var errorhandler = require('errorhandler')

var app = express();

//#region Cors
app.use(cors());
//#endregion

//#region Body Parser
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }));
//#endregion

//#region Routers
var indexRouter = require('./src/routes/index');
var searchRouter = require('./src/routes/search');
var pornstarsRouter = require('./src/routes/pornstars');
var actressesRouter = require('./src/routes/actresses');
var amateursRouter = require('./src/routes/amateurs');
var eroticModelsRouter = require('./src/routes/eroticModels');
var webCamModels = require('./src/routes/webcam');
var channels = require('./src/routes/channels');
var profileModels = require('./src/routes/profileModels');
var videosRouter = require('./src/routes/videos');

app.use('/api/v1', indexRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/pornstars', pornstarsRouter);
app.use('/api/v1/actresses', actressesRouter);
app.use('/api/v1/amateurs', amateursRouter);
app.use('/api/v1/erotic-models', eroticModelsRouter);
app.use('/api/v1/webcam-models', webCamModels);
app.use('/api/v1/channels', channels);
app.use('/api/v1/profile-models', profileModels);
app.use('/api/v1/videos', videosRouter);
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

//#region Listen Port
var porta = process.env.PORTA || 2001;
app.listen(porta, () => {
    console.log(`Server is running on port ${porta}... - link => http://localhost:${porta} `);
});
//#endregion