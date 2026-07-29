export type GeneratorOptions = {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
};

export const DEFAULT_OPTIONS: GeneratorOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
};

const SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?/',
};

const AMBIGUOUS = /[Il1O0o]/g;

export function generatePassword(opts: GeneratorOptions): string {
  let pool = '';
  const required: string[] = [];

  if (opts.uppercase) {
    pool += SETS.uppercase;
    required.push(randomFrom(SETS.uppercase));
  }
  if (opts.lowercase) {
    pool += SETS.lowercase;
    required.push(randomFrom(SETS.lowercase));
  }
  if (opts.numbers) {
    pool += SETS.numbers;
    required.push(randomFrom(SETS.numbers));
  }
  if (opts.symbols) {
    pool += SETS.symbols;
    required.push(randomFrom(SETS.symbols));
  }
  if (opts.excludeAmbiguous) {
    pool = pool.replace(AMBIGUOUS, '');
  }
  if (!pool) pool = SETS.lowercase;

  const length = Math.max(opts.length, required.length);
  const chars: string[] = [...required];
  while (chars.length < length) {
    chars.push(randomFrom(pool));
  }
  // Shuffle so the guaranteed chars aren't always at the front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

function randomFrom(str: string): string {
  return str[secureRandomInt(str.length)];
}

// Uniform unbiased random using crypto.getRandomValues.
function secureRandomInt(maxExclusive: number): number {
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % maxExclusive);
  const arr = new Uint32Array(1);
  let r;
  do {
    globalThis.crypto.getRandomValues(arr);
    r = arr[0];
  } while (r >= limit);
  return r % maxExclusive;
}
