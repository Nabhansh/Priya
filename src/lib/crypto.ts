// Client-side AES-GCM encryption using the Web Crypto API.
// The user's master password is stretched with PBKDF2 into a 256-bit key
// that never leaves the browser. The server only stores ciphertext.

const SUBTLE = globalThis.crypto.subtle;

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

const PBKDF2_ITERATIONS = 200_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

export type SaltBundle = {
  saltB64: string;
  iterations: number;
};

function bufToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuf(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function randomBytes(n: number): Uint8Array {
  const arr = new Uint8Array(n);
  globalThis.crypto.getRandomValues(arr);
  return arr;
}

async function deriveKey(
  masterPassword: string,
  saltBuf: ArrayBuffer,
  iterations: number,
): Promise<CryptoKey> {
  const baseKey = await SUBTLE.importKey(
    'raw',
    TEXT_ENCODER.encode(masterPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );
  return SUBTLE.deriveKey(
    { name: 'PBKDF2', salt: saltBuf, iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function createSaltBundle(): Promise<SaltBundle> {
  const salt = randomBytes(SALT_BYTES);
  return { saltB64: bufToBase64(salt.buffer), iterations: PBKDF2_ITERATIONS };
}

export async function deriveCryptoKey(
  masterPassword: string,
  saltB64: string,
  iterations: number,
): Promise<CryptoKey> {
  return deriveKey(masterPassword, base64ToBuf(saltB64), iterations);
}

export async function encryptPayload(
  key: CryptoKey,
  data: unknown,
): Promise<string> {
  const iv = randomBytes(IV_BYTES);
  const plaintext = TEXT_ENCODER.encode(JSON.stringify(data));
  const ciphertext = await SUBTLE.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext,
  );
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return bufToBase64(combined.buffer);
}

export async function decryptPayload<T>(
  key: CryptoKey,
  encryptedB64: string,
): Promise<T> {
  const combined = new Uint8Array(base64ToBuf(encryptedB64));
  const iv = combined.slice(0, IV_BYTES);
  const ciphertext = combined.slice(IV_BYTES);
  const plaintext = await SUBTLE.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext,
  );
  return JSON.parse(TEXT_DECODER.decode(plaintext)) as T;
}

// Lightweight password strength scoring (0-4) used by the UI meter.
export function scorePassword(pw: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  crackTime: string;
} {
  if (!pw) return { score: 0, label: 'Empty', crackTime: 'instantly' };

  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;

  const entropy = pw.length * Math.log2(pool || 1);
  // Assume 10 billion guesses/sec for an offline attack.
  const seconds = Math.pow(2, entropy) / 1e10;

  let score: 0 | 1 | 2 | 3 | 4;
  if (entropy < 28) score = 1;
  else if (entropy < 36) score = 2;
  else if (entropy < 60) score = 3;
  else if (entropy < 80) score = 4;
  else score = 4;
  if (pw.length < 6) score = 1;
  if (!pw) score = 0;

  const labels = ['Empty', 'Very weak', 'Weak', 'Fair', 'Strong', 'Excellent'];
  const label = score === 0 ? labels[0] : labels[score];

  return { score, label, crackTime: humanizeTime(seconds) };
}

function humanizeTime(seconds: number): string {
  if (seconds < 1) return 'instantly';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  const years = seconds / 31536000;
  if (years < 1000) return `${Math.round(years)} years`;
  if (years < 1e6) return `${Math.round(years / 1000)} thousand years`;
  if (years < 1e9) return `${Math.round(years / 1e6)} million years`;
  if (years < 1e12) return `${Math.round(years / 1e9)} billion years`;
  return 'centuries';
}
