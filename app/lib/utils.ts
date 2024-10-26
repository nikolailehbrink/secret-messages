import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateCypher(text: string) {
  const words = text.split(" ");
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=£¥¢€§";

  function getRandomChars(length: number) {
    return Array.from(
      { length },
      () => characters[Math.floor(Math.random() * characters.length)],
    ).join("");
  }
  return words
    .map((word) => {
      return getRandomChars(word.length);
    })
    .join(" ");
}
