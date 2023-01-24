var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var homeRouter = require('./routes/home');
var cartRouter = require('./routes/cart');
var bookingsRouter = require('./routes/bookings');

var app = express();
var cors = require("cors")
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/home', homeRouter);
app.use('/cart', cartRouter);
app.use('/bookings', bookingsRouter);

module.exports = app;
