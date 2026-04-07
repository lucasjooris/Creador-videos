/* ──────────────────────────────────────────────────────────
   Panel visual — Belga Inmobiliaria
   ────────────────────────────────────────────────────────── */

const form        = document.getElementById('property-form');
const btnRender   = document.getElementById('btn-render');
const btnText     = document.getElementById('btn-text');
const btnNew      = document.getElementById('btn-new');
const outputSec   = document.getElementById('output-section');
const logArea     = document.getElementById('log-area');
const progressBar = document.getElementById('progress-bar');
const downloadWrap= document.getElementById('download-wrap');

/* ── Helpers ─────────────────────────────────────────────── */
function addLog(type, message) {
  const p = document.createElement('p');
  p.className = 'log-' + type;
  p.textContent = message;
  logArea.appendChild(p);
  logArea.scrollTop = logArea.scrollHeight;
}

function setProgress(pct) {
  progressBar.style.width = pct + '%';
}

function resetOutput() {
  logArea.innerHTML = '';
  downloadWrap.style.display = 'none';
  setProgress(0);
}

/* ── Validar campos ──────────────────────────────────────── */
function validate(data) {
  const errors = [];
  if (!data.imageUrl)      errors.push('Completá la URL de la foto');
  if (!data.priceUSD || data.priceUSD <= 0) errors.push('Ingresá un precio válido');
  if (!data.surfaceM2 || data.surfaceM2 <= 0) errors.push('Ingresá la superficie');
  if (!data.rooms || data.rooms <= 0) errors.push('Ingresá la cantidad de ambientes');
  if (!data.neighborhood)  errors.push('Ingresá el barrio');
  return errors;
}

/* ── Leer formulario ─────────────────────────────────────── */
function getFormData() {
  const fd = new FormData(form);
  return {
    imageUrl:     fd.get('imageUrl').trim(),
    priceUSD:     Number(fd.get('priceUSD')),
    surfaceM2:    Number(fd.get('surfaceM2')),
    rooms:        Number(fd.get('rooms')),
    neighborhood: fd.get('neighborhood').trim(),
    operation:    fd.get('operation'),
    tagline:      fd.get('tagline').trim() || undefined,
  };
}

/* ── Submit ──────────────────────────────────────────────── */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = getFormData();
  const errors = validate(data);

  if (errors.length) {
    alert('Por favor corregí los siguientes campos:\n\n• ' + errors.join('\n• '));
    return;
  }

  // Preparar UI
  btnRender.disabled = true;
  btnText.textContent = '⏳ Renderizando…';
  resetOutput();
  outputSec.style.display = 'block';
  outputSec.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Animación de progreso indeterminada
  let fakePct = 0;
  const fakeInterval = setInterval(() => {
    if (fakePct < 85) {
      fakePct += Math.random() * 3;
      setProgress(Math.min(fakePct, 85));
    }
  }, 400);

  try {
    const res = await fetch('/api/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error desconocido');
    }

    // Leer stream de eventos
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let done = false;

    while (!done) {
      const { value, done: streamDone } = await reader.read();
      done = streamDone;
      if (value) buffer += decoder.decode(value, { stream: true });

      // Parsear eventos SSE del buffer
      const lines = buffer.split('\n');
      buffer = lines.pop(); // conservar línea incompleta

      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        try {
          const { type, message } = JSON.parse(line.slice(5).trim());
          addLog(type, message);

          if (type === 'done') {
            clearInterval(fakeInterval);
            setProgress(100);
            downloadWrap.style.display = 'flex';
          }

          if (type === 'error') {
            clearInterval(fakeInterval);
            setProgress(0);
          }
        } catch (_) { /* ignorar líneas malformadas */ }
      }
    }
  } catch (err) {
    clearInterval(fakeInterval);
    addLog('error', 'Error de conexión: ' + err.message);
    setProgress(0);
  } finally {
    btnRender.disabled = false;
    btnText.textContent = '▶ Generar Video';
  }
});

/* ── Botón "crear otro video" ────────────────────────────── */
btnNew.addEventListener('click', () => {
  outputSec.style.display = 'none';
  resetOutput();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
