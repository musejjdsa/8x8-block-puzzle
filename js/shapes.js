/* ============================================================
   MODULE: js/shapes.js — shape definitions (cells + weight by level)
============================================================ */
const SHAPES=[
 /* Only the 7 classic Tetris tetrominoes (exactly 4 blocks each), in fixed dealt orientations — no rotation controls. */
 {name:'I',cells:[[0,0],[1,0],[2,0],[3,0]],w:2},{name:'I',cells:[[0,0],[0,1],[0,2],[0,3]],w:2},
 {name:'O',cells:[[0,0],[1,0],[0,1],[1,1]],w:2},
 {name:'T',cells:[[0,0],[1,0],[2,0],[1,1]],w:2},{name:'T',cells:[[1,0],[0,1],[1,1],[2,1]],w:2},{name:'T',cells:[[0,0],[0,1],[0,2],[1,1]],w:2},{name:'T',cells:[[1,0],[0,1],[1,1],[1,2]],w:2},
 {name:'S',cells:[[1,0],[2,0],[0,1],[1,1]],w:2},{name:'S',cells:[[0,0],[0,1],[1,1],[1,2]],w:2},
 {name:'Z',cells:[[0,0],[1,0],[1,1],[2,1]],w:2},{name:'Z',cells:[[1,0],[0,1],[1,1],[0,2]],w:2},
 {name:'L',cells:[[0,0],[0,1],[0,2],[1,2]],w:2},{name:'L',cells:[[0,0],[1,0],[2,0],[0,1]],w:2},{name:'L',cells:[[0,0],[1,0],[1,1],[1,2]],w:2},{name:'L',cells:[[2,0],[0,1],[1,1],[2,1]],w:2},
 {name:'J',cells:[[1,0],[1,1],[1,2],[0,2]],w:2},{name:'J',cells:[[0,0],[0,1],[1,1],[2,1]],w:2},{name:'J',cells:[[0,0],[1,0],[0,1],[0,2]],w:2},{name:'J',cells:[[0,0],[1,0],[2,0],[2,1]],w:2},
];
const shapeDims=s=>({w:Math.max(...s.cells.map(c=>c[0]))+1,h:Math.max(...s.cells.map(c=>c[1]))+1});
const pickShape=level=>{const maxW=level<=1?2:level===2?3:4;const pool=SHAPES.filter(s=>s.w<=maxW);const bag=pool.flatMap(s=>Array(Math.max(1,5-s.w)).fill(s));return bag[Math.floor(Math.random()*bag.length)];};
