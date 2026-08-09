export class AdaptiveBehaviorEngine {
  private levelTimes: number[] = [];
  private pathChoices: ('left' | 'right' | 'center')[] = [];
  private shardsCollected: number = 0;
  private totalShardsAvailable: number = 0;
  private riskInteractions: number = 0; // count of times player took a risky path
  
  private movementHistory: string[] = [];
  private heat: number = 0;
  private predictability: number = 50;
  private lastAction: string = '';
  private repeatCount: number = 0;

  public recordTime(seconds: number) {
    this.levelTimes.push(seconds);
  }

  public recordPath(choice: 'left' | 'right' | 'center') {
    this.pathChoices.push(choice);
  }

  public addShards(collected: number, available: number) {
    this.shardsCollected += collected;
    this.totalShardsAvailable += available;
  }

  public addRiskInteraction() {
    this.riskInteractions++;
  }

  public recordMovement(direction: string) {
    if (this.movementHistory.length > 50) {
      this.movementHistory.shift();
    }
    this.movementHistory.push(direction);

    if (direction === this.lastAction) {
      this.repeatCount++;
      if (this.repeatCount > 5) {
        this.addHeat(1);
        this.predictability = Math.min(100, this.predictability + 2);
      }
    } else {
      this.repeatCount = 0;
      this.addHeat(-2);
      this.predictability = Math.max(0, this.predictability - 1);
    }
    this.lastAction = direction;
  }

  public addHeat(amount: number) {
    this.heat = Math.max(0, Math.min(100, this.heat + amount));
  }

  public getHeat(): number {
    return Math.round(this.heat);
  }

  public getPredictability(): number {
    return Math.round(this.predictability);
  }

  public predictNextMove(): string {
    if (this.movementHistory.length < 5) return 'idle';
    // Simple N-gram prediction (looks for recent pattern)
    const recent = this.movementHistory.slice(-3).join(',');
    const historyStr = this.movementHistory.join(',');
    
    // Find previous occurrences of this 3-move pattern
    const matches = [];
    for (let i = 0; i < this.movementHistory.length - 3; i++) {
      if (this.movementHistory[i] === this.movementHistory[this.movementHistory.length - 3] &&
          this.movementHistory[i+1] === this.movementHistory[this.movementHistory.length - 2] &&
          this.movementHistory[i+2] === this.movementHistory[this.movementHistory.length - 1]) {
        if (i + 3 < this.movementHistory.length) {
          matches.push(this.movementHistory[i+3]);
        }
      }
    }
    
    if (matches.length > 0) {
      // Find most frequent next move
      const counts: Record<string, number> = {};
      let maxCount = 0;
      let predicted = matches[0];
      for (const m of matches) {
        counts[m] = (counts[m] || 0) + 1;
        if (counts[m] > maxCount) {
          maxCount = counts[m];
          predicted = m;
        }
      }
      // If predictability is low, introduce some randomness
      if (Math.random() * 100 > this.predictability) {
         const dirs = ['left', 'right', 'up', 'down', 'idle'];
         return dirs[Math.floor(Math.random() * dirs.length)];
      }
      return predicted;
    }
    
    return this.lastAction;
  }

  public getSpeedScore(): number {
    if (this.levelTimes.length === 0) return 50;
    // Assuming 30 seconds is slow (0), 5 seconds is fast (100)
    const avgTime = this.levelTimes.reduce((a, b) => a + b, 0) / this.levelTimes.length;
    let score = 100 - ((avgTime - 5) / 25) * 100;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  public getPathPreference(): 'left' | 'right' | 'balanced' {
    const lefts = this.pathChoices.filter(p => p === 'left').length;
    const rights = this.pathChoices.filter(p => p === 'right').length;
    if (lefts > rights) return 'left';
    if (rights > lefts) return 'right';
    return 'balanced';
  }

  public getLeftBias(): number {
    if (this.pathChoices.length === 0) return 50;
    const lefts = this.pathChoices.filter(p => p === 'left').length;
    return Math.round((lefts / this.pathChoices.length) * 100);
  }

  public getRiskScore(): number {
    if (this.totalShardsAvailable === 0) return 50;
    // Base risk on shards collected out of available, plus explicit risk interactions
    const shardRisk = (this.shardsCollected / this.totalShardsAvailable) * 100;
    const extraRisk = Math.min(20, this.riskInteractions * 5);
    return Math.max(0, Math.min(100, Math.round(shardRisk + extraRisk)));
  }

  public reset() {
    this.levelTimes = [];
    this.pathChoices = [];
    this.shardsCollected = 0;
    this.totalShardsAvailable = 0;
    this.riskInteractions = 0;
    this.movementHistory = [];
    this.heat = 0;
    this.predictability = 50;
    this.lastAction = '';
    this.repeatCount = 0;
  }
}

export const behaviorEngine = new AdaptiveBehaviorEngine();
