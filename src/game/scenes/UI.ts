import Phaser, { Scene } from 'phaser';
import { VirtualJoystick } from '../ui/VirtualJoystick';
import { AbilityButton } from '../ui/AbilityButton';
import { behaviorEngine } from '../systems/AdaptiveBehaviorEngine';
import { Play } from './Play';

export class UI extends Scene {
  private joystick!: VirtualJoystick;
  private btnDash!: AbilityButton;
  private btnDecoy!: AbilityButton;
  private btnPhase!: AbilityButton;
  
  private lvlText!: Phaser.GameObjects.Text;
  private heatText!: Phaser.GameObjects.Text;
  private hudBg!: Phaser.GameObjects.Graphics;
  private rotateOverlay!: Phaser.GameObjects.Container;

  constructor() {
    super('UI');
  }

  create(data: { level: number }) {
    const width = this.scale.width;
    const height = this.scale.height;

    // HUD Top Bar
    this.hudBg = this.add.graphics();
    this.lvlText = this.add.text(20, 10, `LEVEL ${data.level}`, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#00ffff'
    });

    this.heatText = this.add.text(width - 150, 10, `HEAT: 0%`, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ff4444'
    });

    if (data.level < 2) {
      this.heatText.setVisible(false);
    }

    // Virtual Joystick
    this.joystick = new VirtualJoystick(this, 100, height - 100);

    // Ability Buttons
    const playScene = this.scene.get('Play') as Play;
    
    this.btnPhase = new AbilityButton(this, width - 80, height - 100, 'PHS', 0xff00ff, () => {
      playScene.performPhase();
    });
    
    this.btnDecoy = new AbilityButton(this, width - 170, height - 100, 'DCY', 0x00ff00, () => {
      playScene.performDecoy();
    });
    
    this.btnDash = new AbilityButton(this, width - 260, height - 100, 'DSH', 0x00ffff, () => {
      playScene.performDash();
    });

    // Orientation Overlay
    this.rotateOverlay = this.add.container(0, 0).setDepth(2000).setVisible(false);
    const overlayBg = this.add.rectangle(0, 0, 4000, 4000, 0x000000, 0.9);
    const rotateText = this.add.text(0, 0, 'ROTATE YOUR DEVICE\n\n(Landscape Recommended)', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    this.rotateOverlay.add([overlayBg, rotateText]);

    this.scale.on('resize', this.handleResize, this);
    this.handleResize({ width: this.scale.width, height: this.scale.height } as any);

    if (data.level === 4) {
      this.showRevealMessage();
      this.time.delayedCall(2000, () => this.createPlaystylePanel());
    } else if (data.level === 5) {
      this.showFinalChallengeMessage();
    }
  }

  update() {
    if (this.heatText.visible) {
      this.heatText.setText(`HEAT: ${behaviorEngine.getHeat()}%`);
    }

    const playScene = this.scene.get('Play') as Play;
    if (playScene && playScene.sys.isActive()) {
      // Pass joystick vector to play scene
      playScene.setJoystickVector(this.joystick.vector);
      
      this.btnDash.setCooldown(!playScene.getDashReady());
      this.btnDecoy.setCooldown(!playScene.getDecoyReady());
      this.btnPhase.setCooldown(!playScene.getPhaseReady());
    }
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    const width = gameSize.width;
    const height = gameSize.height;

    this.hudBg.clear();
    this.hudBg.fillStyle(0x050a10, 0.9);
    this.hudBg.fillRect(0, 0, width, 40);
    this.hudBg.lineStyle(1, 0x00ffff, 0.3);
    this.hudBg.beginPath();
    this.hudBg.moveTo(0, 40);
    this.hudBg.lineTo(width, 40);
    this.hudBg.strokePath();

    this.heatText.setPosition(width - 150, 10);

    // Safe areas logic (simple padding)
    const paddingX = 50;
    const paddingY = 80;

    this.joystick.setPosition(paddingX + 60, height - paddingY);
    
    this.btnPhase.setPosition(width - paddingX - 40, height - paddingY);
    this.btnDecoy.setPosition(width - paddingX - 120, height - paddingY);
    this.btnDash.setPosition(width - paddingX - 200, height - paddingY);
    
    // Check orientation
    if (height > width && height > 600) {
      this.rotateOverlay.setVisible(true);
      const rotateText = this.rotateOverlay.list[1] as Phaser.GameObjects.Text;
      rotateText.setPosition(width / 2, height / 2);
    } else {
      this.rotateOverlay.setVisible(false);
    }
  }

  private showRevealMessage() {
    const width = this.scale.width;
    const height = this.scale.height;
    const msg = this.add.text(width / 2, height / 2, 'IT LEARNED YOU.', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ff0044',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: msg,
      alpha: { start: 0, to: 1 },
      duration: 1000,
      yoyo: true,
      hold: 2000,
      onComplete: () => msg.destroy()
    });
  }

  private showFinalChallengeMessage() {
    const width = this.scale.width;
    const height = this.scale.height;
    const msg = this.add.text(width / 2, height / 2, 'Can you break the pattern?', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#00ffff'
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: msg,
      alpha: { start: 0, to: 1 },
      duration: 1000,
      yoyo: true,
      hold: 2000,
      onComplete: () => msg.destroy()
    });
  }

  private createPlaystylePanel() {
    const width = this.scale.width;
    const height = this.scale.height;
    
    const panel = this.add.container(width / 2, height / 2);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x050a15, 0.95);
    bg.lineStyle(2, 0x00ffff, 0.8);
    bg.fillRect(-180, -100, 360, 200);
    bg.strokeRect(-180, -100, 360, 200);
    panel.add(bg);

    const title = this.add.text(0, -75, 'ECHO PROFILE', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    panel.add(title);

    const speed = behaviorEngine.getSpeedScore();
    const risk = behaviorEngine.getRiskScore();
    const leftBias = behaviorEngine.getLeftBias();
    const pred = behaviorEngine.getPredictability();
    const heat = behaviorEngine.getHeat();
    
    const makeBar = (val: number, max: number = 10) => {
       const filled = Math.round((val / 100) * max);
       return '█'.repeat(filled) + '░'.repeat(max - filled);
    };

    const style = { fontFamily: 'monospace', fontSize: '16px', color: '#fff' };
    
    panel.add(this.add.text(-150, -40, `PREDICTABILITY   ${makeBar(pred)}`, style));
    panel.add(this.add.text(-150, -15, `SPEED            ${makeBar(speed)}`, style));
    panel.add(this.add.text(-150,  10, `RISK             ${makeBar(risk)}`, style));
    panel.add(this.add.text(-150,  35, `LEFT BIAS        ${makeBar(leftBias)}`, style));
    panel.add(this.add.text(-150,  70, `HEAT             ${heat}%`, { ...style, color: '#ff4444' }));

    // Auto hide after some time
    this.time.delayedCall(6000, () => {
      this.tweens.add({
        targets: panel,
        alpha: 0,
        duration: 1000,
        onComplete: () => panel.destroy()
      });
    });
  }
}
