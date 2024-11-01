import {
  scryptSync,
  randomBytes,
  createCipheriv,
  createDecipheriv,
} from "crypto";

const algorithm = "aes-256-cbc";

// TODO: Implement proper salt
export function encryptText(text: string, password: string) {
  const key = scryptSync(password, "salt", 32);
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, key, iv);
  let encryptedMessage = cipher.update(text, "utf-8", "hex");
  encryptedMessage += cipher.final("hex");
  return { iv: iv.toString("hex"), encryptedMessage };
}

export function decryptText(encrypted: string, iv: string, password: string) {
  const key = scryptSync(password, "salt", 32);
  const decipher = createDecipheriv(algorithm, key, Buffer.from(iv, "hex"));
  let decrypted = decipher.update(encrypted, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}
