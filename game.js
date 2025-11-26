/* -------------------------------------------------------
   ENHANCED SOUND SYSTEM WITH FALLBACKS
-------------------------------------------------------- */
let soundEnabled = true;
let highScore = localStorage.getItem('subwayCatHighScore') || 0;
let gamesPlayed = localStorage.getItem('subwayCatGamesPlayed') || 0;

// Update high score display
document.getElementById('highScore').textContent = highScore;
document.getElementById('gamesPlayed').textContent = gamesPlayed;

const soundPaths = {
  jump:     "assets/sounds/jump.wav",
  collect:  "assets/sounds/collect.wav",
  hit:      "assets/sounds/jump.wav",
  levelUp:  "assets/sounds/gameLevel.wav",
  gameOver: "assets/sounds/gameover.wav"
};

const sounds = {};

function loadSounds() {
  for (const key in soundPaths) {
    try {
      const audio = new Audio(soundPaths[key]);
      audio.preload = "auto";
      audio.volume = 0.7;
      sounds[key] = audio;
    } catch (e) {
      console.log(`Sound ${key} not available`);
      sounds[key] = null;
    }
  }
}

function playSound(name) {
  if (!soundEnabled || !sounds[name]) return;
  try {
    const sound = sounds[name].cloneNode();
    sound.volume = 0.7;
    sound.play().catch(() => {});
  } catch (e) {
    // Silent fail for audio errors
  }
}

loadSounds();

/* -------------------------------------------------------
   CANVAS & GAME SETUP
-------------------------------------------------------- */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const CANVAS_BASE_W = 1280;
const CANVAS_BASE_H = 720;

canvas.width = CANVAS_BASE_W;
canvas.height = CANVAS_BASE_H;

/* -------------------------------------------------------
   RESPONSIVE PLAYER SIZE
-------------------------------------------------------- */
function getResponsivePlayerSize() {
    const isMobile = window.innerWidth <= 767;
    const isSmallPhone = window.innerWidth <= 575;
    
    if (isSmallPhone) {
        return { width: 70, height: 70 };
    } else if (isMobile) {
        return { width: 80, height: 80 };
    } else {
        return { width: 96, height: 96 }; // Default size
    }
}

/* -------------------------------------------------------
   ENHANCED SPRITE SYSTEM WITH PROGRAMMATIC GRAPHICS
-------------------------------------------------------- */
function createProgrammaticCatSprite() {
  const spriteCanvas = document.createElement('canvas');
  const playerSize = getResponsivePlayerSize();
  spriteCanvas.width = playerSize.width * 4; // 4 frames
  spriteCanvas.height = playerSize.height;
  const spriteCtx = spriteCanvas.getContext('2d');
  
  // Draw 4 animation frames
  for (let frame = 0; frame < 4; frame++) {
    const frameX = frame * playerSize.width;
    const scale = playerSize.width / 96; // Scale factor based on original 96px size
    
    // Body with different colors per frame for animation effect
    const bodyColors = ['#FFB6C1', '#FFC2D1', '#FFAEC0', '#FF9AA2'];
    const earColors = ['#FF69B4', '#FF5C9D', '#FF4F86', '#FF4270'];
    
    // Scale all dimensions
    const bodyWidth = 56 * scale;
    const bodyHeight = 56 * scale;
    const bodyX = 20 * scale;
    const bodyY = 20 * scale;
    
    // Body
    spriteCtx.fillStyle = bodyColors[frame];
    spriteCtx.fillRect(frameX + bodyX, bodyY, bodyWidth, bodyHeight);
    
    // Head
    spriteCtx.fillStyle = bodyColors[frame];
    spriteCtx.fillRect(frameX + 40 * scale, 8 * scale, 40 * scale, 30 * scale);
    
    // Ears
    spriteCtx.fillStyle = earColors[frame];
    // Left ear
    spriteCtx.beginPath();
    spriteCtx.moveTo(frameX + 45 * scale, 8 * scale);
    spriteCtx.lineTo(frameX + 40 * scale, -5 * scale);
    spriteCtx.lineTo(frameX + 50 * scale, 8 * scale);
    spriteCtx.fill();
    
    // Right ear
    spriteCtx.beginPath();
    spriteCtx.moveTo(frameX + 75 * scale, 8 * scale);
    spriteCtx.lineTo(frameX + 80 * scale, -5 * scale);
    spriteCtx.lineTo(frameX + 70 * scale, 8 * scale);
    spriteCtx.fill();
    
    // Eyes (animate blinking)
    const eyeOpen = frame !== 1; // Frame 1 has closed eyes
    spriteCtx.fillStyle = '#87CEEB';
    if (eyeOpen) {
      spriteCtx.fillRect(frameX + 48 * scale, 18 * scale, 8 * scale, 8 * scale);
      spriteCtx.fillRect(frameX + 68 * scale, 18 * scale, 8 * scale, 8 * scale);
      
      // Pupils
      spriteCtx.fillStyle = '#4682B4';
      spriteCtx.fillRect(frameX + 50 * scale, 20 * scale, 4 * scale, 4 * scale);
      spriteCtx.fillRect(frameX + 70 * scale, 20 * scale, 4 * scale, 4 * scale);
    } else {
      // Closed eyes
      spriteCtx.strokeStyle = '#4682B4';
      spriteCtx.lineWidth = 2 * scale;
      spriteCtx.beginPath();
      spriteCtx.moveTo(frameX + 46 * scale, 22 * scale);
      spriteCtx.lineTo(frameX + 54 * scale, 22 * scale);
      spriteCtx.stroke();
      spriteCtx.beginPath();
      spriteCtx.moveTo(frameX + 66 * scale, 22 * scale);
      spriteCtx.lineTo(frameX + 74 * scale, 22 * scale);
      spriteCtx.stroke();
    }
    
    // Nose
    spriteCtx.fillStyle = '#FF69B4';
    spriteCtx.fillRect(frameX + 58 * scale, 26 * scale, 6 * scale, 4 * scale);
    
    // Mouth (smile animation)
    spriteCtx.strokeStyle = '#FF69B4';
    spriteCtx.lineWidth = 2 * scale;
    spriteCtx.beginPath();
    if (frame === 0 || frame === 2) {
      // Happy smile
      spriteCtx.arc(frameX + 61 * scale, 32 * scale, 6 * scale, 0.2, Math.PI - 0.2, false);
    } else {
      // Neutral line
      spriteCtx.moveTo(frameX + 55 * scale, 32 * scale);
      spriteCtx.lineTo(frameX + 67 * scale, 32 * scale);
    }
    spriteCtx.stroke();
    
    // Whiskers
    spriteCtx.strokeStyle = earColors[frame];
    spriteCtx.lineWidth = 1.5 * scale;
    
    // Left whiskers
    spriteCtx.beginPath();
    spriteCtx.moveTo(frameX + 40 * scale, 24 * scale);
    spriteCtx.lineTo(frameX + 25 * scale, 24 * scale);
    spriteCtx.stroke();
    
    spriteCtx.beginPath();
    spriteCtx.moveTo(frameX + 40 * scale, 28 * scale);
    spriteCtx.lineTo(frameX + 25 * scale, 28 * scale);
    spriteCtx.stroke();
    
    // Right whiskers
    spriteCtx.beginPath();
    spriteCtx.moveTo(frameX + 80 * scale, 24 * scale);
    spriteCtx.lineTo(frameX + 95 * scale, 24 * scale);
    spriteCtx.stroke();
    
    spriteCtx.beginPath();
    spriteCtx.moveTo(frameX + 80 * scale, 28 * scale);
    spriteCtx.lineTo(frameX + 95 * scale, 28 * scale);
    spriteCtx.stroke();
    
    // Tail (animated)
    spriteCtx.strokeStyle = earColors[frame];
    spriteCtx.lineWidth = 6 * scale;
    spriteCtx.beginPath();
    const tailCurve = frame * 2 * scale;
    spriteCtx.moveTo(frameX + 15 * scale, 45 * scale);
    spriteCtx.quadraticCurveTo(
      frameX + (5 - tailCurve) * scale, 
      (30 - tailCurve) * scale, 
      frameX + 12 * scale, 
      (20 - tailCurve) * scale
    );
    spriteCtx.stroke();
  }
  
  return spriteCanvas;
}

let programmaticSprite = createProgrammaticCatSprite();
let spriteLoaded = true;

/* -------------------------------------------------------
   GAME STATE + VARIABLES
-------------------------------------------------------- */
const STATE = { MENU:"menu", PLAYING:"playing", PAUSED:"paused", GAMEOVER:"gameover" };
let gameState = STATE.MENU;

let player, obstacles, collectibles, particles, backgrounds;
const GROUND_H = 120;

let score = 0;
let lives = 3;
let level = 1;
let gameSpeed = 4;
let obstacleSpawnTimer = 0;
let collectibleSpawnTimer = 0;

const MAX_LIVES = 5;

/* -------------------------------------------------------
   PARTICLE SYSTEM
-------------------------------------------------------- */
class Particle {
  constructor(x, y, color, size = 4) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8;
    this.color = color;
    this.size = size;
    this.life = 1.0;
    this.decay = 0.02;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    this.size *= 0.95;
  }
  
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function createParticles(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color, Math.random() * 6 + 2));
  }
}

/* -------------------------------------------------------
   UI ELEMENTS
-------------------------------------------------------- */
const uiScore = document.getElementById("ui-score");
const uiLives = document.getElementById("ui-lives");
const uiLevel = document.getElementById("ui-level");
const uiSpeed = document.getElementById("ui-speed");
const finalScore = document.getElementById("finalScore");
const finalLevel = document.getElementById("finalLevel");

const startOverlay = document.getElementById("startOverlay");
const pauseOverlay = document.getElementById("pauseOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");

/* -------------------------------------------------------
   INPUT SYSTEM
-------------------------------------------------------- */
const keys = {};
window.addEventListener("keydown", e => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'a', 'd'].includes(e.key)) {
    keys[e.key] = true;
  }
});
window.addEventListener("keyup", e => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'a', 'd'].includes(e.key)) {
    keys[e.key] = false;
  }
});

/* Enhanced Touch Controls */
let touchState = { left: false, right: false, jump: false };

function setupTouchControls() {
  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");
  const jumpBtn = document.getElementById("jumpBtn");
  
  const activate = (btn, stateKey) => {
    const setState = (value) => {
      touchState[stateKey] = value;
    };
    
    btn.addEventListener('mousedown', () => setState(true));
    btn.addEventListener('mouseup', () => setState(false));
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); setState(true); });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); setState(false); });
    btn.addEventListener('touchcancel', () => setState(false));
  };
  
  activate(leftBtn, 'left');
  activate(rightBtn, 'right');
  activate(jumpBtn, 'jump');
}

setupTouchControls();

/* -------------------------------------------------------
   RESET GAME
-------------------------------------------------------- */
function resetGame() {
    const playerSize = getResponsivePlayerSize();
    
    player = {
        x: 180,
        y: canvas.height - GROUND_H - playerSize.height,
        vx: 0,
        vy: 0,
        w: playerSize.width,
        h: playerSize.height,
        speed: 8,
        jumpPower: -20,
        gravity: 0.8,
        onGround: true,
        frame: 0,
        frameCount: 4,
        frameDelay: 8,
        frameTimer: 0
    };

    obstacles = [];
    collectibles = [];
    particles = [];
    backgrounds = [];
    
    // Create parallax background layers
    for (let i = 0; i < 3; i++) {
        backgrounds.push({
        x: i * canvas.width,
        speed: 1 + i * 0.5,
        color: i === 0 ? '#B0E0E6' : i === 1 ? '#87CEEB' : '#4682B4'
        });
    }

    score = 0;
    lives = 3;
    level = 1;
    gameSpeed = 4;
    obstacleSpawnTimer = 0;
    collectibleSpawnTimer = 0;

    updateUI();
}

/* -------------------------------------------------------
   UPDATE GAME
-------------------------------------------------------- */
function update(dt) {
  const delta = Math.min(dt / 16, 2); // Cap delta time
  
  // Input handling
  const left = keys["ArrowLeft"] || keys["a"] || touchState.left;
  const right = keys["ArrowRight"] || keys["d"] || touchState.right;
  const jump = keys["ArrowUp"] || keys[" "] || touchState.jump;

  // Player movement
  player.vx = 0;
  if (left) player.vx = -player.speed;
  if (right) player.vx = player.speed;

  // Jumping
  if (jump && player.onGround) {
    player.vy = player.jumpPower;
    player.onGround = false;
    playSound("jump");
    createParticles(player.x + player.w/2, player.y + player.h, 8, '#FFD700');
  }

  // Apply physics
  player.vy += player.gravity;
  player.x += player.vx * delta;
  player.y += player.vy * delta;

  // Ground collision
  if (player.y >= canvas.height - GROUND_H - player.h) {
    player.y = canvas.height - GROUND_H - player.h;
    player.vy = 0;
    player.onGround = true;
  }

  // Screen boundaries
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

  // Update backgrounds (parallax)
  backgrounds.forEach(bg => {
    bg.x -= bg.speed * delta;
    if (bg.x <= -canvas.width) bg.x = canvas.width;
  });

  // Animation
  player.frameTimer += delta;
  if (player.frameTimer >= player.frameDelay) {
    player.frame = (player.frame + 1) % player.frameCount;
    player.frameTimer = 0;
  }

  // Spawn obstacles
  obstacleSpawnTimer += delta;
  if (obstacleSpawnTimer >= 60 - level * 5) { // Faster spawning as level increases
    spawnObstacle();
    obstacleSpawnTimer = 0;
  }

  // Spawn collectibles
  collectibleSpawnTimer += delta;
  if (collectibleSpawnTimer >= 90) {
    spawnCollectible();
    collectibleSpawnTimer = 0;
  }

  // Update obstacles
  obstacles.forEach((obstacle, index) => {
    obstacle.x -= obstacle.speed * delta * gameSpeed;
    
    if (obstacle.x + obstacle.w < 0) {
      obstacles.splice(index, 1);
      return;
    }

    if (checkCollision(player, obstacle)) {
      obstacles.splice(index, 1);
      lives--;
      playSound("hit");
      createParticles(player.x + player.w/2, player.y + player.h/2, 15, '#FF6B6B');
      updateUI();
      
      if (lives <= 0) {
        endGame();
        return;
      }
    }
  });

  // Update collectibles
  collectibles.forEach((collectible, index) => {
    collectible.x -= collectible.speed * delta * gameSpeed;
    
    if (collectible.x + collectible.w < 0) {
      collectibles.splice(index, 1);
      return;
    }

    // Floating animation
    collectible.y += Math.sin(Date.now() * 0.005 + index) * 0.5;

    if (checkCollision(player, collectible)) {
      handleCollectible(collectible, index);
    }
  });

  // Update particles
  particles.forEach((particle, index) => {
    particle.update();
    if (particle.life <= 0) {
      particles.splice(index, 1);
    }
  });

  // Level progression
  if (score >= level * 100) {
    levelUp();
  }
}

function spawnObstacle() {
  // Minimum distance between obstacles - increased for more space
  const MIN_GAP = 350; // Increased from 200 to 350 for more space

  // Check last obstacle
  if (obstacles.length > 0) {
    const last = obstacles[obstacles.length - 1];

    // If last obstacle is still too close, DO NOT spawn
    if (last.x > canvas.width - MIN_GAP) {
      return;
    }
  }

  const types = [
    { w: 60, h: 80, color: '#8B4513', type: 'crate' },
    { w: 40, h: 120, color: '#A0522D', type: 'barrier' },
    { w: 100, h: 60, color: '#CD853F', type: 'low' }
  ];
  
  const type = types[Math.floor(Math.random() * types.length)];

  obstacles.push({
    x: canvas.width,
    y: canvas.height - GROUND_H - type.h,
    w: type.w,
    h: type.h,
    color: type.color,
    type: type.type,
    speed: 1
  });
}

function spawnCollectible() {
  const types = [
    { w: 30, h: 30, color: '#FFD700', type: 'fish', points: 10 },
    { w: 35, h: 35, color: '#FF6B6B', type: 'heart', points: 0, life: 1 },
    { w: 25, h: 25, color: '#4ECDC4', type: 'star', points: 25 }
  ];
  
  const type = types[Math.floor(Math.random() * types.length)];
  collectibles.push({
    x: canvas.width,
    y: Math.random() * (canvas.height - GROUND_H - 100) + 50,
    w: type.w,
    h: type.h,
    color: type.color,
    type: type.type,
    points: type.points,
    life: type.life || 0,
    speed: 0.8
  });
}

function handleCollectible(collectible, index) {
  switch (collectible.type) {
    case 'fish':
    case 'star':
      score += collectible.points;
      playSound("collect");
      break;
    case 'heart':
      lives = Math.min(MAX_LIVES, lives + collectible.life);
      playSound("collect");
      break;
  }
  
  createParticles(collectible.x + collectible.w/2, collectible.y + collectible.h/2, 12, collectible.color);
  collectibles.splice(index, 1);
  updateUI();
}

function levelUp() {
  level++;
  gameSpeed += 0.2;
  playSound("levelUp");
  createParticles(canvas.width/2, canvas.height/2, 25, '#4ECDC4');
  updateUI();
}

/* -------------------------------------------------------
   COLLISION DETECTION
-------------------------------------------------------- */
function checkCollision(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

/* -------------------------------------------------------
   ENHANCED RENDERING
-------------------------------------------------------- */
function draw() {
  // Clear canvas
  ctx.fillStyle = '#E0F7FA';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw parallax backgrounds
  backgrounds.forEach((bg, index) => {
    ctx.fillStyle = bg.color;
    ctx.globalAlpha = 0.3 - index * 0.1;
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(bg.x + i * canvas.width, 0, canvas.width, canvas.height);
    }
  });
  ctx.globalAlpha = 1;
  
  // Draw subway details
  drawSubwayDetails();
  
  // Draw ground
  ctx.fillStyle = '#FFCCBC';
  ctx.fillRect(0, canvas.height - GROUND_H, canvas.width, GROUND_H);
  
  // Draw ground pattern
  ctx.strokeStyle = '#FFAB91';
  ctx.lineWidth = 3;
  ctx.setLineDash([20, 15]);
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - GROUND_H/2);
  ctx.lineTo(canvas.width, canvas.height - GROUND_H/2);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Draw collectibles
  collectibles.forEach(collectible => {
    ctx.fillStyle = collectible.color;
    
    switch (collectible.type) {
      case 'fish':
        drawFish(collectible.x, collectible.y, collectible.w, collectible.h);
        break;
      case 'heart':
        drawHeart(collectible.x, collectible.y, collectible.w, collectible.h);
        break;
      case 'star':
        drawStar(collectible.x, collectible.y, collectible.w, collectible.h);
        break;
    }
  });
  
  // Draw obstacles
  obstacles.forEach(obstacle => {
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    
    // Add details based on obstacle type
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.strokeRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    
    if (obstacle.type === 'crate') {
      ctx.strokeStyle = '#A0522D';
      ctx.beginPath();
      ctx.moveTo(obstacle.x + obstacle.w/2, obstacle.y);
      ctx.lineTo(obstacle.x + obstacle.w/2, obstacle.y + obstacle.h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(obstacle.x, obstacle.y + obstacle.h/2);
      ctx.lineTo(obstacle.x + obstacle.w, obstacle.y + obstacle.h/2);
      ctx.stroke();
    }
  });
  
  // Draw particles
  particles.forEach(particle => {
    particle.draw(ctx);
  });
  
  // Draw player
  drawPlayer();
  
  // Draw HUD
  drawHUD();
}

function drawSubwayDetails() {
  // Draw subway windows
  ctx.fillStyle = '#B0E0E6';
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(i * 160 + 40, 80, 80, 120);
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(i * 160 + 50, 90, 60, 100);
    ctx.fillStyle = '#B0E0E6';
  }
  
  // Draw ceiling
  ctx.fillStyle = '#795548';
  ctx.fillRect(0, 0, canvas.width, 60);
  
  // Draw lights
  ctx.fillStyle = '#FFD700';
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.arc(i * 130 + 65, 30, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer() {
  if (spriteLoaded) {
    const frameWidth = programmaticSprite.width / 4;
    const frameHeight = programmaticSprite.height;
    const frameX = player.frame * frameWidth;
    
    ctx.drawImage(
      programmaticSprite,
      frameX, 0, frameWidth, frameHeight,
      player.x, player.y, player.w, player.h
    );
  } else {
    // Fallback rectangle player
    ctx.fillStyle = '#FFB6C1';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(player.x + 70, player.y - 10, 20, 20);
  }
  
  // Draw shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(player.x + player.w/2, canvas.height - GROUND_H + 10, player.w/2, 10, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawFish(x, y, w, h) {
  ctx.save();
  ctx.translate(x + w/2, y + h/2);
  
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.ellipse(0, 0, w/2, h/3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Tail
  ctx.beginPath();
  ctx.moveTo(-w/2, 0);
  ctx.lineTo(-w/2 - 8, -h/4);
  ctx.lineTo(-w/2 - 8, h/4);
  ctx.closePath();
  ctx.fill();
  
  // Eye
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(w/4, -h/6, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(w/4, -h/6, 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawHeart(x, y, w, h) {
  ctx.save();
  ctx.translate(x + w/2, y + h/2);
  
  ctx.fillStyle = '#FF6B6B';
  ctx.beginPath();
  ctx.moveTo(0, 3);
  ctx.bezierCurveTo(6, -6, 12, 3, 0, 12);
  ctx.bezierCurveTo(-12, 3, -6, -6, 0, 3);
  ctx.fill();
  
  ctx.restore();
}

function drawStar(x, y, w, h) {
  ctx.save();
  ctx.translate(x + w/2, y + h/2);
  
  ctx.fillStyle = '#4ECDC4';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const x1 = Math.cos(angle) * w/2;
    const y1 = Math.sin(angle) * h/2;
    ctx.lineTo(x1, y1);
    
    const angle2 = angle + Math.PI / 5;
    const x2 = Math.cos(angle2) * w/4;
    const y2 = Math.sin(angle2) * h/4;
    ctx.lineTo(x2, y2);
  }
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(20, 20, 200, 60);
  ctx.fillRect(canvas.width/2 - 100, 20, 200, 60);
  ctx.fillRect(canvas.width - 220, 20, 200, 60);
  
  ctx.fillStyle = '#5D4037';
  ctx.font = 'bold 24px Segoe UI';
  ctx.textAlign = 'left';
  ctx.fillText(`⭐ ${score}`, 40, 50);
  ctx.textAlign = 'center';
  ctx.fillText(`❤️ ${lives}`, canvas.width/2, 50);
  ctx.textAlign = 'right';
  ctx.fillText(`🎯 ${level}`, canvas.width - 40, 50);
}

/* -------------------------------------------------------
   GAME LOOP
-------------------------------------------------------- */
let lastTime = 0;
let running = false;

function gameLoop(timestamp) {
  if (!running) return;
  
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  
  update(deltaTime);
  draw();
  
  requestAnimationFrame(gameLoop);
}

/* -------------------------------------------------------
   GAME STATE MANAGEMENT
-------------------------------------------------------- */
function startGame() {
  resetGame();
  running = true;
  gameState = STATE.PLAYING;
  startOverlay.classList.add("hidden");
  gameOverOverlay.classList.add("hidden");
  pauseOverlay.classList.add("hidden");
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
  
  // Track games played
  gamesPlayed++;
  localStorage.setItem('subwayCatGamesPlayed', gamesPlayed);
  document.getElementById('gamesPlayed').textContent = gamesPlayed;
}

function endGame() {
  running = false;
  gameState = STATE.GAMEOVER;
  finalScore.textContent = score;
  finalLevel.textContent = level;
  gameOverOverlay.classList.remove("hidden");
  playSound("gameOver");
  
  // Update high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('subwayCatHighScore', highScore);
    document.getElementById('highScore').textContent = highScore;
  }
}

function togglePause() {
  if (gameState === STATE.PLAYING) {
    running = false;
    gameState = STATE.PAUSED;
    pauseOverlay.classList.remove("hidden");
  } else if (gameState === STATE.PAUSED) {
    pauseOverlay.classList.add("hidden");
    running = true;
    gameState = STATE.PLAYING;
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
  }
}

function goToMenu() {
  running = false;
  gameState = STATE.MENU;
  startOverlay.classList.remove("hidden");
  gameOverOverlay.classList.add("hidden");
  pauseOverlay.classList.add("hidden");
}

/* -------------------------------------------------------
   UI BUTTONS
-------------------------------------------------------- */
document.getElementById("startBtn").onclick = startGame;
document.getElementById("pauseBtn").onclick = togglePause;
document.getElementById("resumeBtn").onclick = togglePause;
document.getElementById("restartBtn").onclick = startGame;
document.getElementById("tryAgainBtn").onclick = startGame;
document.getElementById("menuBtn").onclick = goToMenu;

document.getElementById("muteBtn").onclick = () => {
  soundEnabled = !soundEnabled;
  document.getElementById("muteBtn").textContent = soundEnabled ? "🔊" : "🔇";
};

document.getElementById("howBtn").onclick = () => {
  alert(`🎮 HOW TO PLAY:\n\n← → or A/D to move\n↑ or SPACE to jump\n\n🎯 COLLECT:\n⭐ Fish = 10 points\n💖 Hearts = +1 life\n🌟 Stars = 25 points\n\n🚫 AVOID obstacles!\n\n📱 Mobile: Use touch controls\n\nGood luck! 🐱`);
};

/* -------------------------------------------------------
   UPDATE UI
-------------------------------------------------------- */
function updateUI() {
  uiScore.textContent = score;
  uiLives.textContent = lives;
  uiLevel.textContent = level;
  uiSpeed.textContent = gameSpeed.toFixed(1) + 'x';
}

// Handle window resize
window.addEventListener('resize', () => {
    // Recreate the sprite with new size
    programmaticSprite = createProgrammaticCatSprite();
    
    if (gameState === STATE.PLAYING) {
        const playerSize = getResponsivePlayerSize();
        player.w = playerSize.width;
        player.h = playerSize.height;
        player.y = canvas.height - GROUND_H - playerSize.height;
    }
});

/* -------------------------------------------------------
   INITIALIZE GAME
-------------------------------------------------------- */
goToMenu();
updateUI();

// Auto-show touch controls on mobile
if ('ontouchstart' in window || navigator.maxTouchPoints) {
  document.getElementById('touchControls').style.display = 'flex';
}