import Phaser, { Scene } from 'phaser';

export class Pause extends Scene {
  constructor() {
    super('Pause');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRect(0, 0, 4000, 4000);

    const container = this.add.container(width / 2, height / 2);

    const title = this.add.text(0, 0, 'PAUSED', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const sub = this.add.text(0, 50, 'Press ESC or tap here to Resume', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    container.add([title, sub]);

    this.input.keyboard!.on('keydown-ESC', () => this.resumeGame());
    this.input.on('pointerdown', () => this.resumeGame());

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      container.setPosition(gameSize.width / 2, gameSize.height / 2);
    }, this);
  }

  private resumeGame() {
    this.scene.stop();
    this.scene.get('Play').physics.resume();
    (this.scene.get('Play') as any).isPaused = false;
  }
}
