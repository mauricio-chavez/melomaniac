const axios = require('axios').default;
const qs = require('querystring');

class SpotifyClient {
  async authenticate(clientId, clientSecret) {
    if (!clientId || !clientSecret) {
      throw new Error('Client ID or Client Secret are missing');
    }
    const clientSecrets = `${clientId}:${clientSecret}`;
    const encodedSecret = Buffer.from(clientSecrets).toString('base64');
    const requestData = qs.stringify({
      grant_type: 'client_credentials',
    });

    const config = {
      headers: {
        Authorization: `Basic ${encodedSecret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    const { data } = await axios.post(
      'https://accounts.spotify.com/api/token',
      requestData,
      config
    );

    this.client = axios.create({
      baseURL: 'https://api.spotify.com/v1',
      timeout: 1000,
      headers: { Authorization: `Bearer ${data.access_token}` },
      params: params => {
        return qs.stringify(params, { offset: 0, limit: 12 });
      },
    });
  }

  async search(q) {
    const type = 'track';
    const limit = 1;

    const { data } = await this.client.get('/search', {
      params: { q, type, limit },
    });

    return data;
  }

  async analyzeTrack(id) {
    const { data } = await this.client.get(`/audio-features/${id}`);
    return data;
  }
}

module.exports = SpotifyClient;
