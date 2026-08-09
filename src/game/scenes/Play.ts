import Phaser, { Scene, Physics, Input } from 'phaser';
import { LEVELS } from '../levels/LevelData';
import { behaviorEngine } from '../systems/AdaptiveBehaviorEngine';

export class Play extends Scene {
  private levelIndex!: number;
  private player!: Physics.Arcade.Sprite;
  private cursors!: any;
  private wasd!: any;
  private exit!: Physics.Arcade.Sprite;
  private walls!: Physics.Arcade.StaticGroup;
  private shards!: Physics.Arcade.StaticGroup;
  private hazards!: Physics.Arcade.Sprite[];
  private hunter?: Physics.Arcade.Sprite;
  
  private startTime!: number;
  private levelShardsTotal: number = 0;
  private levelShardsCollected: number = 0;
  private yPositions: number[] = [];

  private isPaused: boolean = false;
  private playstylePanel?: Phaser.GameObjects.Container;
  private heatText?: Phaser.GameObjects.Text;

  private dashReady: boolean = true;
  private decoyReady: boolean = true;
  private phaseReady: boolean = true;
  private decoy?: Phaser.GameObjects.Sprite;
  
  private joystickVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);

  constructor() {
    super('Play');
  }

  init(data: { level: number }) {
    this.levelIndex = data.level || 1;
  }

  create() {
    this.isPaused = false;
    this.startTime = this.time.now;
    this.levelShardsCollected = 0;
    this.levelShardsTotal = 0;
    this.yPositions = [];
    this.dashReady = true;
    this.decoyReady = true;
    this.phaseReady = true;
    this.joystickVector.set(0, 0);
    
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Launch UI Scene
    this.scene.launch('UI', { level: this.levelIndex });

    // Handle RESIZE
    this.scale.on('resize', this.handleResize, this);
    this.events.on('shutdown', () => {
      this.scale.off('resize', this.handleResize, this);
      this.scene.stop('UI');
    });

    const levelData = LEVELS[this.levelIndex - 1];
    
    this.walls = this.physics.add.staticGroup();
    this.shards = this.physics.add.staticGroup();
    this.hazards = [];

    const tileSize = 40;
    
    let px = 0, py = 0;
    // Parse map
    levelData.map.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const char = row[x];
        const cx = x * tileSize + tileSize / 2;
        const cy = y * tileSize + tileSize / 2;
        
        if (char === 'W') {
          this.walls.create(cx, cy, 'wall');
        } else if (char === 'P') {
          px = cx; py = cy;
          this.player = this.physics.add.sprite(cx, cy, 'player');
          this.player.setCollideWorldBounds(true);
        } else if (char === 'E') {
          this.exit = this.physics.add.sprite(cx, cy, 'exit');
          this.exit.setImmovable(true);
        } else if (char === 'S') {
          this.shards.create(cx, cy, 'shard');
          this.levelShardsTotal++;
        }
      }
    });

    // Hunter spawning logic
    if (this.levelIndex >= 3) {
      // Spawn hunter far away from player initially
      this.hunter = this.physics.add.sprite(800 - px, 600 - py, 'hunter');
      this.hunter.setCollideWorldBounds(true);
      
      // Warning effects
      this.cameras.main.shake(1000, 0.005);
      this.time.delayedCall(500, () => {
        const txt = this.add.text(400, 100, 'HUNTER DEPLOYED', { fontFamily: 'monospace', fontSize: '20px', color: '#ff0044' }).setOrigin(0.5);
        this.tweens.add({ targets: txt, alpha: 0, duration: 2000, onComplete: () => txt.destroy() });
      });
    }

    // Adaptive speed modifier based on previous speed score
    const speedScore = behaviorEngine.getSpeedScore(); // 0 to 100
    // Higher speed score -> faster hazards
    const hazardSpeedBase = 100 + (speedScore / 100) * 150; 
    
    // Path preference
    const pathPref = behaviorEngine.getPathPreference();
    
    // Risk score
    const riskScore = behaviorEngine.getRiskScore();

    // Create hazards
    levelData.hazards.forEach((h: any) => {
      let speedMult = 1;
      if (h.pathContext) {
        if (h.pathContext === pathPref) {
          speedMult = 1.5; // harder on preferred path
        } else if (pathPref !== 'balanced') {
          speedMult = 0.5; // easier on non-preferred
        }
      }

      if (h.riskContext === 'high' && riskScore < 50) {
        return; // don't spawn if they aren't risky
      }

      const hSprite = this.physics.add.sprite(
        h.x * tileSize + tileSize / 2, 
        h.y * tileSize + tileSize / 2, 
        'hazard'
      );
      
      const speed = hazardSpeedBase * speedMult;
      if (h.type === 'h') {
        hSprite.setVelocityX(speed);
      } else {
        hSprite.setVelocityY(speed);
      }
      hSprite.setBounce(1, 1);
      hSprite.setCollideWorldBounds(true);
      
      this.hazards.push(hSprite);
    });

    // Physics colliders
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.hazards, this.walls);
    if (this.hunter) {
      this.physics.add.collider(this.hunter, this.walls);
      this.physics.add.overlap(this.player, this.hunter, this.caughtByHunter as any, undefined, this);
    }
    
    this.physics.add.overlap(this.player, this.shards, this.collectShard as any, undefined, this);
    this.physics.add.overlap(this.player, this.exit, this.reachExit as any, undefined, this);
    this.physics.add.overlap(this.player, this.hazards, this.hitHazard as any, undefined, this);

    // Inputs
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D');

    // Hotkeys
    this.input.keyboard!.on('keydown-R', () => this.restartLevel());
    this.input.keyboard!.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard!.on('keydown-SPACE', () => this.performDash());
    this.input.keyboard!.on('keydown-F', () => this.performDecoy());
    this.input.keyboard!.on('keydown-Q', () => this.performPhase());

    this.handleResize({ width: this.scale.width, height: this.scale.height } as any);
  }

  update() {
    if (this.isPaused) return;

    let speed = 200;
    
    let vx = 0;
    let vy = 0;
    let dirStr = 'idle';

    if (this.cursors.left.isDown || this.wasd.A.isDown) { vx = -speed; dirStr = 'left'; }
    else if (this.cursors.right.isDown || this.wasd.D.isDown) { vx = speed; dirStr = 'right'; }

    if (this.cursors.up.isDown || this.wasd.W.isDown) { vy = -speed; dirStr = 'up'; }
    else if (this.cursors.down.isDown || this.wasd.S.isDown) { vy = speed; dirStr = 'down'; }

    if (this.joystickVector.lengthSq() > 0) {
      vx = this.joystickVector.x * speed;
      vy = this.joystickVector.y * speed;
      if (Math.abs(vx) > Math.abs(vy)) {
        dirStr = vx > 0 ? 'right' : 'left';
      } else {
        dirStr = vy > 0 ? 'down' : 'up';
      }
    }

    // If dashing, override velocity temporarily
    if (this.player.getData('dashing')) {
      vx = this.player.body!.velocity.x;
      vy = this.player.body!.velocity.y;
    } else {
      this.player.setVelocity(vx, vy);
      
      // Rotate player based on movement
      if (vx !== 0 || vy !== 0) {
        this.player.setRotation(Math.atan2(vy, vx) + Math.PI/2);
      }
    }
    
    // Sample Y position every frame for path preference
    this.yPositions.push(this.player.y);

    // Record movement for behavior engine periodically
    if (this.time.now % 30 < 16) { // Roughly twice a second
      behaviorEngine.recordMovement(dirStr);
      if (this.heatText) {
         this.heatText.setText(`HEAT: ${behaviorEngine.getHeat()}%`);
      }
    }

    // Hunter AI
    if (this.hunter && this.hunter.active) {
       this.updateHunter();
    }
  }

  private updateHunter() {
     if (!this.hunter) return;
     
     // Base speed scales with heat
     let heat = behaviorEngine.getHeat();
     let baseSpeed = 100 + (heat * 1.5);
     
     // Target selection: player or decoy
     let targetX = this.player.x;
     let targetY = this.player.y;
     
     if (this.decoy && this.decoy.active) {
       targetX = this.decoy.x;
       targetY = this.decoy.y;
     } else {
       // Prediction logic: if predictability is high, hunter intercepts
       let pred = behaviorEngine.getPredictability();
       if (pred > 60 && Math.random() > 0.3) {
          let nextMove = behaviorEngine.predictNextMove();
          if (nextMove === 'left') targetX -= 100;
          if (nextMove === 'right') targetX += 100;
          if (nextMove === 'up') targetY -= 100;
          if (nextMove === 'down') targetY += 100;
       }
     }

     this.physics.moveTo(this.hunter, targetX, targetY, baseSpeed);
     
     // Particle trail
     if (this.time.now % 5 === 0) {
       const gl = this.add.rectangle(this.hunter.x, this.hunter.y, 10, 10, 0x00ffff, 0.5);
       this.tweens.add({
         targets: gl,
         alpha: 0,
         scale: 0.1,
         duration: 500,
         onComplete: () => gl.destroy()
       });
     }
  }

  public performDash() {
    if (!this.dashReady || this.player.getData('dashing')) return;
    
    this.dashReady = false;
    this.player.setData('dashing', true);
    
    // Get current direction from velocity
    let vx = this.player.body!.velocity.x;
    let vy = this.player.body!.velocity.y;
    
    // If idle, dash in facing direction
    if (vx === 0 && vy === 0) {
       let angle = this.player.rotation - Math.PI/2;
       vx = Math.cos(angle) * 200;
       vy = Math.sin(angle) * 200;
    }
    
    // Normalize and multiply
    let mag = Math.sqrt(vx*vx + vy*vy);
    if (mag > 0) {
      vx = (vx / mag) * 600;
      vy = (vy / mag) * 600;
    }
    
    this.player.setVelocity(vx, vy);
    behaviorEngine.addHeat(5); // Dashing increases heat
    
    this.time.delayedCall(200, () => {
      if (this.player.active) {
        this.player.setData('dashing', false);
      }
    });

    // Update HUD
    const dashTxt = this.add.text(this.player.x, this.player.y - 20, 'DASH', { color: '#00ffff', fontSize: '10px', fontFamily: 'monospace' }).setOrigin(0.5);
    this.tweens.add({ targets: dashTxt, y: dashTxt.y - 20, alpha: 0, duration: 500, onComplete: () => dashTxt.destroy() });
  }

  public performDecoy() {
    if (!this.decoyReady) return;
    
    this.decoyReady = false;
    behaviorEngine.addHeat(-10); // Decoy lowers heat
    
    this.decoy = this.add.sprite(this.player.x, this.player.y, 'player');
    this.decoy.setAlpha(0.5);
    this.decoy.setTint(0x00ff00);
    
    this.time.delayedCall(3000, () => {
       if (this.decoy) {
         this.decoy.destroy();
       }
    });
    
    const txt = this.add.text(this.player.x, this.player.y - 20, 'DECOY', { color: '#00ff00', fontSize: '10px', fontFamily: 'monospace' }).setOrigin(0.5);
    this.tweens.add({ targets: txt, y: txt.y - 20, alpha: 0, duration: 500, onComplete: () => txt.destroy() });
  }

  private collectShard(player: Phaser.GameObjects.GameObject, shard: Phaser.GameObjects.GameObject) {
    shard.destroy();
    this.levelShardsCollected++;
    behaviorEngine.addRiskInteraction();
    
    const s = shard as Phaser.Physics.Arcade.Sprite;
    this.add.particles(s.x, s.y, 'shard', {
      speed: 100,
      lifespan: 300,
      alpha: { start: 1, end: 0 },
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD',
      maxParticles: 10
    });
  }

  private hitHazard(player: Phaser.GameObjects.GameObject, hazard: Phaser.GameObjects.GameObject) {
    if (this.player.getData('phasing')) return;
    this.scene.start('GameOver', { level: this.levelIndex });
  }

  private caughtByHunter(player: Phaser.GameObjects.GameObject, hunter: Phaser.GameObjects.GameObject) {
    if (this.player.getData('phasing')) return;
    this.scene.start('GameOver', { level: this.levelIndex });
  }

  private reachExit() {
    const timeSpent = (this.time.now - this.startTime) / 1000;
    behaviorEngine.recordTime(timeSpent);
    behaviorEngine.addShards(this.levelShardsCollected, this.levelShardsTotal);
    
    const avgY = this.yPositions.length > 0 ? this.yPositions.reduce((a, b) => a + b, 0) / this.yPositions.length : this.player.y;
    if (avgY < 300) {
      behaviorEngine.recordPath('left'); // Top half
    } else {
      behaviorEngine.recordPath('right'); // Bottom half
    }

    if (this.levelIndex === LEVELS.length) {
      this.scene.start('GameComplete');
    } else {
      this.scene.start('Play', { level: this.levelIndex + 1 });
    }
  }

  private restartLevel() {
    this.scene.restart({ level: this.levelIndex });
  }

  private togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.physics.pause();
      this.scene.launch('Pause');
    } else {
      this.physics.resume();
      this.scene.stop('Pause');
    }
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    const width = gameSize.width;
    const height = gameSize.height;

    // Center the 800x600 game area in the view
    const mapWidth = 800;
    const mapHeight = 600;
    const zoom = Math.min(width / mapWidth, height / mapHeight);
    
    this.cameras.main.setZoom(zoom);
    this.cameras.main.centerOn(mapWidth / 2, mapHeight / 2);
  }

  public setJoystickVector(v: Phaser.Math.Vector2) {
    this.joystickVector.copy(v);
  }

  public getDashReady() { return this.dashReady; }
  public getDecoyReady() { return this.decoyReady; }
  public getPhaseReady() { return this.phaseReady; }

  public performPhase() {
    if (!this.phaseReady) return;
    this.phaseReady = false;
    behaviorEngine.addHeat(2);
    
    this.player.setData('phasing', true);
    this.player.setAlpha(0.5);
    
    const txt = this.add.text(this.player.x, this.player.y - 20, 'PHASE', { color: '#ff00ff', fontSize: '10px', fontFamily: 'monospace' }).setOrigin(0.5);
    this.tweens.add({ targets: txt, y: txt.y - 20, alpha: 0, duration: 500, onComplete: () => txt.destroy() });

    this.time.delayedCall(1000, () => {
      if (this.player.active) {
        this.player.setData('phasing', false);
        this.player.setAlpha(1);
      }
    });

    this.time.delayedCall(3000, () => {
      this.phaseReady = true;
    });
  }
}