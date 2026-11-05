import { finale, future, process, team, values } from "@/content/content";
import { getPart } from "@/content/parts";
import { SectionHead } from "../SectionHead";
import { StatusBadge } from "../StatusBadge";
import { Txt } from "../Txt";

export function Process() {
  return (
    <section id="process" tabIndex={-1} aria-labelledby="process-title" className="story-section process">
      <div className="content-col content-col-right scrim-right">
        <SectionHead id="process-title" number={process.number} eyebrow={process.eyebrow} title={process.title} />
        <p className="lead">
          <Txt>{process.lead}</Txt>
        </p>
        <ol className="stages">
          {process.stages.map((s, i) => (
            <li key={i} className="stage">
              <span className="stage-n" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="stage-title">
                  <Txt>{s.title}</Txt>
                </h3>
                <p>
                  <Txt>{s.text}</Txt>
                </p>
                <dl className="stage-meta">
                  <div>
                    <dt>{process.labels.test}</dt>
                    <dd>
                      <Txt>{s.test}</Txt>
                    </dd>
                  </div>
                  <div>
                    <dt>{process.labels.change}</dt>
                    <dd>
                      <Txt>{s.change}</Txt>
                    </dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Future() {
  const solar = getPart("solar");
  return (
    <section id="future" tabIndex={-1} aria-labelledby="future-title" className="story-section future">
      <div className="content-col scrim-left">
        <SectionHead id="future-title" number={future.number} eyebrow={future.eyebrow} title={future.title} />
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <StatusBadge status={solar.status} />
          <span className="font-display text-lg text-[var(--ink)]">{solar.title}</span>
        </div>
        <p className="lead">
          <Txt>{future.lead}</Txt> <Txt>{solar.purpose}</Txt>
        </p>
        <ul className="plans">
          {future.plans.map((p, i) => (
            <li key={i}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3.5 8h8M8.5 4.5L12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <Txt>{p}</Txt>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BuoyIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="value-icon">
      <circle cx="16" cy="8" r="3" fill="currentColor" />
      <path d="M10 26l2-13h8l2 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M11 19h10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 27c3 0 3-2 6-2s3 2 6 2 3-2 6-2 3 2 6 2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function Values() {
  return (
    <section id="values" tabIndex={-1} aria-labelledby="values-title" className="values">
      <div className="values-head">
        <SectionHead id="values-title" number={values.number} eyebrow={values.eyebrow} title={values.title} />
        <p className="lead">{values.lead}</p>
      </div>
      <ol className="values-list">
        {values.items.map((v, i) => (
          <li key={v.name} className="value-item">
            <div className="value-top">
              <BuoyIcon />
              <span className="value-n">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <h3 className="value-name" lang="en">
              {v.name}
            </h3>
            <p className="value-ru">{v.ru}</p>
            <p className="value-story">
              <Txt>{v.story}</Txt>
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Team() {
  return (
    <section id="team" tabIndex={-1} aria-labelledby="team-title" className="story-section team">
      <div className="content-col content-col-right scrim-right">
        <SectionHead id="team-title" number={team.number} eyebrow={team.eyebrow} title={team.title} />
        <p className="lead">
          <Txt>{team.lead}</Txt>
        </p>
        <ul className="members">
          {team.members.map((m, i) => (
            <li key={i}>
              <span className="member-name">
                <Txt>{m.name}</Txt>
              </span>
              <span className="member-role">
                <Txt>{m.role}</Txt>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Final() {
  return (
    <footer id="final" tabIndex={-1} aria-labelledby="final-title" className="final">
      <div className="final-inner scrim-bottom">
        <p className="final-kicker">{finale.kicker}</p>
        <h2 id="final-title" className="final-title">
          {finale.title}
        </h2>
        <p className="final-line">{finale.line}</p>
        <div className="final-grid">
          <div>
            <h3 className="final-label">{finale.contactsTitle}</h3>
            <ul className="contacts">
              {finale.contacts.map((c) => (
                <li key={c.label}>
                  <span className="contact-label">{c.label}</span>
                  {c.href ? (
                    <a href={c.href} className="contact-value">
                      <Txt>{c.value}</Txt>
                    </a>
                  ) : (
                    <span className="contact-value">
                      <Txt>{c.value}</Txt>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="final-small">
            <p>{finale.modelNote}</p>
            <p>{finale.footer}</p>
            <a href="#top" className="nav-link mt-4 inline-block">
              ↑ {finale.backToTop}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
