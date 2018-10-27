var express = require('express');
var bodyParser = require('body-parser');
var app = express();


process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/* setar as variáveis 'view engine' e 'views' do express */
app.set('view engine', 'ejs');
app.set('views', './app/views');

/* configurar o middleware express.static */
app.use(express.static('./app/public'));

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }));

// rotas
var indexRoute = require('../app/routes/index');
var downloadRoute = require('../app/routes/download');

app.use('/', indexRoute);
app.use('/download', downloadRoute);



module.exports = app;