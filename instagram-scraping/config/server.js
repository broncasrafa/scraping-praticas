var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var errorhandler = require('errorhandler');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
//var cors = require('cors');

var isProduction = process.env.NODE_ENV === 'production';

var app = express();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/* setar as variáveis 'view engine' e 'views' do express */
app.set('view engine', 'ejs');
app.set('views', './app/views');

/* configurar o middleware express.static */
app.use(express.static('./app/public'));

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }));

app.use(cookieParser());

app.use(function(req, res, next) {

    res.setHeader("Access-Control-Allow-Origin", "*"); // habilita requisições cross-domain (dominios diferentes)
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // vai pre-configurar (indicar) os métodos que a origem pode requisitar
    res.setHeader("Access-Control-Allow-Headers", "content-type"); // vai habilitar que a requisição efetuada pela origem tenha cabeçalhos reescritos
    res.setHeader("Access-Control-Allow-Credentials", true);
    // função que pode ser executada para dar continuidade no fluxo de processamento
    next(); 
});

//app.use(cors());

// rotas
var indexRoute = require('../app/routes/index');

app.use('/', indexRoute);







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

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
    app.use(function (err, req, res, next) {
        console.log(err.stack);

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

module.exports = app;