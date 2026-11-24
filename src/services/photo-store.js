const DB_NAME = 'rhokairoz';
const STORE = 'photos';
const THUMB = 96;

export const MAX_PHOTOS = 8;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function request(mode, action) {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = action(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(req.result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  }));
}

export function listPhotos() {
  return request('readonly', (store) => store.getAll());
}

export function removePhoto(id) {
  return request('readwrite', (store) => store.delete(id));
}

function countPhotos() {
  return request('readonly', (store) => store.count());
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen')); };
    img.src = url;
  });
}

// Recorta al centro en cuadrado y reduce a THUMB x THUMB.
function toThumbnail(img) {
  const canvas = document.createElement('canvas');
  canvas.width = THUMB;
  canvas.height = THUMB;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#202630';
  ctx.fillRect(0, 0, THUMB, THUMB);
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, THUMB, THUMB);
  return canvas.toDataURL('image/jpeg', 0.8);
}

// Devuelve true si guardó la foto y false si ya se alcanzó el límite.
export async function addPhotoFromFile(file) {
  if (!file.type.startsWith('image/')) throw new Error('El archivo no es una imagen');
  if ((await countPhotos()) >= MAX_PHOTOS) return false;
  const img = await loadImage(file);
  const data = toThumbnail(img);
  await request('readwrite', (store) => store.add({ data, addedAt: Date.now() }));
  return true;
    }
