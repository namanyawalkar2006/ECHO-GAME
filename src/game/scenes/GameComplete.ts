import Phaser, { Scene } from 'phaser';
import { behaviorEngine } from '../systems/AdaptiveBehaviorEngine';

export class GameComplete extends Scene {
  constructor() {
    super('GameComplete');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const container = this.add.container(width / 2, height / 2);

    const msgs = [
      'BEHAVIOR ANALYSIS COMPLETE.',
      'ECHO LEARNED:',
      `Your path preference: ${behaviorEngine.getPathPreference() === 'balanced' ? 'indecisive' : behaviorEngine.getPathPreference() + ' bias'}`,
      `Your risk tolerance: ${behaviorEngine.getRiskScore()}%`,
      `Your predictability: ${behaviorEngine.getPredictability()}%`,
      'But you learned ECHO too.',
      'WHO WAS REALLY LEARNING?'
    ];
    
    let yPos = -120;
    
    const showMsg = (index: number) => {
      if (index >= msgs.length) {
        this.showRestart(container);
        return;
      }
      
      const isLast = index === msgs.length - 1;
      
      const msg = this.add.text(0, yPos, msgs[index], {
        fontFamily: 'monospace',
        fontSize: isLast ? '32px' : '18px',
        color: isLast ? '#ff00aa' : (index === 0 ? '#ffffff' : '#00ffff'),
        fontStyle: isLast ? 'bold' : 'normal'
      }).setOrigin(0.5).setAlpha(0);
      
      container.add(msg);
      
      yPos += isLast ? 60 : 35;
      
      this.tweens.add({
        targets: msg,
        alpha: 1,
        duration: 1000,
        onComplete: () => {
          this.time.delayedCall(1000, () => showMsg(index + 1));
        }
      });
    };
    
    showMsg(0);

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      container.setPosition(gameSize.width / 2, gameSize.height / 2);
    }, this);
  }

  showRestart(container: Phaser.GameObjects.Container) {
    const restart = this.add.text(0, 150, '[ RESTART ]', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        behaviorEngine.reset();
        this.scene.start('MainMenu');
      })
      .on('pointerover', () => restart.setColor('#ffffff'))
      .on('pointerout', () => restart.setColor('#aaaaaa'));
      
    container.add(restart);
  }
}
