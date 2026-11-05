import { hero, marquee } from "@/content/content";

export function Hero() {
  const [a, b, c] = hero.titleParts;
  return (
    <section id="top" tabIndex={-1} aria-labelledby="hero-title" className="hero">
      <div className="hero-top">
        <p className="hero-kicker">{hero.kicker}</p>
        <p className="hero-team">{hero.team}</p>
      </div>
      <div className="hero-bottom">
        <h1 id="hero-title" className="hero-title" aria-label={`${a}${b} ${c}`}>
          <span className="hero-line hero-caspian">{a}</span>
          <span className="hero-line">
            <span className="hero-guard">{b}</span> <span className="hero-ai">{c}</span>
          </span>
        </h1>
        <div className="hero-meta">
          <p className="hero-phrase">{hero.phrase}</p>
          <p className="scroll-hint" aria-hidden="true">
            <span className="scroll-hint-line" />
            {hero.scrollHint}
          </p>
        </div>
      </div>
    </section>
  );
}

function Wave() {
  return (
    <svg viewBox="0 0 28 10" aria-hidden="true" className="marquee-wave">
      <path d="M1 5c3 0 3-3 6.5-3S10.5 8 14 8s3.5-6 6.5-6S24 5 27 5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Marquee() {
  const row = (hidden: boolean) => (
    <ul className="marquee-row" aria-hidden={hidden || undefined}>
      {marquee.map((item) => (
        <li key={item}>
          <span>{item}</span>
          <Wave />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee" role="region" aria-label="Бегущая строка">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
