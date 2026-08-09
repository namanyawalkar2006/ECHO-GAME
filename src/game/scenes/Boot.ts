import Phaser, { Scene } from 'phaser';

export class Boot extends Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Generate minimal assets programmatically
    
    // Player - a small glowing cyan triangle or circle
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1);
    graphics.beginPath();
    graphics.moveTo(10, 0);
    graphics.lineTo(20, 20);
    graphics.lineTo(0, 20);
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture('player', 20, 20);
    graphics.clear();
    
    // Wall / Obstacle - dark blue rect
    graphics.fillStyle(0x0a1a2f, 1);
    graphics.lineStyle(2, 0x1a3a5f);
    graphics.fillRect(0, 0, 40, 40);
    graphics.strokeRect(0, 0, 40, 40);
    graphics.generateTexture('wall', 40, 40);
    graphics.clear();
    
    // Exit - glowing portal
    graphics.fillStyle(0x00ffaa, 0.8);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('exit', 40, 40);
    graphics.clear();
    
    // Shard - glowing diamond
    graphics.fillStyle(0xffaa00, 1);
    graphics.beginPath();
    graphics.moveTo(10, 0);
    graphics.lineTo(20, 10);
    graphics.lineTo(10, 20);
    graphics.lineTo(0, 10);
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture('shard', 20, 20);
    graphics.clear();
    
    // Hunter - shadow glitch entity
    graphics.fillStyle(0x2a0a2f, 0.9);
    graphics.fillCircle(15, 15, 15);
    graphics.fillStyle(0x00ffff, 1);
    graphics.fillRect(10, 10, 10, 10);
    graphics.generateTexture('hunter', 30, 30);
    graphics.clear();
    
    // Hazard - red spike or laser
    graphics.fillStyle(0xff0044, 1);
    graphics.fillRect(0, 0, 20, 20);
    graphics.generateTexture('hazard', 20, 20);
    graphics.clear();
  }

  create() {
    this.scene.start('MainMenu');
  }
}
