export const LEVELS = [
  {
    // Level 1: Teach movement
    map: [
      "WWWWWWWWWWWWWWWWWWWW",
      "W..................W",
      "W..................W",
      "W..................W",
      "W..................W",
      "W..................W",
      "W...P..............W",
      "W..................W",
      "W..............E...W",
      "W..................W",
      "W..................W",
      "W..................W",
      "W..................W",
      "W..................W",
      "WWWWWWWWWWWWWWWWWWWW",
    ],
    hazards: []
  },
  {
    // Level 2: Two routes (top/bottom) + shards for risk
    map: [
      "WWWWWWWWWWWWWWWWWWWW",
      "W........S.........W",
      "W..WWWWWWWWWWWWWW..W",
      "W..W............W..W",
      "W..W............W..W",
      "W..W...WWWWWW...W..W",
      "W..W...W....W...W..W",
      "W..P...W.WW.W...E..W",
      "W..W...W....W...W..W",
      "W..W...WWWWWW...W..W",
      "W..W............W..W",
      "W..W............W..W",
      "W..WWWWWWWWWWWWWW..W",
      "W........S.........W",
      "WWWWWWWWWWWWWWWWWWWW",
    ],
    hazards: [
      { x: 9, y: 3, type: 'v', min: 2, max: 12 },
      { x: 9, y: 11, type: 'v', min: 2, max: 12 }
    ]
  },
  {
    // Level 3: Adaptive.
    map: [
      "WWWWWWWWWWWWWWWWWWWW",
      "W.S..............S.W",
      "W.W.WWWWWWWWWWWW.W.W",
      "W.W.W..........W.W.W",
      "W.W.W.WWWWWWWW.W.W.W",
      "W.W.W.W......W.W.W.W",
      "W.W.W.W......W.W.W.W",
      "W.P.W.W......W.W.E.W",
      "W.W.W.W......W.W.W.W",
      "W.W.W.W......W.W.W.W",
      "W.W.W.WWWWWWWW.W.W.W",
      "W.W.W..........W.W.W",
      "W.W.WWWWWWWWWWWW.W.W",
      "W.S..............S.W",
      "WWWWWWWWWWWWWWWWWWWW",
    ],
    hazards: [
      // Top path hazards (path='left/top')
      { x: 3, y: 3, type: 'v', min: 3, max: 11, pathContext: 'left' },
      { x: 16, y: 3, type: 'v', min: 3, max: 11, pathContext: 'right' },
      { x: 7, y: 3, type: 'h', min: 4, max: 15, pathContext: 'left' },
      { x: 7, y: 11, type: 'h', min: 4, max: 15, pathContext: 'right' }
    ]
  },
  {
    // Level 4: Reveal mechanic. Open area, let them play with risk/speed.
    map: [
      "WWWWWWWWWWWWWWWWWWWW",
      "W...S....W.........W",
      "W.WWWW........WWWW.W",
      "W..................W",
      "W.........WW.......W",
      "W.WWWW........WWWW.W",
      "W.WWWW........WWWW.W",
      "W.P..............E.W",
      "W.WWWW........WWWW.W",
      "W.WWWW........WWWW.W",
      "W........WW........W",
      "W..................W",
      "W.WWWW........WWWW.W",
      "W........S.........W",
      "WWWWWWWWWWWWWWWWWWWW",
    ],
    hazards: [
      { x: 5, y: 3, type: 'h', min: 5, max: 14, always: true },
      { x: 9, y: 11, type: 'h', min: 5, max: 14, always: true },
      { x: 14, y: 7, type: 'v', min: 2, max: 12, always: true },
      { x: 7, y: 5, type: 'v', min: 2, max: 12, always: true },
      { x: 11, y: 9, type: 'v', min: 2, max: 12, always: true }
    ]
  },
  {
    // Level 5: Final challenge. 
    map: [
      "WWWWWWWWWWWWWWWWWWWW",
      "W..S...W......W..S.W",
      "W..W...W..WW..W..W.W",
      "W..W...W..W...W..W.W",
      "W..W......W......W.W",
      "W..WWWWWWWWWWWWWWW.W",
      "W..................W",
      "P........WW........E",
      "W..................W",
      "W..WWWWWWWWWWWWWWW.W",
      "W..W......W......W.W",
      "W..W...W..W...W..W.W",
      "W..W...W..WW..W..W.W",
      "W..S...W......W..S.W",
      "WWWWWWWWWWWWWWWWWWWW",
    ],
    hazards: [
      { x: 4, y: 2, type: 'v', min: 1, max: 4, pathContext: 'left' },
      { x: 15, y: 12, type: 'v', min: 10, max: 13, pathContext: 'right' },
      { x: 9, y: 3, type: 'h', min: 4, max: 15, pathContext: 'left' },
      { x: 9, y: 11, type: 'h', min: 4, max: 15, pathContext: 'right' },
      { x: 14, y: 6, type: 'v', min: 2, max: 12, always: true },
      { x: 14, y: 8, type: 'v', min: 2, max: 12, always: true }
    ]
  }
];
