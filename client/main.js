const client = new Colyseus.Client("https://de-fra-376a75b9.colyseus.cloud");

let room;
let players = {}; // stocke les sprites Phaser par sessionId

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update,
  }
};

const game = new Phaser.Game(config);

function preload() {
  // Rien à charger pour cet exemple simple
}

function create() {
  connectToRoom();
}

function update() {
  if (!room) return;

  // Exemple : déplacement simple clavier avec flèches
  const cursors = this.input.keyboard.createCursorKeys();

  let playerX = players[room.sessionId]?.x || 100;
  let playerY = players[room.sessionId]?.y || 100;

  if (cursors.left.isDown) playerX -= 2;
  else if (cursors.right.isDown) playerX += 2;
  if (cursors.up.isDown) playerY -= 2;
  else if (cursors.down.isDown) playerY += 2;

  if (room && players[room.sessionId]) {
    // Envoie la nouvelle position au serveur
    room.send("move", { x: playerX, y: playerY });
  }
}

async function connectToRoom() {
  try {
    room = await client.joinOrCreate("world");
    console.log("✅ Connecté à la room", room.sessionId);

    // Crée un cercle Phaser pour chaque joueur dans l’état
    room.state.players.onAdd = (player, sessionId) => {
      // création d’un cercle pour le joueur
      players[sessionId] = this.add.circle(player.x, player.y, 16, 0x00ff00);
      if (sessionId === room.sessionId) {
        players[sessionId].setFillStyle(0x0000ff); // couleur différente pour soi
      }
    };

    room.state.players.onChange = (player, sessionId) => {
      // met à jour la position du sprite
      if (players[sessionId]) {
        players[sessionId].x = player.x;
        players[sessionId].y = player.y;
      }
    };

    room.state.players.onRemove = (player, sessionId) => {
      // détruit le sprite quand le joueur quitte
      if (players[sessionId]) {
        players[sessionId].destroy();
        delete players[sessionId];
      }
    };

    room.onMessage((message) => {
      console.log("📩 Message reçu :", message);
    });

  } catch (e) {
    console.error("❌ Erreur de connexion :", e);
  }
}
