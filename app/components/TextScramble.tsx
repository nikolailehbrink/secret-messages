import { useState, useEffect, useMemo } from "react";

export default function TextScramble({
  text,
  revealSpeed = 50,
  charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
}: {
  text: string;
  revealSpeed?: number;
  charset?: string;
}) {
  const randomChar = () => charset[Math.floor(Math.random() * charset.length)];
  const preserveChar = (char: string) =>
    /\s/.test(char) ? char : randomChar();

  const initialScrambledText = useMemo(() => {
    // Use a seeded random number generator for consistent results
    const seededRandom = (seed: number) => {
      let x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    let seed = 0;
    for (let i = 0; i < text.length; i++) {
      seed += text.charCodeAt(i);
    }

    return text
      .split("")
      .map((char) =>
        /\s/.test(char)
          ? char
          : charset[Math.floor(seededRandom(seed++) * charset.length)],
      )
      .join("");
  }, [text, charset]);

  const [displayedText, setDisplayedText] = useState(initialScrambledText);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex >= text.length) {
        clearInterval(intervalId);
        return;
      }

      setDisplayedText((prevText) =>
        prevText
          .split("")
          .map((char, index) => {
            if (index < currentIndex) {
              return text[index];
            } else if (index === currentIndex) {
              return text[index];
            } else {
              return preserveChar(char);
            }
          })
          .join(""),
      );

      currentIndex++;
    }, revealSpeed);

    return () => clearInterval(intervalId);
  }, [text, revealSpeed, charset, isClient]);

  if (!isClient) {
    return <>{initialScrambledText}</>;
  }

  return <>{displayedText}</>;
}
