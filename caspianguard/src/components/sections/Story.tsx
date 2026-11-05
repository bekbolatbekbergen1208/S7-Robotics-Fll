import { problem, solution } from "@/content/content";
import { SectionHead } from "../SectionHead";
import { Txt } from "../Txt";

export function Problem() {
  return (
    <section id="problem" tabIndex={-1} aria-labelledby="problem-title" className="story-section problem">
      <div className="content-col scrim-left">
        <SectionHead id="problem-title" number={problem.number} eyebrow={problem.eyebrow} title={problem.title} />
        <p className="lead">
          <Txt>{problem.lead}</Txt>
        </p>
        <ol className="facts">
          {problem.facts.map((f, i) => (
            <li key={i} className="fact">
              <span className="fact-value">
                <Txt>{f.value}</Txt>
              </span>
              <span className="fact-text">
                <Txt>{f.text}</Txt>
              </span>
              <span className="fact-source">
                Источник: <Txt>{f.source}</Txt>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Solution() {
  return (
    <section id="solution" tabIndex={-1} aria-labelledby="solution-title" className="solution">
      <div className="sticky-frame">
        <div className="content-col scrim-left">
          <SectionHead id="solution-title" number={solution.number} eyebrow={solution.eyebrow} title={solution.title} />
          <p className="lead">
            <Txt>{solution.lead}</Txt>
          </p>
          <ol className="steps">
            {solution.steps.map((s, i) => (
              <li key={s.id}>
                <span className="step-n">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <strong>{s.label}</strong>
                  <span className="step-text">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-[var(--text-dim)]">
            <Txt>{solution.note}</Txt>
          </p>
        </div>
      </div>
    </section>
  );
}
