// Python code editor (CodeMirror 6) with program slots stored in localStorage.

import { EditorView, basicSetup } from 'codemirror';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { EXAMPLES, DEFAULT_PROGRAM } from './examples.js';

// S7 BIOGLOW colours over One Dark: deep green background, green gutter and cursor.
// Listed before oneDark, so it takes precedence; syntax colours stay One Dark's.
const s7Theme = EditorView.theme({
  '&': { backgroundColor: '#020c08', color: '#dfffee' },
  '.cm-gutters': { backgroundColor: '#020c08', color: '#3f7a60', border: 'none', borderRight: '1px solid rgba(120, 255, 185, 0.12)' },
  '.cm-activeLine': { backgroundColor: 'rgba(77, 255, 158, 0.06)' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(77, 255, 158, 0.08)', color: '#4dff9e' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#4dff9e' },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': { backgroundColor: 'rgba(77, 255, 158, 0.22)' },
  '&.cm-focused .cm-matchingBracket': { backgroundColor: 'rgba(184, 255, 94, 0.2)', outline: '1px solid rgba(184, 255, 94, 0.5)' },
  '.cm-tooltip, .cm-panels': { backgroundColor: '#061a13', border: '1px solid rgba(120, 255, 185, 0.2)' },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: 'rgba(77, 255, 158, 0.18)', color: '#e8fff2' },
}, { dark: true });

const KEY = 'fll.bioglow.programs';
const CUR_KEY = 'fll.bioglow.programs.current';

export class CodeEditor {
  constructor(el, { onRun } = {}) {
    this.onRun = onRun;
    this.programs = this.load();
    // reopen the program that was open last time
    let cur = 0;
    try { cur = Math.max(0, Math.min(this.programs.length - 1, +localStorage.getItem(CUR_KEY) || 0)); } catch { /* ignore */ }
    this.current = cur;
    this.view = new EditorView({
      doc: this.programs[cur].code,
      extensions: [
        basicSetup,
        python(),
        s7Theme,
        oneDark,
        keymap.of([indentWithTab, { key: 'Mod-Enter', run: () => { this.onRun?.(); return true; } }, { key: 'Mod-s', run: () => { this.save(); return true; } }]),
        EditorView.updateListener.of((u) => { if (u.docChanged) this.scheduleSave(); }),
      ],
      parent: el,
    });
  }
  load() {
    try {
      const p = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(p) && p.length) return p;
    } catch { /* ignore */ }
    return [{ name: 'Запуск 1', code: DEFAULT_PROGRAM }];
  }
  scheduleSave() {
    clearTimeout(this.t);
    this.t = setTimeout(() => this.save(), 400);
  }
  save() {
    this.programs[this.current].code = this.view.state.doc.toString();
    try {
      localStorage.setItem(KEY, JSON.stringify(this.programs));
      localStorage.setItem(CUR_KEY, String(this.current));
    } catch { /* storage unavailable */ }
  }
  get code() { return this.view.state.doc.toString(); }
  get name() { return this.programs[this.current].name; }
  setCode(code) {
    this.view.dispatch({ changes: { from: 0, to: this.view.state.doc.length, insert: code } });
  }
  select(i) {
    this.save();
    this.current = i;
    this.setCode(this.programs[i].code);
  }
  add(name, code = DEFAULT_PROGRAM) {
    this.save();
    this.programs.push({ name, code });
    this.current = this.programs.length - 1;
    this.setCode(code);
    this.save();
  }
  rename(name) { this.programs[this.current].name = name; this.save(); }
  remove() {
    if (this.programs.length <= 1) return;
    this.programs.splice(this.current, 1);
    this.current = Math.max(0, this.current - 1);
    this.setCode(this.programs[this.current].code);
    this.save();
  }
}

export { EXAMPLES };
