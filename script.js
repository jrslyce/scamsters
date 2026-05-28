const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const restartBtn = document.getElementById('restart');

const keys = new Set();
const labels = ['Fake Bank Alert', 'Lottery Winner', 'Urgent OTP Request', 'Crypto Double Offer', 'Remote Job Trap'];

const game = {
  running: true,
  score: 0,
  lives: 3,
  speed: 2,
  spawnEveryMs: 900,
  lastSpawn: 0,
  hazards: [],
  player: { x: 80, y: 220, w: 36, h: 36, speed: 4 }
};

function reset() {
  game.running = true;
  game.score = 0;
  game.lives = 3;
  game.speed = 2;
  game.spawnEveryMs = 900;
  game.lastSpawn = 0;
  game.hazards = [];
  game.player.x = 80;
  game.player.y = 220;
  restartBtn.hidden = true;
}

function spawnHazard() {
  const h = 34 + Math.random() * 18;
  const w = 130 + Math.random() * 40;
  const y = Math.random() * (canvas.height - h);
  const label = labels[Math.floor(Math.random() * labels.length)];

  game.hazards.push({
    x: canvas.width + w,
    y,
    w,
    h,
    label,
    speed: game.speed + Math.random() * 1.8
  });
}

function updatePlayer() {
  const p = game.player;
  if (keys.has('ArrowLeft') || keys.has('a')) p.x -= p.speed;
  if (keys.has('ArrowRight') || keys.has('d')) p.x += p.speed;
  if (keys.has('ArrowUp') || keys.has('w')) p.y -= p.speed;
  if (keys.has('ArrowDown') || keys.has('s')) p.y += p.speed;
  p.x = Math.max(0, Math.min(canvas.width - p.w, p.x));
  p.y = Math.max(0, Math.min(canvas.height - p.h, p.y));
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function update(dt, now) {
  if (!game.running) return;

  updatePlayer();

  if (now - game.lastSpawn > game.spawnEveryMs) {
    spawnHazard();
    game.lastSpawn = now;
  }

  game.hazards.forEach((hz) => {
    hz.x -= hz.speed;
  });

  game.hazards = game.hazards.filter((hz) => {
    if (intersects(game.player, hz)) {
      game.lives -= 1;
      if (game.lives <= 0) {
        game.running = false;
        restartBtn.hidden = false;
      }
      return false;
    }

    if (hz.x + hz.w < 0) {
      game.score += 10;
      game.speed += 0.03;
      game.spawnEveryMs = Math.max(420, game.spawnEveryMs - 5);
      return false;
    }

    return true;
  });

  scoreEl.textContent = String(game.score);
  livesEl.textContent = String(game.lives);
}

function drawPlayer() {
  const p = game.player;
  ctx.fillStyle = '#2ea043';
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.fillStyle = '#0d1117';
  ctx.font = 'bold 18px system-ui';
  ctx.fillText('U', p.x + 10, p.y + 24);
}

function drawHazards() {
  game.hazards.forEach((hz) => {
    ctx.fillStyle = '#f85149';
    ctx.fillRect(hz.x, hz.y, hz.w, hz.h);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px system-ui';
    ctx.fillText(hz.label, hz.x + 8, hz.y + hz.h / 2 + 4);
  });
}

function drawOverlay() {
  if (game.running) return;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 38px system-ui';
  ctx.fillText('Game Over', canvas.width / 2 - 110, canvas.height / 2 - 10);
  ctx.font = '20px system-ui';
  ctx.fillText(`Final score: ${game.score}`, canvas.width / 2 - 80, canvas.height / 2 + 26);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawHazards();
  drawOverlay();
}

let last = performance.now();
function loop(now) {
  const dt = now - last;
  last = now;
  update(dt, now);
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener('keydown', (e) => keys.add(e.key));
document.addEventListener('keyup', (e) => keys.delete(e.key));
restartBtn.addEventListener('click', reset);

reset();
requestAnimationFrame(loop);
