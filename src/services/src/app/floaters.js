import { listPhotos } from '../services/photo-store.js';

const SIZE = 56;
const STORAGE_KEY = 'rhokairoz.floaters';
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

let layer = null;
let sprites = [];
let rafId = 0;
let lastTime = 0;
let version = 0;

export function isEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch (error) {
    return true;
  }
}

export function setEnabled(on) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
  } catch (error) {
    // Sin almacenamiento disponible: la preferencia solo vale en esta sesión.
  }
}

function ensureLayer() {
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'floaters';
    layer.setAttribute('aria-hidden', 'true');
    document.body.append(layer);
  }
  return layer;
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randomSign() {
  return Math.random() < 0.5 ? -1 : 1;
}

function bounds() {
  return {
    maxX: Math.max(0, layer.clientWidth - SIZE),
    maxY: Math.max(0, layer.clientHeight - SIZE)
  };
}

function draw(sprite) {
  sprite.el.style.transform = `translate3d(${sprite.x}px, ${sprite.y}px, 0)`;
}

function makeSprite(photo) {
  const el = document.createElement('img');
  el.className = 'floater';
  el.alt = '';
  el.src = photo.data;
  const { maxX, maxY } = bounds();
  return {
    el,
    x: rand(0, maxX),
    y: rand(0, maxY),
    vx: randomSign() * rand(35, 85),
    vy: randomSign() * rand(35, 85)
  };
}

function step(now) {
  const dt = Math.max(0, Math.min((now - lastTime) / 1000, 0.05));
  lastTime = now;
  const { maxX, maxY } = bounds();
  for (const s of sprites) {
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    if (s.x <= 0) {
      s.x = 0;
      s.vx = Math.abs(s.vx);
    } else if (s.x >= maxX) {
      s.x = maxX;
      s.vx = -Math.abs(s.vx);
    }
    if (s.y <= 0) {
      s.y = 0;
      s.vy = Math.abs(s.vy);
    } else if (s.y >= maxY) {
      s.y = maxY;
      s.vy = -Math.abs(s.vy);
    }
    draw(s);
  }
  rafId = requestAnimationFrame(step);
}

function stop() {
  cancelAnimationFrame(rafId);
  rafId = 0;
}

function start() {
  if (rafId || motion.matches || document.hidden || sprites.length === 0) return;
  lastTime = performance.now();
  rafId = requestAnimationFrame(step);
}

export async function refreshFloaters() {
  const mine = ++version;
  stop();
  const host = ensureLayer();
  host.replaceChildren();
  sprites = [];
  if (!isEnabled()) return;

  let photos = [];
  try {
    photos = await listPhotos();
  } catch (error) {
    console.error('RHOKAIROZ: no se pudieron leer las fotos', error);
    return;
  }
  if (mine !== version) return;

  sprites = photos.map(makeSprite);
  for (const s of sprites) {
    draw(s);
    host.append(s.el);
  }
  start();
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stop();
  else start();
});

window.addEventListener('resize', () => {
  if (!layer) return;
  const { maxX, maxY } = bounds();
  for (const s of sprites) {
    s.x = Math.min(s.x, maxX);
    s.y = Math.min(s.y, maxY);
    draw(s);
  }
});

motion.addEventListener('change', refreshFloaters);
