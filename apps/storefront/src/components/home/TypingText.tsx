"use client";

import { useEffect, useState } from "react";

export function TypingText({ text }: { text: string }) {
  const characters = Array.from(text);
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCharacterCount(characters.length);
      return;
    }

    setCharacterCount(0);
    let intervalId: number | undefined;
    let nextCharacter = 0;
    const startId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        nextCharacter += 1;
        setCharacterCount(nextCharacter);

        if (nextCharacter >= characters.length && intervalId !== undefined) {
          window.clearInterval(intervalId);
        }
      }, 75);
    }, 300);

    return () => {
      window.clearTimeout(startId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [text, characters.length]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {characters.slice(0, characterCount).join("")}
        {characterCount < characters.length ? (
          <span className="ml-1 inline-block h-[0.82em] w-[3px] animate-pulse bg-current align-[-0.06em]" />
        ) : null}
      </span>
    </>
  );
}
