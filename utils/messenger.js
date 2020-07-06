const { MessengerClient } = require('messaging-api-messenger');

// Handles messages events
async function handleMessage(userId, message, spotifyClient) {
  const messengerClient = MessengerClient.connect(
    process.env.MESSENGER_ACCESS_TOKEN
  );

  messengerClient.markSeen(userId);
  messengerClient.typingOn(userId);

  if (!message.text) {
    messengerClient.typingOff(userId);
  } else {
    const data = await spotifyClient.search(message.text);
    const track = data.tracks.items[0];
    messengerClient.typingOff(userId);
    await messengerClient.sendAudio(userId, track.preview_url);
    await messengerClient.sendButtonTemplate(userId, '¿Es esta canción?', [
      {
        type: 'postback',
        title: 'Sí 🤩',
        payload: `CONFIRM ${track.id}`,
      },
      {
        type: 'postback',
        title: 'No 😔',
        payload: 'DECLINE',
      },
    ]);

  }
}

// Handles messaging_postbacks events
async function handlePostback(userId, postback, spotifyClient) {
  const messengerClient = MessengerClient.connect(
    process.env.MESSENGER_ACCESS_TOKEN
  );
  messengerClient.markSeen(userId);
  messengerClient.typingOn(userId);
  switch (postback.payload) {
    case 'GET_STARTED':
      await greet(messengerClient, userId);
      break;
    case 'RESTART':
      await greet(messengerClient, userId);
      break;
    case 'NO_RESTART':
      await messengerClient.sendText(userId, '¡Cuídate! Adiós. 👋🏻');
      break;
    case 'DECLINE':
      await messengerClient.sendText(
        userId,
        'Lo sentimos mucho. Trabajaremos en solucionarlo. 👨🏻‍💻'
      );
      await askForRestart(messengerClient, userId);
      break;
    default:
      if (postback.payload.startsWith('CONFIRM')) {
        const trackId = postback.payload.substring(8);
        const analysis = await spotifyClient.analyzeTrack(trackId);

        // Acousticness
        if (analysis.acousticness === 1.0) {
          await messengerClient.sendText(
            userId,
            'Parece que la pista es acústica. 🎶'
          );
        } else if (analysis.acousticness >= 0.5) {
          await messengerClient.sendText(
            userId,
            'La pista parece que tiende a ser acústica. 🎶'
          );
        } else {
          await messengerClient.sendText(
            userId,
            'Esta pista no parece ser acústica. 🎶'
          );
        }

        // Danceability
        if (analysis.danceability >= 0.8) {
          await messengerClient.sendText(userId, '¡Es súper bailable! 💃🏻💃🏻');
        } else if (analysis.danceability >= 0.5) {
          await messengerClient.sendText(userId, 'Es considerada bailable. 💃🏻');
        } else {
          await messengerClient.sendText(userId, 'No es muy bailable. 🤷🏻‍♀️');
        }

        // TODO add duration analysis

        // Energy
        if (analysis.energy >= 0.8) {
          await messengerClient.sendText(
            userId,
            '¡Transmite demasiada energía! ⚡️⚡️'
          );
        } else if (analysis.energy >= 0.5) {
          await messengerClient.sendText(
            userId,
            'Transmite bastante energía. ⚡️'
          );
        } else {
          await messengerClient.sendText(
            userId,
            'No transmite demasiada energía. 😴'
          );
        }

        // Instrumentalness
        if (analysis.instrumentalness === 1.0) {
          await messengerClient.sendText(userId, 'Es instrumental. 🎻🎻🎻');
        } else if (analysis.instrumentalness >= 0.5) {
          await messengerClient.sendText(
            userId,
            'La podemos considerar instrumental. 🎻🎻'
          );
        } else {
          await messengerClient.sendText(
            userId,
            'No es considerada instrumental. 🎻'
          );
        }

        // TODO check key of track (C, D...)

        // Liveness
        if (analysis.liveness >= 0.8) {
          await messengerClient.sendText(userId, '¡Está grabada en vivo! 🎸🎸');
        } else if (analysis.liveness >= 0.5) {
          await messengerClient.sendText(
            userId,
            'Puede que esté grabada en vivo. 🎸'
          );
        } else {
          await messengerClient.sendText(userId, 'No está grabada en vivo. 🎙');
        }

        // TODO check loudness
        // TODO check mode

        // Speechiness
        if (analysis.speechiness >= 0.66) {
          await messengerClient.sendText(
            userId,
            '¡Probablemente está enteramente hecha de palabras habladas! 🎤🎤🎤'
          );
        } else if (analysis.speechiness >= 0.33) {
          await messengerClient.sendText(
            userId,
            'Es una pista bastante vocal. 🎤🎤'
          );
        } else {
          await messengerClient.sendText(userId, 'No está conformada en su gran mayoría de vocales. 🎤');
        }

        // Tempo
        await messengerClient.sendText(
          userId,
          `Tiene un tempo aproximadamente de ${analysis.tempo} BPM. 🎵`
        );

        // Time Signature
        await messengerClient.sendText(
          userId,
          `Tiene aproximadamente ${analysis.time_signature} notas por compás. 🎶`
        );

        // Valence
        if (analysis.valence >= 0.8) {
          await messengerClient.sendText(userId, '¡Además es muy alegre! 😌');
        } else if (analysis.valence >= 0.5) {
          await messengerClient.sendText(
            userId,
            'Y la podemos considerar positiva. 😉'
          );
        } else {
          await messengerClient.sendText(
            userId,
            'Y puede que sea algo triste o negativa. 😞'
          );
        }
      }

      messengerClient.typingOn(userId);
      setTimeout(async () => {
        await askForRestart(messengerClient, userId);
      }, 1500)

      break;
  }
}

async function greet(client, userId) {
  const { first_name } = await client.getUserProfile(userId);
  await client.sendText(
    userId,
    `¡Hola, ${first_name}! ¿Qué canción quieres que analice?`
  );
  await client.sendText(userId, `Envíame únicamente el título de la canción.`);
}

async function askForRestart(client, userId) {
  await client.sendButtonTemplate(userId, '¿Quieres volver a empezar?', [
    {
      type: 'postback',
      title: 'Sí 😎',
      payload: 'RESTART',
    },
    {
      type: 'postback',
      title: 'No, gracias.',
      payload: 'NO_RESTART',
    },
  ]);
}

module.exports = {
  handleMessage,
  handlePostback,
};
