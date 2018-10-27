var express = require('express');
var bodyParser = require('body-parser');

var app = express();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

app.set('view engine', 'ejs');
app.set('views', './app/views');

app.use(express.static('./app/public'));

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }));

var indexRoute = require('../app/routes/index');
var userRoute = require('../app/routes/user');
var searchRoute = require('../app/routes/search');
var downloadRoute = require('../app/routes/download');
var storyRouter = require('../app/routes/story');

app.use('/', indexRoute);
app.use('/user', userRoute);
app.use('/search', searchRoute);
app.use('/download', downloadRoute);
app.use('/story', storyRouter);

module.exports = app;