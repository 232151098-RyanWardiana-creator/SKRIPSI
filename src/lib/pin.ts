import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

const PIN_PATTERN = /^\d{4,6}$/;

/** PIN disimpan sebagai `scrypt$<saltHex>$<hashHex>`, bukan teks polos. */
export async function hashPin(pin: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(pin, salt, 32);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPin(pin: string, stored: string | null) {
  if (!stored) return false;
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(pin, Buffer.from(saltHex, "hex"), expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export const isValidPin = (pin: unknown): pin is string =>
  typeof pin === "string" && PIN_PATTERN.test(pin);

/** Nama dibandingkan tanpa peduli spasi ganda / huruf besar-kecil. */
export const normalizeName = (name: string) => name.trim().replace(/\s+/g, " ");
