/* ──────────────────────────────────────────────────────────
   Panel visual — Belga Inmobiliaria
   ────────────────────────────────────────────────────────── */

// ── Auth ──────────────────────────────────────────────────────────────────
const loginScreen  = document.getElementById('login-screen');
const mainContent  = document.getElementById('main-content');
const mainFooter   = document.getElementById('main-footer');
const loginForm    = document.getElementById('login-form');
const loginError   = document.getElementById('login-error');
const loginInput   = document.getElementById('login-password');

// La contraseña se guarda en sessionStorage para no pedirla en cada recarga
let authToken = sessionStorage.getItem('panel_token') || null;

async function checkAuth() {
  if (!authToken) {
    // Probar sin token — si el servidor no requiere auth, devuelve 200
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: '' }),
    });
    if (res.ok) {
      showPanel();
      return;
    }
    showLogin();
    return;
  }

  // Verificar token guardado
  const res = await fetch('/api/render', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-panel-token': authToken,
    },
    body: JSON.stringify({ data: {} }), // datos vacíos → 400, no 401
  });

  if (res.status === 401) {
    sessionStorage.removeItem('panel_token');
    authToken = null;
    showLogin();
  } else {
    showPanel();
  }
}

function showLogin() {
  loginScreen.style.display = 'flex';
  mainContent.style.display = 'none';
  mainFooter.style.display  = 'none';
}

function showPanel() {
  loginScreen.style.display = 'none';
  mainContent.style.display = 'block';
  mainFooter.style.display  = 'block';
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.style.display = 'none';
  const password = loginInput.value;

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  if (res.ok) {
    authToken = password;
    sessionStorage.setItem('panel_token', password);
    showPanel();
  } else {
    loginError.style.display = 'block';
    loginInput.value = '';
    loginInput.focus();
  }
});

// Agregar token a todas las requests autenticadas
function authHeaders() {
  return authToken
    ? { 'Content-Type': 'application/json', 'x-panel-token': authToken }
    : { 'Content-Type': 'application/json' };
}

// ── Panel ─────────────────────────────────────────────────────────────────
const form        = document.getElementById('property-form');
const btnRender   = document.getElementById('btn-render');
const btnText     = document.getElementById('btn-text');
const btnNew      = document.getElementById('btn-new');
const outputSec   = document.getElementById('output-section');
const logArea     = document.getElementById('log-area');
const progressBar = document.getElementById('progress-bar');
const downloadWrap= document.getElementById('download-wrap');

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

function validate(data) {
  const errors = [];
  if (!data.imageUrl)                        errors.push('Completá la URL de la foto');
  if (!data.priceUSD || data.priceUSD <= 0)  errors.push('Ingresá un precio válido');
  if (!data.surfaceM2 || data.surfaceM2 <= 0)errors.push('Ingresá la superficie');
  if (!data.rooms || data.rooms <= 0)        errors.push('Ingresá la cantidad de ambientes');
  if (!data.neighborhood)                    errors.push('Ingresá el barrio');
  return errors;
}

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

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = getFormData();
  const errors = validate(data);

  if (errors.length) {
    alert('Por favor corregí los siguientes campos:\n\n• ' + errors.join('\n• '));
    return;
  }

  btnRender.disabled = true;
  btnText.textContent = '⏳ Renderizando…';
  resetOutput();
  outputSec.style.display = 'block';
  outputSec.scrollIntoView({ behavior: 'smooth', block: 'start' });

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
      headers: authHeaders(),
      body: JSON.stringify({ data }),
    });

    if (res.status === 401) {
      clearInterval(fakeInterval);
      sessionStorage.removeItem('panel_token');
      showLogin();
      return;
    }

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error desconocido');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let done = false;

    while (!done) {
      const { value, done: streamDone } = await reader.read();
      done = streamDone;
      if (value) buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        try {
          const { type, message } = JSON.parse(line.slice(5).trim());
          addLog(type, message);
          if (type === 'done') { clearInterval(fakeInterval); setProgress(100); downloadWrap.style.display = 'flex'; }
          if (type === 'error') { clearInterval(fakeInterval); setProgress(0); }
        } catch (_) {}
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

// Agregar token a la URL de descarga
document.querySelector('.btn-download').addEventListener('click', function(e) {
  if (authToken) {
    this.href = `/api/download?token=${encodeURIComponent(authToken)}`;
  }
});

btnNew.addEventListener('click', () => {
  outputSec.style.display = 'none';
  resetOutput();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Iniciar ───────────────────────────────────────────────────────────────
checkAuth();
