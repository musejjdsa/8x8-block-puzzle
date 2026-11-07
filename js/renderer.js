/* ============================================================
   MODULE: js/renderer.js — Three.js renderer (board meshes only)
============================================================ */
class Renderer3D{
 constructor(host){this.host=host;this.meshes=new Map();this.ghosts=[];this.anim=[];this.ok=false;this.theme=THEMES[0];
  this.fxFlash={};['row','col'].forEach(k=>{});
  if(window.THREE){try{this.init();this.ok=true;}catch(e){this.ok=false;}}
  if(!this.ok){host.style.background='var(--board)';}}
 init(){const T=THREE;this.scene=new T.Scene();
  this.cam=new T.OrthographicCamera(-4.25,4.25,4.25,-4.25,.1,100);this.cam.position.set(0,-4.2,11);this.cam.lookAt(0,0,0);
  this.r=new T.WebGLRenderer({antialias:true,alpha:true});this.r.setClearColor(0x000000,0);this.r.setPixelRatio(Math.min(devicePixelRatio,2));this.r.domElement.className='gl';this.host.prepend(this.r.domElement);
  this.scene.add(new T.AmbientLight(0xffffff,.95));const d=new T.DirectionalLight(0xffffff,.85);d.position.set(3,-4,8);this.scene.add(d);
  /* Empty cells are FLAT tiles (0.04 thick, top at z=0.02) — never raised slabs.
     Raised empty-cell cubes used to occlude dragged/placed blocks from the tilted
     camera; placed blocks (0.55 thick, base at z=0.025) now sit fully on top. */
  const cellGeo=new T.BoxGeometry(.94,.94,.04),cellMat=new T.MeshStandardMaterial({color:this.theme.cell,roughness:.85});
  this.cellMat=cellMat;
  for(let y=0;y<8;y++)for(let x=0;x<8;x++){const m=new T.Mesh(cellGeo,cellMat);m.position.set(x-3.5,3.5-y,0);this.scene.add(m);}
  this.geo=new T.BoxGeometry(.92,.92,.55);
  const loop=()=>{requestAnimationFrame(loop);this.tick();this.r.render(this.scene,this.cam);};loop();this.resize();new ResizeObserver(()=>this.resize()).observe(this.host);}
 resize(){if(!this.r)return;const w=this.host.clientWidth||300;this.r.setSize(w,w);}
 setTheme(t){this.theme=t;if(this.ok){this.cellMat.color.setHex(t.cell);}this.host.style.background='';this.refreshColors();if(!this.ok&&this.target)this.sync(this.target);}
 mat(ci){const col=new THREE.Color(this.theme.palette[ci%this.theme.palette.length]);return new THREE.MeshStandardMaterial({color:col,roughness:.3,metalness:.05,emissive:col.clone().multiplyScalar(.14)});}
 key=(x,y)=>x+','+y;
 sync(board){this.target=board;if(!this.ok){const layer=this.host.querySelector('.dom-blocks');if(layer){layer.innerHTML='';const pad=7,gap=3;board.forEach((row,y)=>row.forEach((c,x)=>{if(!c)return;const el=document.createElement('i');const pct=100/8;el.style.left=`calc(${pad}px + ${x} * (100% - ${pad*2}px)/8 + ${gap/2}px)`;el.style.top=`calc(${pad}px + ${y} * (100% - ${pad*2}px)/8 + ${gap/2}px)`;el.style.width=`calc((100% - ${pad*2}px)/8 - ${gap}px)`;el.style.height=`calc((100% - ${pad*2}px)/8 - ${gap}px)`;el.style.background=this.theme.palette[c.ci%this.theme.palette.length];layer.append(el);}));}return;}
  // remove missing
  [...this.meshes].forEach(([k,m])=>{const[x,y]=k.split(',').map(Number);if(!board[y][x]&&!this.anim.find(a=>a.mesh===m)){this.scene.remove(m);this.meshes.delete(k);}});
  for(let y=0;y<8;y++)for(let x=0;x<8;x++){const c=board[y][x];if(c&&!this.meshes.has(this.key(x,y))){const m=new THREE.Mesh(this.geo,this.mat(c.ci));m.position.set(x-3.5,3.5-y,.3);m.scale.set(.6,.6,.6);this.scene.add(m);this.meshes.set(this.key(x,y),m);this.anim.push({mesh:m,type:'drop',t:0});}}}
 refreshColors(){if(!this.ok||!this.target)return;[...this.meshes].forEach(([k,m])=>{const[x,y]=k.split(',').map(Number);const c=this.target[y]?.[x];if(c)m.material=this.mat(c.ci);});}
 showGhost(board,shape,x,y,valid){this.clearGhost();if(!this.ok||!shape)return;const gmat=new THREE.MeshStandardMaterial({color:valid?0xffffff:0xff3355,transparent:true,opacity:.5,depthWrite:false});
  shape.cells.forEach(([dx,dy])=>{const cx=x+dx,cy=y+dy;if(cx<0||cx>7||cy<0||cy>7)return;const m=new THREE.Mesh(this.geo,gmat);m.position.set(cx-3.5,3.5-cy,.32);m.renderOrder=5;this.scene.add(m);this.ghosts.push(m);});}
 clearGhost(){this.ghosts.forEach(m=>this.scene?.remove(m));this.ghosts=[];}
 clearAll(){/* Guarantee a visually empty board: remove every block mesh, ghost and pending animation, and empty the DOM fallback layer. Used on first load and on New Game — blocks may only (re)appear via sync() from actual board state. */
  this.clearGhost();this.anim=[];
  if(this.ok){[...this.meshes.values()].forEach(m=>this.scene.remove(m));}
  this.meshes.clear();
  const layer=this.host.querySelector('.dom-blocks');if(layer)layer.innerHTML='';}
 animateCells(cells,kind){if(!this.ok)return;cells.forEach(([x,y],i)=>{const m=this.meshes.get(this.key(x,y));if(!m)return;this.meshes.delete(this.key(x,y));this.anim.push({mesh:m,type:kind,t:- (kind==='row'?x*4:(kind==='col'?y*4:i*2)),fall:0});});}
 ringBurst(){/* visual ring handled by particles; add a quick camera-feel scale pulse on remaining meshes */[...this.meshes.values()].forEach(m=>this.anim.push({mesh:m,type:'pulse',t:0}));}
 flash(kind,idx){const el=document.createElement('div');el.className=kind==='row'?'flash-row':'flash-col';if(kind==='row')el.style.top=(idx*12.5)+'%';else el.style.left=(idx*12.5)+'%';el.style.opacity='.85';this.host.appendChild(el);requestAnimationFrame(()=>{el.style.transition='all .35s';el.style.opacity='0';if(kind==='row')el.style.transform='translateX(30%)';else el.style.transform='translateY(30%)';});setTimeout(()=>el.remove(),400);}
 tick(){this.anim=this.anim.filter(a=>{a.t++;if(a.t<0)return true;const m=a.mesh;
  if(a.type==='drop'){const s=Math.min(1,.6+a.t*.12);m.scale.set(s,s,s);return a.t<4;}
  if(a.type==='row'){const s=Math.max(.01,1-a.t*.14);m.scale.set(s,s,s);m.position.x+=.06;return a.t<8||(this.scene.remove(m),false);}
  if(a.type==='col'){a.fall=(a.fall||0)+a.t*.045;m.position.y-=a.fall;m.scale.multiplyScalar(.96);if(a.t>14){this.scene.remove(m);return false;}return true;}
  if(a.type==='pulse'){const s=1+Math.sin(Math.min(1,a.t/8)*Math.PI)*.12;m.scale.set(s,s,s);return a.t<8;}
  return false;});}
}
