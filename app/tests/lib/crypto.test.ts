import { describe, expect, it } from "vitest";
import {
  encryptText,
  decryptText,
  encryptWithGeneratedKey,
  decryptWithKey,
} from "@/lib/crypto";

describe("Crypto functions", () => {
  const text = "Hello, World!";
  const password = "strongpassword";

  it("should encrypt and decrypt text correctly", async () => {
    const { iv, salt, encryptedMessage } = await encryptText(text, password);
    expect(encryptedMessage).not.toBe(text);

    const decryptedMessage = await decryptText(
      encryptedMessage,
      iv,
      salt,
      password,
    );
    expect(decryptedMessage).toBe(text);
  });

  it("should use a different salt and IV for the same text each time", async () => {
    const first = await encryptText(text, password);
    const second = await encryptText(text, password);

    expect(first.encryptedMessage).not.toBe(second.encryptedMessage);
    expect(first.iv).not.toBe(second.iv);
    expect(first.salt).not.toBe(second.salt);
  });

  it("should fail to decrypt with wrong password", async () => {
    const { iv, salt, encryptedMessage } = await encryptText(text, password);

    await expect(
      decryptText(encryptedMessage, iv, salt, "wrongpassword"),
    ).rejects.toThrow();
  });

  it("should fail to decrypt with wrong IV", async () => {
    const { salt, encryptedMessage } = await encryptText(text, password);
    const wrongIv = await encryptText(text, password).then((r) => r.iv);

    await expect(
      decryptText(encryptedMessage, wrongIv, salt, password),
    ).rejects.toThrow();
  });

  it("should encrypt and decrypt passwordless with a generated key", async () => {
    const { iv, key, encryptedMessage } = await encryptWithGeneratedKey(text);
    expect(encryptedMessage).not.toBe(text);
    expect(key).toBeTruthy();

    const decryptedMessage = await decryptWithKey(encryptedMessage, iv, key);
    expect(decryptedMessage).toBe(text);
  });

  it("should generate a different key for the same text each time", async () => {
    const first = await encryptWithGeneratedKey(text);
    const second = await encryptWithGeneratedKey(text);

    expect(first.key).not.toBe(second.key);
    expect(first.encryptedMessage).not.toBe(second.encryptedMessage);
  });

  it("should fail to decrypt passwordless with a wrong key", async () => {
    const { iv, encryptedMessage } = await encryptWithGeneratedKey(text);
    const otherKey = await encryptWithGeneratedKey(text).then((r) => r.key);

    await expect(
      decryptWithKey(encryptedMessage, iv, otherKey),
    ).rejects.toThrow();
  });
});
