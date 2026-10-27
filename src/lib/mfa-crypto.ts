import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { TOTP, Secret } from "otpauth";
export class MfaConfigurationError extends Error {}
export class MfaRequiredError extends Error {}
export class MfaInvalidError extends Error {}
function encryptionKey() {
  const value = process.env.MFA_ENCRYPTION_KEY;
  if (!value || value.length < 32)
    throw new MfaConfigurationError(
      "MFA indisponível: configure a chave de proteção no ambiente",
    );
  return createHash("sha256").update(value).digest();
}
export function mfaConfigured() {
  try {
    encryptionKey();
    return true;
  } catch {
    return false;
  }
}
export function encryptMfaSecret(secret: string, userId: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  cipher.setAAD(Buffer.from(userId));
  const ciphertext = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  return [
    "v1",
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}
export function decryptMfaSecret(value: string, userId: string) {
  const [version, iv, tag, data] = value.split(".");
  if (version !== "v1" || !iv || !tag || !data)
    throw new MfaConfigurationError(
      "Proteção MFA inválida; contate o responsável",
    );
  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      Buffer.from(iv, "base64url"),
    );
    decipher.setAAD(Buffer.from(userId));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(data, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new MfaConfigurationError(
      "Não foi possível abrir a proteção MFA; verifique a chave do ambiente",
    );
  }
}
export function totpFor(secret: string, email = "NEXO") {
  return new TOTP({
    issuer: "NEXO · Certtifica",
    label: email,
    secret: Secret.fromBase32(secret),
    algorithm: "SHA1",
    digits: 6,
    period: 30,
  });
}
export function matchingCounter(
  secret: string,
  code: string,
  lastCounter: number,
  timestamp = Date.now(),
) {
  if (!/^\d{6}$/.test(code)) return null;
  const delta = totpFor(secret).validate({ token: code, window: 1, timestamp });
  if (delta === null) return null;
  const counter = TOTP.counter({ timestamp, period: 30 }) + delta;
  return counter > lastCounter ? counter : null;
}
export const recoveryDigest = (code: string) =>
  createHash("sha256").update(code.trim().toLowerCase()).digest("hex");
export function consumeFactor(
  record: {
    secretEncrypted: string | null;
    lastCounter: number;
    recoveryHashes: string[];
  },
  userId: string,
  code: string,
) {
  if (!record.secretEncrypted)
    throw new MfaInvalidError("Segundo fator indisponível");
  const counter = matchingCounter(
    decryptMfaSecret(record.secretEncrypted, userId),
    code,
    record.lastCounter,
  );
  if (counter !== null)
    return { lastCounter: counter, recoveryHashes: record.recoveryHashes };
  const hash = recoveryDigest(code);
  if (record.recoveryHashes.includes(hash))
    return {
      lastCounter: record.lastCounter,
      recoveryHashes: record.recoveryHashes.filter((h) => h !== hash),
    };
  throw new MfaInvalidError("Código inválido, expirado ou já utilizado");
}
