window.onload = () => {
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
      preload,
      create,
      update
    }
  };

  const game = new Phaser.Game(config);

  function preload() {
    this.load.image("player", "https://labs.phaser.io/assets/sprites/phaser-dude.png");
  }

  function create() {
    this.player = this.add.sprite(400, 300, "player");
    connectToRoom(); // Connexion réseau ici
  }

  function update() {
    // futur mouvement, synchro, etc.
  }
};