const serverUrl = "wss://de-fra-4204ac69.colyseus.cloud";
const roomName = "world";
let room;
let playerId;
let players = {}; // Liste de tous les sprites joueurs

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#111",
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('player', 'https://i.imgur.com/1Xw1hBM.png'); // exemple de sprite
}

function create() {
    // Connexion Colyseus
    const client = new Colyseus.Client(serverUrl);

    client.joinOrCreate(roomName).then(r => {
        room = r;
        playerId = room.sessionId;

        // Ajout des joueurs déjà présents (MAPSCHEMA !)
        room.state.players.forEach((player, sessionId) => {
            addPlayerSprite(this, sessionId, player);
        });

        // Nouveaux joueurs
        room.state.players.onAdd = (player, sessionId) => {
            addPlayerSprite(this, sessionId, player);
        };

        // Suppression joueur
        room.state.players.onRemove = (player, sessionId) => {
            if (players[sessionId]) {
                players[sessionId].destroy();
                delete players[sessionId];
            }
        };

        // Mouvement joueurs
        room.state.players.onChange = (player, sessionId) => {
            if (players[sessionId]) {
                players[sessionId].x = player.x;
                players[sessionId].y = player.y;
            }
        };

        // Gère le tactile (mobile & desktop)
        this.input.on('pointerdown', pointer => {
            moveTo(pointer.worldX, pointer.worldY);
        });
        this.input.on('pointermove', pointer => {
            if (pointer.isDown) moveTo(pointer.worldX, pointer.worldY);
        });

        // Flèches clavier
        this.cursors = this.input.keyboard.createCursorKeys();
    });

    // Méthode pour déplacer son joueur
    function moveTo(x, y) {
        if (room && playerId) {
            room.send({ x, y });
        }
    }
}

function addPlayerSprite(scene, sessionId, player) {
    let tint = (sessionId === playerId) ? 0xffaaaa : 0xaaaaff;
    let sprite = scene.add.sprite(player.x || 100, player.y || 100, 'player');
    sprite.setTint(tint);
    players[sessionId] = sprite;
}

function update() {
    // Contrôle au clavier aussi
    if (this.cursors && room && playerId) {
        let speed = 2;
        let moved = false;
        let p = room.state.players.get(playerId);
        if (!p) return;

        let x = p.x, y = p.y;
        if (this.cursors.left.isDown)  { x -= speed; moved = true; }
        if (this.cursors.right.isDown) { x += speed; moved = true; }
        if (this.cursors.up.isDown)    { y -= speed; moved = true; }
        if (this.cursors.down.isDown)  { y += speed; moved = true; }

        if (moved) {
            room.send({ x, y });
        }
    }
}