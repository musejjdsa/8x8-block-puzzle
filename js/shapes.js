/* ============================================================
   MODULE: js/shapes.js — shape definitions (cells + weight by level)
============================================================ */
const SHAPES=[
 {name:'Single',cells:[[0,0]],w:1},{name:'Domino H',cells:[[0,0],[1,0]],w:1},{name:'Domino V',cells:[[0,0],[0,1]],w:1},
 {name:'Line 3 H',cells:[[0,0],[1,0],[2,0]],w:2},{name:'Line 3 V',cells:[[0,0],[0,1],[0,2]],w:2},
 {name:'Line 4 H',cells:[[0,0],[1,0],[2,0],[3,0]],w:2},{name:'Line 4 V',cells:[[0,0],[0,1],[0,2],[0,3]],w:2},
 {name:'Line 5 H',cells:[[0,0],[1,0],[2,0],[3,0],[4,0]],w:3},{name:'Line 5 V',cells:[[0,0],[0,1],[0,2],[0,3],[0,4]],w:3},
 {name:'Square 2×2',cells:[[0,0],[1,0],[0,1],[1,1]],w:2},{name:'Block 2×3',cells:[[0,0],[1,0],[0,1],[1,1],[0,2],[1,2]],w:3},{name:'Block 3×2',cells:[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],w:3},{name:'Block 3×3',cells:[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1],[0,2],[1,2],[2,2]],w:4},
 {name:'L — 3+1',cells:[[0,0],[0,1],[0,2],[1,2]],w:2},{name:'L flipped',cells:[[1,0],[1,1],[1,2],[0,2]],w:2},{name:'L wide',cells:[[0,0],[0,1],[1,1],[2,1]],w:2},{name:'Corner',cells:[[0,0],[0,1],[1,1]],w:1},{name:'Corner R',cells:[[0,0],[1,0],[1,1]],w:1},
 {name:'T shape',cells:[[0,0],[1,0],[2,0],[1,1]],w:3},{name:'U shape',cells:[[0,0],[2,0],[0,1],[1,1],[2,1]],w:3},
 {name:'Z shape',cells:[[0,0],[1,0],[1,1],[2,1]],w:2},{name:'S shape',cells:[[1,0],[2,0],[0,1],[1,1]],w:2},
 {name:'Plus',cells:[[1,0],[0,1],[1,1],[2,1],[1,2]],w:3},{name:'Stairs',cells:[[0,0],[1,1],[2,2],[0,1],[1,2]],w:3},
];
const shapeDims=s=>({w:Math.max(...s.cells.map(c=>c[0]))+1,h:Math.max(...s.cells.map(c=>c[1]))+1});
const pickShape=level=>{const maxW=level<=1?2:level===2?3:4;const pool=SHAPES.filter(s=>s.w<=maxW);const bag=pool.flatMap(s=>Array(Math.max(1,5-s.w)).fill(s));return bag[Math.floor(Math.random()*bag.length)];};
