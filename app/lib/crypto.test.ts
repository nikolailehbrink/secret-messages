import { describe, expect, it } from "vitest";
import { encryptText, decryptText } from "./crypto";
import { randomBytes } from "crypto";

describe("Crypto functions", () => {
  const text = "Hello, World!";
  const password = "strongpassword";

  it("should encrypt and decrypt text correctly", () => {
    const { iv, encryptedMessage } = encryptText(text, password);
    expect(iv).toHaveLength(32); // IV should be 16 bytes in hex (32 characters)
    expect(encryptedMessage).not.toBe(text);

    const decryptedMessage = decryptText(encryptedMessage, iv, password);
    expect(decryptedMessage).toBe(text);
  });

  it("should return different encrypted messages for the same text with different IVs", () => {
    const encrypted1 = encryptText(text, password);
    const encrypted2 = encryptText(text, password);

    expect(encrypted1.encryptedMessage).not.toBe(encrypted2.encryptedMessage);
    expect(encrypted1.iv).not.toBe(encrypted2.iv);
  });

  it("should fail to decrypt with wrong password", () => {
    const { iv, encryptedMessage } = encryptText(text, password);
    const wrongPassword = "wrongpassword";

    expect(() => {
      decryptText(encryptedMessage, iv, wrongPassword);
    }).toThrow();
  });

  it("should fail to decrypt with wrong IV", () => {
    const { iv, encryptedMessage } = encryptText(text, password);
    const wrongIv = randomBytes(16).toString("hex");

    expect(() => {
      decryptText(encryptedMessage, wrongIv, password);
    }).toThrow();
  });
});
