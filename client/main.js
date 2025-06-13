// === CONFIGURATION ===
const SERVER_URL = "wss://de-fra-4204ac69.colyseus.cloud";

// === INIT PHASER ===
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#222",
    physics: { default: 'arcade' },
    scene: { preload, create, update }
};
const game = new Phaser.Game(config);

let cursors;
let client;
let room;
let playerId;
let players = {}; // {id: sprite}

function preload() {
    // Optionnel: charge des assets ici si besoin
}

function create() {
    cursors = this.input.keyboard.createCursorKeys();

    // Connexion à Colyseus Cloud
    client = new Colyseus.Client(SERVER_URL);

    client.joinOrCreate("world").then(r => {
        room = r;
        playerId = room.sessionId;
        console.log("Connected!", playerId);

        // Ajout des joueurs existants (état initial)
        Object.entries(room.state.players).forEach(([id, player]) => {
            addOrUpdatePlayer(this, id, player);
        });

        // Mise à jour de l'état complet
        room.state.players.onAdd = (player, id) => {
            addOrUpdatePlayer(this, id, player);
        };
        room.state.players.onRemove = (player, id) => {
            if (players[id]) {
                players[id].destroy();
                delete players[id];
            }
        };
        // Déplacement des joueurs
        room.state.players.onChange = (player, id) => {
            addOrUpdatePlayer(this, id, player);
        };

    }).catch(err => {
        console.error("Failed to connect:", err);
    });
}

function update() {
    if (!room) return;

    let input = { x: 0, y: 0 };
    if (cursors.left.isDown) input.x = -1;
    if (cursors.right.isDown) input.x = 1;
    if (cursors.up.isDown) input.y = -1;
    if (cursors.down.isDown) input.y = 1;

    // Envoie l'input uniquement si bougé
    if (input.x !== 0 || input.y !== 0) {
        room.send("move", input);
    }
}

// Ajoute ou met à jour un joueur
function addOrUpdatePlayer(scene, id, player) {
    if (!players[id]) {
        // Crée un sprite si pas encore là
        let color = id === playerId ? 0xff5555 : 0x55aaff;
        let sprite = scene.add.rectangle(player.x, player.y, 32, 32, color);
        players[id] = sprite;
    }
    players[id].x = player.x;
    players[id].y = player.y;
}