import Phaser from 'phaser';

export class VirtualJoystick {
  private scene: Phaser.Scene;
  private base: Phaser.GameObjects.Arc;
  private thumb: Phaser.GameObjects.Arc;
  private pointer: Phaser.Input.Pointer | null = null;
  
  private hitArea: Phaser.GameObjects.Arc;
  
  public x: number = 0;
  public y: number = 0;
  
  public radius: number = 80;
  
  public vector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    
    // Add a larger invisible hit area for the joystick
    this.hitArea = scene.add.circle(x, y, this.radius * 2, 0x000000, 0)
      .setDepth(999)
      .setScrollFactor(0)
      .setInteractive();

    this.base = scene.add.circle(x, y, this.radius, 0x050a15, 0.8)
      .setStrokeStyle(2, 0x00ffff, 0.5)
      .setDepth(1000)
      .setScrollFactor(0);

    this.thumb = scene.add.circle(x, y, this.radius * 0.5, 0x00ffff, 0.6)
      .setDepth(1001)
      .setScrollFactor(0);

    this.setPosition(x, y);

    this.hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.pointer = pointer;
      this.updateJoystick();
    });

    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.pointer && this.pointer.id === pointer.id) {
        this.updateJoystick();
      }
    });

    const release = (pointer: Phaser.Input.Pointer) => {
      if (this.pointer && this.pointer.id === pointer.id) {
        this.pointer = null;
        this.vector.set(0, 0);
        this.thumb.setPosition(this.x, this.y);
      }
    };

    scene.input.on('pointerup', release);
    scene.input.on('pointerupoutside', release);
  }

  public setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.base.setPosition(x, y);
    this.hitArea.setPosition(x, y);
    if (!this.pointer) {
      this.thumb.setPosition(x, y);
    }
  }

  private updateJoystick() {
    if (!this.pointer) return;
    
    const dx = this.pointer.x - this.x;
    const dy = this.pointer.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    const maxDist = this.radius;
    
    if (dist <= maxDist) {
      this.thumb.setPosition(this.pointer.x, this.pointer.y);
      this.vector.set(dx / maxDist, dy / maxDist);
    } else {
      const angle = Math.atan2(dy, dx);
      this.thumb.setPosition(
        this.x + Math.cos(angle) * maxDist,
        this.y + Math.sin(angle) * maxDist
      );
      this.vector.set(Math.cos(angle), Math.sin(angle));
    }
  }

  public setCamera(camera: Phaser.Cameras.Scene2D.Camera) {
    // Only render on specific camera if needed
    // this.base.cameras = [camera];
    // this.thumb.cameras = [camera];
  }

  public destroy() {
    this.base.destroy();
    this.thumb.destroy();
    this.hitArea.destroy();
  }
}
