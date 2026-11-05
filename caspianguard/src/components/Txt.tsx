import { Fragment } from "react";

/** Выводит текст из content.ts; фрагменты в [квадратных скобках] подсвечиваются как плейсхолдеры. */
export function Txt({ children }: { children: string }) {
  const parts = children.split(/(\[[^\]]+\])/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("[") && part.endsWith("]") ? (
          <mark key={i} className="ph" title="Плейсхолдер: заполните в content.ts или parts.ts">
            {part.slice(1, -1)}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export const isPlaceholder = (s: string) => /^\[[^\]]+\]$/.test(s.trim());
