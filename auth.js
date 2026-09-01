/* ============================================================
   DeskAssist Global — auth.js
   Registro/login del lado del cliente. IMPORTANTE:
   - No hay servidor propio, así que los usuarios se guardan en
     este navegador (localStorage), no en una base de datos central.
   - Las contraseñas NUNCA se guardan en texto plano: se hashean
     con SHA-256 + una "sal" aleatoria antes de guardarse.
   - Para notificar por correo cada registro se usa Web3Forms
     (https://web3forms.com): NO requiere conectar ni dar permisos
     sobre tu Gmail, solo se manda el correo a la dirección que tú
     indiques.

   PARA ACTIVAR EL ENVÍO DE CORREOS (2 minutos, una sola vez):
   1. Entra a https://web3forms.com
   2. Escribe tu correo (wirmeldiaz0@gmail.com) donde dice
      "Create Access Key" y da clic en el botón.
   3. Revisa tu Gmail: te llega un correo de Web3Forms con una
      clave (Access Key) tipo "a1b2c3d4-...". Solo es leer el
      correo, no hay que instalar ni autorizar nada.
   4. Pega esa clave abajo en accessKey y cambia enabled a true.
   ============================================================ */

const WEB3FORMS_CONFIG = {
  enabled: true,               // cambia a true cuando pegues tu accessKey
  accessKey: "TU_ACCESS_KEY",
  notifyTo: "https://formspree.io/f/mdeoeavn"
};

const USERS_KEY = "deskassist_users";
const SESSION_KEY = "deskassist_session";

/* ---------- utilidades de almacenamiento ---------- */
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setSession(email) {
  localStorage.setItem(SESSION_KEY, email);
}

function getSession() {
  return localStorage.getItem(SESSION_KEY);
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/* ---------- hash de contraseña (SHA-256 + sal) ---------- */
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomSalt() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return bufferToHex(arr);
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + ":" + password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(digest);
}

/* ---------- notificación por correo (Web3Forms) ---------- */
async function notifyNewRegistration({ nombre, correo, telefono }) {
  if (!WEB3FORMS_CONFIG.enabled) {
    console.info(
      "[DeskAssist] Notificación por correo desactivada. " +
      "Completa WEB3FORMS_CONFIG en js/auth.js para activarla."
    );
    return { sent: false, reason: "disabled" };
  }
  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_CONFIG.accessKey,
        subject: "Nuevo registro en DeskAssist Global",
        from_name: "DeskAssist Global — Registro de usuario",
        email: WEB3FORMS_CONFIG.notifyTo,
        Nombre: nombre,
        Correo: correo,
        Telefono: telefono || "No proporcionado",
        Fecha: new Date().toLocaleString("es-DO")
      })
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || "Envío rechazado");
    return { sent: true };
  } catch (err) {
    console.error("[DeskAssist] Error enviando la notificación por correo:", err);
    return { sent: false, reason: "error" };
  }
}

/* ---------- registro ---------- */
async function registerUser({ nombre, correo, telefono, password }) {
  const users = getUsers();
  const normalizedEmail = correo.trim().toLowerCase();

  if (users.some((u) => u.correo === normalizedEmail)) {
    throw new Error("Ya existe una cuenta registrada con este correo.");
  }

  const salt = randomSalt();
  const passwordHash = await hashPassword(password, salt);

  users.push({
    nombre: nombre.trim(),
    correo: normalizedEmail,
    telefono: telefono ? telefono.trim() : "",
    salt,
    passwordHash,
    creado: new Date().toISOString()
  });

  saveUsers(users);
  setSession(normalizedEmail);

  // No bloquea el registro si el correo tarda o falla
  notifyNewRegistration({ nombre, correo: normalizedEmail, telefono });

  return true;
}

/* ---------- login ---------- */
async function loginUser({ correo, password }) {
  const users = getUsers();
  const normalizedEmail = correo.trim().toLowerCase();
  const user = users.find((u) => u.correo === normalizedEmail);

  if (!user) {
    throw new Error("No encontramos una cuenta con ese correo.");
  }

  const attemptHash = await hashPassword(password, user.salt);
  if (attemptHash !== user.passwordHash) {
    throw new Error("La contraseña no es correcta.");
  }

  setSession(normalizedEmail);
  return user;
}

function logoutUser() {
  clearSession();
}

function currentUser() {
  const email = getSession();
  if (!email) return null;
  return getUsers().find((u) => u.correo === email) || null;
}

/* ---------- refleja el estado de sesión en el menú "Cuenta" ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = !!getSession();
  document.querySelectorAll('[data-auth="guest"]').forEach((el) => {
    el.hidden = isLoggedIn;
  });
  document.querySelectorAll('[data-auth="user"]').forEach((el) => {
    el.hidden = !isLoggedIn;
  });

  const logoutLink = document.getElementById("navLogout");
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      logoutUser();
      window.location.href = "index.html";
    });
  }
});
