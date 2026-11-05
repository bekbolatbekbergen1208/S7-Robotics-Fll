import { Txt } from "./Txt";

export function SectionHead({
  id,
  number,
  eyebrow,
  title,
  className = "",
}: {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  className?: string;
}) {
  return (
    <header className={className}>
      <p className="section-index">
        <span className="section-number">{number}</span>
        <span className="section-eyebrow">{eyebrow}</span>
      </p>
      <h2 id={id} className="section-title">
        <Txt>{title}</Txt>
      </h2>
    </header>
  );
}
