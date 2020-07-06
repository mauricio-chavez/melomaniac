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


const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on PORT ${server.address().port}`);
});
