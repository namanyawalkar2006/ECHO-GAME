import Phaser, { Scene } from 'phaser';

export class GameOver extends Scene {
  constructor() {
    super('GameOver');
  }

  create(data: { level: number }) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Glitch effect on background
    this.cameras.main.shake(500, 0.01);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x1a0000, 0.8);
    bg.fillRect(0, 0, 4000, 4000);

    const container = this.add.container(width / 2, height / 2);

    const title = this.add.text(0, -80, 'ECHO FOUND YOU', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#ff0044',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, 0, 'It predicted your next move.', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffaaaa'
    }).setOrigin(0.5);

    const retryBtn = this.add.text(0, 80, '[ RETRY LEVEL ]', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('Play', { level: data.level });
      })
      .on('pointerover', () => retryBtn.setColor('#00ffff'))
      .on('pointerout', () => retryBtn.setColor('#ffffff'));

    const menuBtn = this.add.text(0, 130, '[ MAIN MENU ]', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('MainMenu');
      })
      .on('pointerover', () => menuBtn.setColor('#ffffff'))
      .on('pointerout', () => menuBtn.setColor('#aaaaaa'));

    container.add([title, subtitle, retryBtn, menuBtn]);

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      container.setPosition(gameSize.width / 2, gameSize.height / 2);
    }, this);
  }
}
