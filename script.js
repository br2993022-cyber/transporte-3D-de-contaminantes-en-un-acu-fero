const canvas = document.getElementById('scene');
const wind = document.getElementById('wind');
const decay = document.getElementById('decay');
const density = document.getElementById('density');
const windVal = document.getElementById('windVal');
const decayVal = document.getElementById('decayVal');
const densVal = document.getElementById('densVal');
const btnGen = document.getElementById('generate');
const btnPause = document.getElementById('pause');
const spaceVal = document.getElementById('spaceVal');

wind.oninput = ()=> windVal.textContent = wind.value;
decay.oninput = ()=> decayVal.textContent = decay.value;
density.oninput = ()=> densVal.textContent = density.value;
spaceDecay.oninput = ()=> spaceVal.textContent = spaceDecay.value;

let renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setSize(innerWidth, innerHeight);
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000);
camera.position.set(0,0,40);
let group = new THREE.Group();
scene.add(group);


scene.add(new THREE.AmbientLight(0xffffff, 0.6));

let particles = null;
let paused = false;

function makeSprite() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grd = ctx.createRadialGradient(size/2,size/2,2,size/2,size/2,size/2);
  grd.addColorStop(0,'rgba(255,200,150,1)');
  grd.addColorStop(0.5,'rgba(83, 80, 255, 0.9)');
  grd.addColorStop(1,'rgba(255,130,80,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0,0,size,size);
  return new THREE.CanvasTexture(canvas);
}

const sprite = makeSprite();

function generateCloud(){
  if(particles) { group.remove(particles); particles.geometry.dispose(); particles.material.dispose(); particles = null; }
  const count = parseInt(density.value);
  const pos = new Float32Array(count*3);
  const vel = new Float32Array(count*3);
  for(let i=0;i<count;i++){
    const idx = i*3;
    pos[idx] = (Math.random()-0.5)*20;
    pos[idx+1] = (Math.random()-0.5)*20;
    pos[idx+2] = (Math.random()-0.5)*20;
    vel[idx] = (Math.random()-0.5)*0.02;
    vel[idx+1] = (Math.random()-0.5)*0.02;
    vel[idx+2] = (Math.random()-0.5)*0.02;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(pos,3));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(vel,3));
  const material = new THREE.PointsMaterial({size:0.35, map:sprite, transparent:true, depthTest:true});
  particles = new THREE.Points(geometry, material);
  group.add(particles);
}

btnGen.onclick = generateCloud;
btnPause.onclick = ()=> { paused = !paused; btnPause.textContent = paused? 'Continuar':'Pausar'; };


let isDown=false; let startX=0, startY=0;
window.addEventListener('mousedown', e=>{ isDown=true; startX=e.clientX; startY=e.clientY;});
window.addEventListener('mouseup', ()=> isDown=false);
window.addEventListener('mousemove', e=>{
  if(!isDown) return;
  const dx = (e.clientX - startX)/200;
  const dy = (e.clientY - startY)/200;
  group.rotation.y += dx;
  group.rotation.x += dy;
  startX = e.clientX; startY = e.clientY;
});

function animate(){
  requestAnimationFrame(animate);
  if(particles && !paused){
    const pos = particles.geometry.attributes.position.array;
    const vel = particles.geometry.attributes.velocity.array;
    const w = parseFloat(wind.value);
    const dec = parseFloat(decay.value);
    const sd = parseFloat(spaceDecay.value);
    for(let i=0;i<pos.length;i+=3){
      vel[i] += (Math.random()-0.5)*0.002; 
      pos[i] += vel[i] + w;
      pos[i+1] += vel[i+1];
      pos[i+2] += vel[i+2];
      pos[i] *= dec;
      pos[i+1] *= dec;
      pos[i+2] *= dec;
      
      pos[i] *= (1 - sd);
      pos[i+1] *= (1 - sd);
      pos[i+2] *= (1 - sd);
    }
    particles.geometry.attributes.position.needsUpdate = true;
  }
  renderer.render(scene,camera);
}
animate();

window.addEventListener('resize', ()=> { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();});
