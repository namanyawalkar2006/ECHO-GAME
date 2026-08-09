import Phaser, { Scene } from 'phaser';

export class MainMenu extends Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background particle effect
    const particles = this.add.particles(0, 0, 'shard', {
      x: { min: 0, max: 4000 },
      y: { min: 0, max: 4000 },
      lifespan: 3000,
      speed: { min: 10, max: 20 },
      alpha: { start: 0.1, end: 0 },
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD',
      frequency: 200,
    });

    const container = this.add.container(width / 2, height / 2);

    const title = this.add.text(0, -100, 'ECHO', {
      fontFamily: 'monospace',
      fontSize: '64px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const tagline = this.add.text(0, -30, 'The World Remembers How You Play', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#66aaaa'
    }).setOrigin(0.5);

    const controls = this.add.text(0, 50, 'Touch/Click & Drag to Move\nUse UI Buttons for Abilities', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#447777',
      align: 'center'
    }).setOrigin(0.5);

    const playButton = this.add.text(0, 150, '[ PLAY ]', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#ffffff'
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerover', () => playButton.setColor('#00ffff'))
    .on('pointerout', () => playButton.setColor('#ffffff'))
    .on('pointerdown', () => this.startGame());
    
    container.add([title, tagline, controls, playButton]);

    // Twinkle effect on title
    this.tweens.add({
      targets: title,
      alpha: 0.8,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      container.setPosition(gameSize.width / 2, gameSize.height / 2);
    }, this);
  }

  startGame() {
    this.scene.start('Play', { level: 1 });
  }
}
