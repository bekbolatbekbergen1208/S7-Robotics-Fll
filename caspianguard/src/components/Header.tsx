"use client";

import { useState } from "react";
import { nav } from "@/content/content";
import { clearSelection } from "@/scene/actions";
import { scrollToY } from "@/scene/scroll";
import { scrollMarks } from "@/scene/state";
import { ui } from "@/scene/ui-store";

function go(href: string) {
  clearSelection();
  const id = href.slice(1);
  const el = document.getElementById(id);
  if (!el) return;
  const y = id === "explore" && scrollMarks.exploreStart ? scrollMarks.exploreStart : el.getBoundingClientRect().top + window.scrollY;
  scrollToY(y, ui.get().reducedMotion);
  el.focus({ preventScroll: true });
}

export function Header() {
  const [open, setOpen] = useState(false);
  const onNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    go(href);
  };

  return (
    <header className="site-header" data-ui>
      <a href="#main" className="skip-link">
        {nav.skip}
      </a>
      <a href="#top" className="brand" onClick={(e) => onNav(e, "#top")}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
          <path d="M3 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 3 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M6 11l2-5h8l2 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
        <span>{nav.brand}</span>
      </a>
      <a href="/index.html" className="nav-link">← S7 Robotics</a>
      <nav aria-label="Разделы сайта" className="hidden md:block">
        <ul className="flex gap-6">
          {nav.links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="nav-link" onClick={(e) => onNav(e, l.href)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <button
        type="button"
        className="menu-button md:hidden"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">Меню</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          ) : (
            <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          )}
        </svg>
      </button>
      {open && (
        <nav id="mobile-menu" aria-label="Разделы сайта" className="mobile-menu md:hidden">
          <ul>
            {nav.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={(e) => onNav(e, l.href)}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
