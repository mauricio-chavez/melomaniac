const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const webhookRouter = require('./routes/webhook');
const { spotifyMiddleware } = require('./middleware');

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(spotifyMiddleware);

app.use('/webhook', webhookRouter);

module.exports = app
