import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { Boot } from '../game/scenes/Boot';
import { MainMenu } from '../game/scenes/MainMenu';
import { Play } from '../game/scenes/Play';
import { Pause } from '../game/scenes/Pause';
import { GameOver } from '../game/scenes/GameOver';
import { GameComplete } from '../game/scenes/GameComplete';
import { UI } from '../game/scenes/UI';

export default function PhaserGame() {
  const gameRef = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      backgroundColor: '#050a10',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: false,
        },
      },
      scene: [Boot, MainMenu, Play, UI, Pause, GameOver, GameComplete],
      audio: {
        noAudio: true
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: '100%',
        height: '100%',
        parent: gameRef.current,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    const phaserGame = new Phaser.Game(config);
    setGame(phaserGame);

    return () => {
      phaserGame.destroy(true);
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div ref={gameRef} className="w-full h-full relative" />
    </div>
  );
}
