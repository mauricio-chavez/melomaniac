const SpotifyClient = require('./utils/spotify');

exports.spotifyMiddleware = async function (req, res, next) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const client = new SpotifyClient();

  try {
    await client.authenticate(clientId, clientSecret);
    req.spotifyClient = client;
    next();
  } catch (e) {
    res.json({
      message: 'An error has ocurred',
      error: e.message,
    });
  }
};
