import Phaser from 'phaser';

export class AbilityButton {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Arc;
  private text: Phaser.GameObjects.Text;
  
  public x: number = 0;
  public y: number = 0;
  public radius: number = 40;
  
  private onClick: () => void;

  constructor(scene: Phaser.Scene, x: number, y: number, label: string, color: number, onClick: () => void) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.onClick = onClick;

    this.container = scene.add.container(x, y)
      .setDepth(1000)
      .setScrollFactor(0);

    this.bg = scene.add.circle(0, 0, this.radius, 0x050a15, 0.8)
      .setStrokeStyle(2, color, 0.8)
      .setInteractive({ useHandCursor: true });

    this.text = scene.add.text(0, 0, label, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.container.add([this.bg, this.text]);

    this.bg.on('pointerdown', () => {
      // Scale down animation
      scene.tweens.add({
        targets: this.container,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 50,
        yoyo: true
      });
      this.onClick();
    });
  }

  public setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.container.setPosition(x, y);
  }

  public setCooldown(isCooldown: boolean) {
    if (isCooldown) {
      this.bg.setAlpha(0.3);
      this.text.setAlpha(0.3);
    } else {
      this.bg.setAlpha(1);
      this.text.setAlpha(1);
    }
  }

  public shake() {
    this.scene.tweens.add({
      targets: this.container,
      x: this.container.x + 5,
      duration: 50,
      yoyo: true,
      repeat: 3
    });
  }

  public destroy() {
    this.container.destroy();
  }
}
