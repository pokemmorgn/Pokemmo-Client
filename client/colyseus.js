const client = new Colyseus.Client("https://de-fra-4204ac69.colyseus.cloud");

let room;

async function connectToRoom() {
  try {
    room = await client.joinOrCreate("world");
    console.log("✅ Connecté à la room", room.sessionId);

    room.onMessage((message) => {
      console.log("📩 Message reçu :", message);
    });

  } catch (e) {
    console.error("❌ Erreur de connexion :", e);
  }
}