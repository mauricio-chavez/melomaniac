const { handleMessage, handlePostback } = require('./messenger');

function webhookHandler(webhookEvent, spotifyClient) {
  const senderPsid = webhookEvent.sender.id;
  if (webhookEvent.message) {
    handleMessage(senderPsid, webhookEvent.message, spotifyClient);
  } else if (webhookEvent.postback) {
    handlePostback(senderPsid, webhookEvent.postback, spotifyClient);
  }
}

module.exports = webhookHandler;
