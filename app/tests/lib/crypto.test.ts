import { describe, expect, it } from "vitest";
import { encryptText, decryptText } from "@/lib/crypto";
import { randomBytes } from "crypto";

describe("Crypto functions", () => {
  const text = "Hello, World!";
  const password = "strongpassword";

  it("should encrypt and decrypt text correctly", () => {
    const { iv, encryptedMessage } = encryptText(text, password);
    expect(Buffer.from(iv, "hex")).toHaveLength(16); // IV is 16 bytes
    expect(encryptedMessage).not.toBe(text);

    const decryptedMessage = decryptText(encryptedMessage, iv, password);
    expect(decryptedMessage).toBe(text);
  });

  it("should return different encrypted messages for the same text with different IVs", () => {
    const firstEncryption = encryptText(text, password);
    const secondEncryption = encryptText(text, password);

    expect(firstEncryption.encryptedMessage).not.toBe(
      secondEncryption.encryptedMessage,
    );
    expect(firstEncryption.iv).not.toBe(secondEncryption.iv);
  });

  it("should fail to decrypt with wrong password", () => {
    const { iv, encryptedMessage } = encryptText(text, password);
    const wrongPassword = "wrongpassword";

    expect(() => {
      decryptText(encryptedMessage, iv, wrongPassword);
    }).toThrow();
  });

  it("should fail to decrypt with wrong IV", () => {
    const { encryptedMessage } = encryptText(text, password);
    const invalidIv = randomBytes(16).toString("hex");

    expect(() => {
      decryptText(encryptedMessage, invalidIv, password);
    }).toThrow();
  });
});
