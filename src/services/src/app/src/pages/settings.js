import { h } from '../utils/dom.js';
import { APP_NAME } from '../app/brand.js';
import { listPhotos, addPhotoFromFile, removePhoto, MAX_PHOTOS } from '../services/photo-store.js';
import { isEnabled, setEnabled, refreshFloaters } from '../app/floaters.js';

export function renderSettings() {
  const status = h('p', { class: 'note-live', role: 'status' });
  const counter = h('p', { class: 'lede' });
  const grid = h('ul', { class: 'thumbs' });
  const input = h('input', { type: 'file', accept: 'image/*', multiple: true, class: 'sr-only' });
  const toggle = h('input', { type: 'checkbox', id: 'floaters-toggle' });
  toggle.checked = isEnabled();

  async function remove(id) {
    try {
      await removePhoto(id);
      status.textContent = 'Foto quitada.';
    } catch (error) {
      status.textContent = 'No se pudo quitar la foto.';
    }
    await reload();
    await refreshFloaters();
  }

  function thumb(photo) {
    const button = h('button', { type: 'button', class: 'btn' }, 'Quitar');
    button.setAttribute('aria-label', 'Quitar esta foto');
    button.addEventListener('click', () => remove(photo.id));
    return h('li', {}, h('img', { src: photo.data, alt: 'Foto elegida' }), button);
  }

  async function reload() {
    let photos = [];
    try {
      photos = await listPhotos();
    } catch (error) {
      status.textContent = 'No se pudieron leer las fotos guardadas en este navegador.';
      return;
    }
    counter.textContent = `${photos.length} de ${MAX_PHOTOS} fotos`;
    grid.replaceChildren(...photos.map(thumb));
  }

  toggle.addEventListener('change', () => {
    setEnabled(toggle.checked);
    refreshFloaters();
  });

  input.addEventListener('change', async () => {
    const files = Array.from(input.files || []);
    input.value = '';
    if (files.length === 0) return;
    status.textContent = 'Guardando fotos…';
    let saved = 0;
    let failed = 0;
    let full = false;
    for (const file of files) {
      try {
        if (await addPhotoFromFile(file)) {
          saved += 1;
        } else {
          full = true;
          break;
        }
      } catch (error) {
        console.error(`${APP_NAME}: no se pudo guardar la foto`, error);
        failed += 1;
      }
    }
    const parts = [];
    if (saved) parts.push(`Se guardaron ${saved} foto(s).`);
    if (failed) parts.push(`No se pudieron leer ${failed} archivo(s).`);
    if (full) parts.push(`Llegaste al límite de ${MAX_PHOTOS} fotos; quita alguna para agregar otra.`);
    status.textContent = parts.join(' ') || 'No se guardó ninguna foto.';
    await reload();
    await refreshFloaters();
  });

  const section = h('section', { class: 'page' },
    h('h1', {}, 'Configuración'),
    h('h2', {}, 'Fotos flotantes'),
    h('p', { class: 'lede' },
      'Elige fotos pequeñas que se mueven por la pantalla y rebotan en los bordes. ' +
      'Se reducen y se guardan solo en este dispositivo; no se suben a ningún servidor.'),
    h('div', { class: 'field' }, toggle, h('label', { for: 'floaters-toggle' }, 'Mostrar fotos flotantes')),
    counter,
    h('label', { class: 'btn' }, 'Elegir fotos', input),
    status,
    grid
  );

  reload();
  return section;
                            }
