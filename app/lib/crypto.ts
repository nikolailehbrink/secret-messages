// End-to-end encryption with the Web Crypto API. These functions run in the
// browser, so the server only ever stores ciphertext (plus salt/IV) — never the
// plaintext message, the password, or the key.
//
// Two modes share the same AES-GCM cipher:
//   - Password mode: PBKDF2 (SHA-256) derives the key from a password and a
//     random per-message salt. The recipient needs the password.
//   - Passwordless mode: a random key is generated and travels in the URL
//     fragment (never sent to the server). There is no salt.
// AES-GCM provides built-in integrity: a wrong password/key or tampered
// ciphertext fails authentication.

const PBKDF2_ITERATIONS = 250_000;
const SALT_BYTES = 16;
const IV_BYTES = 12; // 96 bits is the recommended IV length for AES-GCM.

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// URL-safe base64 for the key carried in the link fragment.
function bufferToBase64Url(buffer: ArrayBuffer): string {
  return bufferToBase64(buffer)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToBytes(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = base64.length % 4 ? 4 - (base64.length % 4) : 0;
  return base64ToBytes(base64 + "=".repeat(padding));
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptWithKey(text: string, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(text),
  );
  return {
    encryptedMessage: bufferToBase64(ciphertext),
    iv: bufferToBase64(iv.buffer),
  };
}

async function decryptWithCryptoKey(
  encrypted: string,
  iv: string,
  key: CryptoKey,
) {
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(iv) },
    key,
    base64ToBytes(encrypted),
  );
  return new TextDecoder().decode(plaintext);
}

// --- Password mode -------------------------------------------------------

export async function encryptText(text: string, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const key = await deriveKey(password, salt);
  const { encryptedMessage, iv } = await encryptWithKey(text, key);
  return { encryptedMessage, iv, salt: bufferToBase64(salt.buffer) };
}

export async function decryptText(
  encrypted: string,
  iv: string,
  salt: string,
  password: string,
) {
  const key = await deriveKey(password, base64ToBytes(salt));
  return decryptWithCryptoKey(encrypted, iv, key);
}

// --- Passwordless mode (key in the URL fragment) -------------------------

export async function encryptWithGeneratedKey(text: string) {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
  const { encryptedMessage, iv } = await encryptWithKey(text, key);
  const rawKey = await crypto.subtle.exportKey("raw", key);
  return { encryptedMessage, iv, key: bufferToBase64Url(rawKey) };
}

export async function decryptWithKey(
  encrypted: string,
  iv: string,
  keyBase64Url: string,
) {
  const key = await crypto.subtle.importKey(
    "raw",
    base64UrlToBytes(keyBase64Url),
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );
  return decryptWithCryptoKey(encrypted, iv, key);
}
