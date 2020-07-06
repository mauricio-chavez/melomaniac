const { MessengerClient } = require('messaging-api-messenger');

const client = MessengerClient.connect(process.env.MESSENGER_ACCESS_TOKEN);

client.setPersistentMenu([
  {
    locale: 'default',
    call_to_actions: [
      {
        title: 'Empezar de nuevo',
        type: 'postback',
        payload: 'RESTART',
      },
    ],
  },
]);
