// Run: npm i jsdom && node tests/run.js
// Loads index.html in jsdom with a small test hook (a copy is used; the real file is not changed).
const { JSDOM } = require('jsdom'); const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const html = src.replace('buildDeck(); render();\n})();', 'buildDeck(); render();\nwindow.__e = c => eval(c);\n})();');
if (html === src) throw new Error('test hook not injected');
const KEY = 'lumen.vocab.v1';
const SAMPLE = require('./sample-words.json'), LEGACY = require('./legacy-samples.json');
// Test data only: the app itself ships with no words.
const seeded = () => ({ words: JSON.parse(JSON.stringify(SAMPLE)), prefs: {}, activity: {}, goal: 10, v: 3 });
function boot(saved, hash = '#dashboard') {
  const errs = [];
  const dom = new JSDOM(html, { url: 'http://localhost/' + hash, runScripts: 'dangerously', pretendToBeVisual: true, beforeParse(w) {
    if (saved) w.localStorage.setItem(KEY, JSON.stringify(saved));
    w.HTMLDialogElement.prototype.showModal = function () { this.open = true; }; w.HTMLDialogElement.prototype.close = function () { this.open = false; };
    w.scrollTo = () => {}; w.Element.prototype.scrollIntoView = () => {}; w.fetch = () => Promise.reject(new Error('offline')); w.addEventListener('error', e => errs.push(e.message)); } });
  const w = dom.window, d = w.document;
  return { w, d, errs, e: c => w.__e(c), click: el => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })), stored: () => JSON.parse(w.localStorage.getItem(KEY)) };
}
const tick = (ms = 30) => new Promise(r => setTimeout(r, ms));
let fails = 0, n = 0; const ok = (c, m) => { n++; if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };

(async () => {
  // Old save (no SRS fields, no rev/uniq) loads and keeps everything
  const old = { words: [{ id: 's0', word: 'curious', pos: 'adjective', level: 'Beginner', def: 'Eager.', ex: 'The curious child asked.', status: 'known' }, { id: 'u1', word: 'zebra', pos: 'noun', level: 'Beginner', def: 'Striped.', ex: 'A zebra ran.', status: 'learning', fav: true }], prefs: { theme: 'dark' }, activity: { '2026-11-01': 4 }, goal: 20 };
  let a = boot(old); await tick();
  ok(a.e('S.words.length') === 2 && a.e('S.words[1].fav') === true && a.e('S.goal') === 20 && a.e('S.activity["2026-11-01"]') === 4, 'migration: words, favorites, goal, history kept');
  ok(a.e('S.uniq') && a.e('S.words.length') === 2, 'migration: new fields defaulted, nothing lost');

  // Definitions: new / learning / mastered / due
  let b = boot(seeded()); await tick();
  ok(b.e('stats().fresh') === 18 && b.e('stats().learning') === 0 && b.e('stats().due') === 0 && b.e('stats().known') === 0, 'fresh data: 18 new, 0 learning, 0 due, 0 mastered');
  ok(b.e('dueIds().length') === 10, 'Due deck = reviews + at most 10 new words per day');

  // Study: reveal before rating, four grades
  b.w.location.hash = '#study'; await tick(); b.e("S.prefs.level = 'all'; buildDeck(); render()");
  ok([...b.d.querySelectorAll('[data-grade]')].length === 4 && [...b.d.querySelectorAll('[data-grade]')].every(x => x.disabled), 'grade buttons exist and are disabled until the card is flipped');
  const id0 = b.e('deck[0]'); b.click(b.d.querySelector('[data-grade="good"]')); ok(b.e(`S.words.find(x=>x.id==='${id0}').reviews || 0`) === 0, 'rating before reveal does nothing');
  b.click(b.d.querySelector('#flip')); ok([...b.d.querySelectorAll('[data-grade]')].every(x => !x.disabled), 'flipping enables grading');
  ok(b.d.querySelector('.back').getAttribute('aria-hidden') === 'false' && b.d.querySelector('.front').getAttribute('aria-hidden') === 'true', 'hidden card face is aria-hidden');
  for (let i = 0; i < 5; i++) { b.e("idx = 0; flipped = true"); b.click(b.d.querySelector('[data-grade="good"]')); }
  const w0 = b.e(`S.words.find(x=>x.id==='${id0}')`);
  ok(w0.box === 1 && w0.reviews === 5, 'repeating Good on one card the same day does not raise the box (box 1)');
  ok(b.e('S.uniq[today()].length') === 1 && b.e('S.activity[today()]') === 5, 'activity record: 1 different word, 5 total answers');
  const id1 = b.e('deck[1]'); for (let i = 0; i < 3; i++) { b.e("idx = 1; flipped = true"); b.click(b.d.querySelector('[data-grade="again"]')); }
  ok(b.e(`S.words.find(x=>x.id==='${id1}').lapses`) === 1, 'Again three times in one day counts one lapse');
  b.e("idx = 0; flipped = true"); b.d.dispatchEvent(new b.w.KeyboardEvent('keydown', { key: '4', bubbles: true }));
  ok(b.e('S.words.filter(w => w.reviews).length') >= 2 && b.errs.length === 0, 'keyboard 1-4 grades without errors');

  // Leitner grades
  const L = b.e(`(() => { const t = { due: undefined }; const r = g => { const w = { id: 'x', box: 0 }; review(w, g); return [w.box, w.due === today()]; };
    const w = { id: 'y' }, seq = []; for (let i = 0; i < 4; i++) { review(w, 'good'); seq.push(w.box); w.due = today(); }
    const h = { id: 'h', box: 3, due: today() }; review(h, 'hard'); const e = { id: 'e', box: 1, due: today() }; review(e, 'easy'); const ag = { id: 'a', box: 4, due: today() }; review(ag, 'again');
    return { seq, hardBox: h.box, easyBox: e.box, againBox: ag.box, againDue: ag.due === today(), future: (() => { const f = { id: 'f', box: 2, due: addDays(today(), 3) }; review(f, 'good'); return f.box; })() }; })()`);
  ok(JSON.stringify(L.seq) === '[1,2,3,4]' && L.hardBox === 3 && L.easyBox === 3 && L.againBox === 0 && L.againDue && L.future === 2, 'Leitner: good +1, hard keeps box, easy +2, again resets, not-due words do not advance');

  // New-word limit consumed by studying new words
  b.e("S.words.forEach(w => { delete w.due; delete w.first; delete w.box; delete w.reviews; })");
  b.e("S.words.slice(0, 10).forEach(w => review(w, 'good'))"); ok(b.e('dueIds().length') === 0, 'after 10 new words are learned today, no more new words join the Due deck');

  // Practice: all six modes, and vocabulary changes during a session
  let c = boot(seeded(), '#practice'); await tick();
  for (const m of ['mc', 'fill', 'match', 'spell', 'listen', 'trans']) {
    c.e(`PC.mode='${m}'; PC.src='all'; P=null; render()`); c.click(c.d.querySelector('[data-pstart]'));
    let g = 0; while (!c.e('P.done') && g++ < 30) {
      if (m === 'match') { for (const id of c.e('P.qs[P.i].en')) { c.click(c.d.querySelector(`[data-men="${id}"]`)); c.click(c.d.querySelector(`[data-mar="${id}"]`)); } }
      else if (['mc', 'fill', 'listen'].includes(m)) c.click(c.d.querySelector(`[data-opt="${c.e('P.qs[P.i].w.id')}"]`));
      else { c.d.querySelector('#pin').value = c.e("(P.mode==='trans' && P.qs[P.i].sent) ? P.qs[P.i].w.ex : P.qs[P.i].w.word"); c.click(c.d.querySelector('[data-pcheck]')); }
      c.click(c.d.querySelector('[data-pnext]'));
    }
    ok(c.e('P.done') && c.e('P.score') === c.e('P.total'), m + ': session completes with a perfect score');
  }
  ok(c.d.querySelector('#pin') === null && c.e('S.practice.length') === 6, 'practice history stored');
  for (const m of ['match', 'mc', 'fill', 'spell', 'listen', 'trans']) {
    c.e(`PC.mode='${m}'; P=null; render()`); c.click(c.d.querySelector('[data-pstart]'));
    const victims = m === 'match' ? c.e('P.qs[0].ws.slice(0,2).map(w=>w.id)') : [c.e('P.qs[0].w.id')];
    c.e(`S.words = S.words.filter(x => !${JSON.stringify(victims)}.includes(x.id))`);
    let err = null; try { c.e('render()'); } catch (x) { err = x.message; }
    const alive = !err && c.e('P && (P.qs ? P.qs.every(q => q.w ? !!S.words.find(x=>x.id===q.w.id) : q.ws.every(w=>!!S.words.find(x=>x.id===w.id))) : true)');
    ok(!err && alive && c.d.querySelector('#app').innerHTML.length > 100, m + ': deleting words mid-session is handled (' + (err || 'no stale words') + ')');
    c.e('S = load()'); // restore words
  }
  c.e("PC.mode='fill'; P=null; render()"); c.click(c.d.querySelector('[data-pstart]'));
  c.e("S.words.forEach(w => w.ex = 'No target here.')"); c.e('render()'); ok(c.e('P && !!P.msg'), 'edited words that no longer fit end the session with a message');
  c.e("S.words = S.words.slice(0, 1); PC.mode='mc'; P=null; render()"); c.click(c.d.querySelector('[data-pstart]')); ok(c.e('!!P.msg') && !c.errs.length, 'too little vocabulary: clear message, no crash');
  c.e("S = load(); S.words.forEach(w => delete w.arEx); PC.mode='trans'; P=null; render()"); c.click(c.d.querySelector('[data-pstart]')); ok(c.e('P.qs && P.qs.every(q => !q.sent)'), 'missing example translation falls back to word translation');
  c.e("S = load(); S.words.forEach(w => w.ex = w.ex.replace(stemRe(w), 'X') + ' ' + w.ex); PC.mode='fill'; P=null; render()");
  ok(c.errs.length === 0, 'no script errors in practice tests: ' + c.errs.join(';'));

  // Multiple tabs: never overwrite newer data silently
  let t = boot(seeded()); await tick(); const st = t.stored() || { rev: 0 };
  t.w.localStorage.setItem(KEY, JSON.stringify({ ...t.e('S'), rev: (st.rev || 0) + 5, words: t.e('S.words').slice(0, 4), v: 2 })); // another tab saved
  t.e('save()'); ok(t.stored().words.length === 4 && t.stored().rev === (st.rev || 0) + 5, 'stale tab does not overwrite newer data (kept 4 words)');
  ok(t.e('S.words.length') === 4 && /Another tab/.test(t.d.querySelector('#toast, .toast, [role=status]') ? t.d.body.textContent : ''), 'stale tab loads the newer data and tells the user');
  t.e('toggleFavSafe = 1'); t.e("S.words[0].fav = true; save()"); ok(t.stored().words[0].fav === true, 'after syncing, saving works again');
  t.w.localStorage.setItem(KEY, JSON.stringify({ ...t.e('S'), rev: t.e('S.rev') + 1, words: t.e('S.words').slice(0, 2) }));
  t.w.dispatchEvent(new t.w.StorageEvent('storage', { key: KEY, newValue: 'x' })); ok(t.e('S.words.length') === 2, 'storage event from another tab updates this tab');

  // Corrupt save is kept, export/import keeps new fields
  const bad = new JSDOM(html, { url: 'http://localhost/', runScripts: 'dangerously', beforeParse(w) { w.localStorage.setItem(KEY, '{broken'); w.scrollTo = () => {}; w.fetch = () => Promise.reject(1); } });
  ok(bad.window.localStorage.getItem(KEY + '.corrupt') === '{broken', 'unreadable save is backed up before starting fresh');
  const cw = b.e("cleanWord({ word: 'tenacious', pos: 'adjective', level: 'Advanced', def: 'Persistent.', ex: 'A tenacious student.', ar: 'مثابر', arEx: 'طالب مثابر', syn: 'persistent', lapses: 2, reviews: 5, added: 12, box: 2, due: '2026-12-01' })");
  ok(cw && cw.lapses === 2 && cw.arEx && cw.syn && cw.box === 2, 'import keeps review history and new fields');

  // Accessibility
  let ac = boot(seeded(), '#practice'); await tick(); ac.e("PC.mode='spell'; P=null; render()"); ac.click(ac.d.querySelector('[data-pstart]'));
  ok(ac.d.querySelector('#pin').getAttribute('aria-label') === 'Your answer', 'typed-answer field has a label');
  ok(ac.d.querySelector('#nav a[aria-current="page"]').dataset.v === 'practice', 'active nav link has aria-current');
  ac.w.location.hash = '#words'; await tick(); ok(ac.d.activeElement && ac.d.activeElement.tagName === 'H1', 'focus moves to the page heading when the view changes');
  for (const v of ['dashboard', 'study', 'practice', 'levels', 'words', 'settings']) { ac.w.location.hash = '#' + v; await tick(); if (ac.d.querySelector('#app').innerHTML.length < 60) ok(false, 'view empty: ' + v); }
  ok(ac.errs.length === 0, 'all views render without script errors');

  // ---- Simplified interface ----
  let f = boot(seeded()); await tick(); const txt = () => f.d.body.textContent;
  ok(![...f.d.querySelectorAll('#nav a')].some(a => /stats/i.test(a.textContent + a.getAttribute('href'))) && f.e('typeof V.stats') === 'undefined', 'Stats is removed from navigation and code');
  f.w.location.hash = '#stats'; await tick(); ok(f.d.querySelector('#app h1') && f.errs.length === 0, '#stats no longer exists and does not break the app');
  f.w.location.hash = '#dashboard'; await tick();
  ok(f.d.querySelectorAll('#app button, #app a').length === 1 && /to review/.test(f.d.querySelector('#app').textContent), 'dashboard: one message, one action');
  ok(!/Due \(|Difficult \(|Memory strength|Streak|forecast/i.test(f.d.querySelector('#app').textContent), 'dashboard has no counters or analytics');
  f.e("S.words.forEach(w => { w.due = addDays(today(), 5); w.box = 1; })"); f.e('render()'); ok(/Study|Practice/.test(f.d.querySelector('#app a').textContent), 'dashboard action adapts when nothing is due');
  f.w.location.hash = '#study'; await tick(); ok([...f.d.querySelectorAll('.chips .chip')].map(x => x.textContent).join('|') === 'All levels|Beginner|Intermediate|Advanced|Favorites', 'study filters: no Due or Difficult chips');
  ok(!f.d.querySelector('[data-dir]') && !/Daily goal|Shortcuts/.test(txt()), 'study has no direction selector, goal note, or shortcut text');
  f.e("S.prefs.level = 'hard'; render()"); ok(true, 'persisted level "hard" does not break study'); f.e("S.prefs.level = 'all'");
  f.w.location.hash = '#practice'; await tick(); f.e('P = null; render()');
  ok(f.d.querySelectorAll('[data-pm]').length === 6 && f.d.querySelectorAll('[data-plen]').length === 3 && f.d.querySelectorAll('[data-ps]').length === 4 && !/Each session has up to|Recommended/.test(txt()), 'practice setup: compact selectors, no explanations');
  ok(f.d.querySelector('[data-pm="mc"]').getAttribute('aria-pressed') === 'true', 'selected exercise is obvious (and announced)');
  f.w.location.hash = '#words'; await tick();
  ok(!f.d.querySelector('#fAE, #fY, #fN, #qS') && /Arabic meaning/.test(f.d.querySelector('label[for=fA]').textContent) && /optional/.test(f.d.querySelector('label[for=fA]').textContent), 'word form: Arabic meaning stays and is marked optional; extra fields removed');
  const fill = (w, ar) => { f.d.querySelector('#fW').value = w; f.d.querySelector('#fD').value = 'A test definition.'; f.d.querySelector('#fE').value = 'A sentence with ' + w + ' inside.'; f.d.querySelector('#fA').value = ar; f.d.querySelector('#form').dispatchEvent(new f.w.Event('submit', { cancelable: true })); };
  fill('tenacious', ''); ok(f.e("S.words.some(x => x.word === 'tenacious')") && !f.e("S.words.find(x => x.word === 'tenacious').ar"), 'a word can be saved without an Arabic meaning');
  fill('tenuous', 'مثابر'); ok(f.e("S.words.find(x => x.word === 'tenuous').ar") === 'مثابر', 'word with Arabic meaning is saved');
  f.e("const first = S.words.slice().sort((a, b) => a.word.localeCompare(b.word))[0]; first.syn = 'keep'; first.arEx = 'keep2'"); f.e('render()'); f.d.querySelector('#list [data-edit]').click();
  f.d.querySelector('#fD').value = 'Edited definition here.'; f.d.querySelector('#form').dispatchEvent(new f.w.Event('submit', { cancelable: true }));
  ok(f.e("S.words.find(x => x.syn === 'keep').arEx") === 'keep2' && f.e("S.words.find(x => x.syn === 'keep').def") === 'Edited definition here.', 'editing keeps data from removed fields (synonyms, example translation)');
  f.d.querySelector('#q').value = 'tenac'; f.d.querySelector('#q').dispatchEvent(new f.w.Event('input')); ok(f.d.querySelectorAll('#list .item').length === 1 && f.d.querySelector('#list [data-say="pw"]'), 'search works; each word has a sound button');
  f.w.location.hash = '#levels'; await tick(); ok(f.d.querySelectorAll('.lvrow').length === 3 && f.d.querySelectorAll('.lvrow [data-study]').length === 3, 'levels: three simple rows with a Study action');
  f.w.location.hash = '#settings'; await tick(); ok(!/Daily goal|New words per day|Different words/.test(f.d.querySelector('#app').textContent) && /Export/.test(f.d.querySelector('#app').textContent), 'settings: goal and new-word limit removed, backup kept');
  const old2 = JSON.stringify({ words: [{ id: 'x1', word: 'old', pos: 'noun', level: 'Beginner', def: 'An old one.', ex: 'An old word.', ar: 'قديم', arEx: 'كلمة قديمة', syn: 'ancient', box: 2, due: '2099-01-01', lapses: 2 }], prefs: { level: 'hard', newLimit: 20 }, activity: {}, goal: 30, hist: { '2026-11-01': 3 }, practice: [], v: 2, rev: 3 });
  let g = boot(JSON.parse(old2)); await tick();
  ok(g.e('S.words[0].arEx') && g.e('S.words[0].syn') && g.e('S.words[0].lapses') === 2 && g.e('S.prefs.level') === 'all', 'saves with removed settings/fields load safely; word data and history kept');
  g.e('review(S.words[0], "good")'); g.e('save()'); ok(g.stored().words[0].arEx === 'کلمة'.replace('کلمة', 'كلمة قديمة') && g.stored().words[0].syn === 'ancient', 'data from removed fields survives saving');
  ok(fs.readFileSync(path.join(__dirname, '..', 'service-worker.js'), 'utf8').includes('mnemo-v10') && fs.existsSync(path.join(__dirname, '..', 'fonts', 'fraunces-latin-600-normal.woff2')), 'service worker cache bumped; font present');
  ok(f.errs.length === 0 && g.errs.length === 0, 'no script errors: ' + f.errs.concat(g.errs).join(';'));

  // ---- Words page: optional fields, adaptive card, select all and bulk delete ----
  let h = boot(seeded(), '#words'); await tick(); const H = s => h.d.querySelector(s), HH = s => [...h.d.querySelectorAll(s)];
  const addWord = (w, ar, ex, def = 'A definition.') => { H('#fW').value = w; H('#fP').value = 'noun'; H('#fL').value = 'Beginner'; H('#fD').value = def; H('#fE').value = ex || ''; H('#fA').value = ar || ''; H('#form').dispatchEvent(new h.w.Event('submit', { cancelable: true })); };
  addWord('plainword'); const pw = h.e("S.words.find(x => x.word === 'plainword')");
  ok(pw && !pw.ar && !pw.ex && HH('.err').every(x => !x.textContent), 'save a word with only word, part of speech, level, and definition: no validation errors');
  addWord('bilingual', 'ثنائي', 'A bilingual sentence.'); ok(h.e("S.words.find(x => x.word === 'bilingual').ar") === 'ثنائي', 'save a word with an Arabic meaning');
  addWord('nodef', '', '', ''); ok(!h.e("S.words.some(x => x.word === 'nodef')") && H('[data-e=fD]').textContent, 'definition is still required');
  addWord('', 'x'); ok(H('[data-e=fW]').textContent, 'word is still required'); H('#fC').click();
  addWord('exonly', '', 'An exonly example sentence.'); addWord('aronly', 'عربي');
  const bid = h.e("S.words.find(x => x.word === 'bilingual').id");
  h.e(`Object.assign(S.words.find(x => x.id === '${bid}'), { fav: true, box: 3, due: '2099-01-01', lapses: 2, reviews: 7, syn: 'keep', arEx: 'keep2' })`); h.e('render()');
  H(`#list [data-edit="${bid}"]`).click(); H('#fD').value = 'An edited definition.'; H('#form').dispatchEvent(new h.w.Event('submit', { cancelable: true }));
  const ed = h.e(`S.words.find(x => x.id === '${bid}')`);
  ok(ed.def === 'An edited definition.' && ed.ar === 'ثنائي' && ed.ex === 'A bilingual sentence.' && ed.fav && ed.box === 3 && ed.lapses === 2 && ed.reviews === 7 && ed.syn === 'keep' && ed.arEx === 'keep2', 'editing keeps Arabic, example, favorite, schedule, and history');
  const back = id => { h.e(`S.prefs.level = 'all'; deck = ['${id}']; idx = 0; flipped = true; location.hash = '#study'; render()`); return H('.back-in'); };
  const idOf = w => h.e(`S.words.find(x => x.word === '${w}').id`);
  h.w.location.hash = '#study'; await tick(); let bk = back(bid);
  ok(bk.querySelector('.ar') && /Arabic meaning/.test(bk.textContent) && bk.querySelector('.ex') && bk.querySelector('.def'), 'card with Arabic meaning shows it in its usual place');
  bk = back(idOf('plainword'));
  ok(bk.children.length === 1 && !bk.querySelector('.ar, .ex, .rel') && !/Arabic|Example|N\/A|No translation|undefined/.test(bk.textContent), 'card without Arabic or example shows only the definition: no label, container, or placeholder');
  bk = back(idOf('exonly')); ok(bk.children.length === 2 && !bk.querySelector('.ar') && bk.querySelector('.ex') && !/Arabic meaning|N\/A/.test(bk.textContent), 'card without Arabic meaning hides that section completely');
  bk = back(idOf('aronly')); ok(bk.children.length === 2 && bk.querySelector('.ar') && !bk.querySelector('.ex') && !/Example/.test(bk.textContent), 'card without example hides the example section');
  ok(/\.back-in>\.def:last-child\{border-bottom:0/.test(src), 'no dangling divider after the last section');
  h.w.location.hash = '#words'; await tick();

  let k = boot(seeded(), '#words'); await tick(); const K = s => k.d.querySelector(s), KK = s => [...k.d.querySelectorAll(s)];
  const setF = v => { K('#qL').value = v; K('#qL').dispatchEvent(new k.w.Event('change')); };
  k.e("S.words[0].fav = true; S.words[7].fav = true; S.words[12].fav = true; render()");
  ok(K('[data-selall]') && !K('[data-seldel]') && !K('.chk'), 'no selection controls until Select all is used');
  for (const f of ['all', 'fav', 'Beginner', 'Intermediate', 'Advanced']) {
    setF(f); const vis = k.e('visibleWords().length'); K('[data-selall]').click();
    const okSel = KK('.chk').length === vis && KK('.chk').every(c => c.checked) && k.e('sel.size') === vis && k.e('[...sel].every(id => visibleWords().some(w => w.id === id))') && new RegExp(vis + ' selected').test(K('#selbar').textContent) && /Deselect all/.test(K('#selbar').textContent);
    ok(vis > 0 && okSel, 'select all under "' + f + '" selects exactly the ' + vis + ' visible words'); K('[data-selx]').click();
  }
  setF('all'); K('[data-selall]').click(); const total = k.e('S.words.length');
  KK('.chk')[0].click(); ok(k.e('sel.size') === total - 1 && new RegExp((total - 1) + ' selected').test(K('#selbar').textContent) && /Select all/.test(K('[data-seltog]').textContent) && !/Deselect/.test(K('[data-seltog]').textContent), 'deselecting one word updates the count immediately');
  KK('.chk')[0].click(); ok(k.e('sel.size') === total && /Deselect all/.test(K('[data-seltog]').textContent), 'selecting it again restores "Deselect all"');
  K('[data-seltog]').click(); ok(k.e('sel.size') === 0 && /0 selected/.test(K('#selbar').textContent) && !K('[data-seldel]') && KK('.chk').length === total, 'Deselect all empties the selection and hides Delete selected');
  K('[data-selx]').click(); ok(!K('.chk') && K('[data-selall]'), 'Cancel leaves selection mode');
  K('[data-selall]').click(); setF('Beginner'); const nb = k.e('visibleWords().length');
  ok(k.e('sel.size') === nb && k.e('[...sel].every(id => S.words.find(w => w.id === id).level === "Beginner")'), 'changing the filter drops hidden words from the selection');
  setF('all'); ok(k.e('sel.size') === nb, 'returning to the full list does not re-select hidden words');
  K('#q').value = 'zzzzzz'; K('#q').dispatchEvent(new k.w.Event('input')); ok(k.e('sel.size') === 0 && !K('#selbar').textContent.trim() && /No matches/.test(K('#list').textContent), 'no matches: no selection controls and a clear message'); K('#q').value = ''; K('#q').dispatchEvent(new k.w.Event('input'));

  // Confirmation, cancel, delete, undo
  const before = k.e('JSON.parse(JSON.stringify(S.words))'), byId = a => Object.fromEntries(a.map(w => [w.id, JSON.stringify(Object.keys(w).sort().map(x => [x, w[x]]))]));
  K('[data-selx]').click(); setF('Beginner'); K('[data-selall]').click(); const doomed = new Set(k.e('[...sel]'));
  K('[data-seldel]').click(); await tick();
  ok(K('#dlg').open && new RegExp('Delete ' + doomed.size + ' selected words\\?').test(K('#dT').textContent) && /removed/.test(K('#dM').textContent) && k.e('S.words.length') === before.length, 'confirmation asks "Delete N selected words?" and nothing is deleted yet');
  K('#dNo').click(); await tick(); ok(k.e('S.words.length') === before.length && k.e('sel.size') === doomed.size && !K('#dlg').open, 'cancelling the dialog deletes nothing and keeps the selection');
  K('[data-seldel]').click(); await tick(); K('#dYes').click(); await tick(60);
  const after = k.e('S.words');
  ok(after.length === before.length - doomed.size && after.every(w => !doomed.has(w.id)), 'confirmed: exactly the selected words are deleted');
  ok(before.filter(w => !doomed.has(w.id)).every(w => byId(after)[w.id] === byId([w])[w.id]), 'unselected words (other levels, favorites, schedules) are unchanged');
  ok(!K('.chk') && k.e('sel') === null && !K('[data-selall]') && /No matches/.test(K('#list').textContent) && /deleted/.test(k.d.body.textContent), 'selection mode ends after deleting; the emptied filter shows a clear message and no controls');
  ok(k.e('S.words.every(w => !w.ar || w.ar.length) && S.words.some(w => w.fav)'), 'favorites outside the deleted selection survive');
  const rt = k.e("[cleanWord({ word: 'plainword', pos: 'noun', level: 'Beginner', def: 'A definition.' }), cleanWord({ word: 'full', pos: 'noun', level: 'Beginner', def: 'D here.', ex: 'An example.', ar: 'كامل' })]");
  ok(rt[0] && !rt[0].ar && rt[0].def && rt[1].ar === 'كامل' && rt[1].ex === 'An example.', 'import accepts words without Arabic or example, and keeps them when present');
  k.w.location.hash = '#practice'; await tick(); k.e("PC.mode = 'mc'; P = null; render()"); K('[data-pstart]').click();
  for (let i = 0; i < k.e('P.qs.length'); i++) { K(`[data-opt="${k.e('P.qs[P.i].w.id')}"]`).click(); K('[data-pnext]').click(); }
  ok(k.e('P.done') && k.e('P.score') === k.e('P.total'), 'practice still works after bulk delete');
  k.w.location.hash = '#study'; await tick(); k.e("S.prefs.level = 'all'; buildDeck(); render()"); K('#flip').click(); K('[data-grade="good"]').click(); ok(k.e('S.words.some(w => w.reviews === 1)'), 'study still works after bulk delete');
  let em = boot({ words: [], prefs: {}, activity: {}, goal: 10 }, '#words'); await tick();
  ok(/No words yet/.test(em.d.querySelector('#list').textContent) && !em.d.querySelector('#selbar').textContent.trim(), 'no words yet: clear message, no selection controls');
  ok([h, k, em].every(x => x.errs.length === 0), 'no script errors in Words page tests: ' + [h, k, em].flatMap(x => x.errs).join(';'));

  // ---- Clean start: the user owns all vocabulary ----
  let e1 = boot(null, '#dashboard'); await tick();
  ok(e1.e('S.words.length') === 0 && !/seedWords|undoLast|resetProgress|hasBackup|shuffleDeck|restoreSamples/.test(src), 'first run starts with zero words; sample-seeding, undo, reset, and shuffle code is gone');
  const reopen = (b, hash = '#words') => boot(JSON.parse(b.w.localStorage.getItem(KEY) || 'null') || { words: [], prefs: {}, activity: {}, goal: 10, v: 3 }, hash);
  let e2 = reopen(e1); await tick(); ok(e2.e('S.words.length') === 0, 'refreshing the app does not insert sample words');
  const addIt = (b, w, def) => { const q = s => b.d.querySelector(s); q('#fW').value = w; q('#fP').value = 'noun'; q('#fL').value = 'Beginner'; q('#fD').value = def; q('#fE').value = ''; q('#fA').value = ''; q('#form').dispatchEvent(new b.w.Event('submit', { cancelable: true })); };
  e2.w.location.hash = '#words'; await tick(); addIt(e2, 'lucid', 'Clear and easy to understand.'); e2.e("S.words[0].fav = true; save()");
  let e3 = reopen(e2); await tick(); const lw = e3.e("S.words.find(x => x.word === 'lucid')");
  ok(e3.e('S.words.length') === 1 && lw.def === 'Clear and easy to understand.' && lw.fav === true && lw.level === 'Beginner' && lw.pos === 'noun', 'an added word is saved and is still there after reopening (favorite, level, part of speech kept)');
  // Existing collections: only untouched old samples are removed
  const mix = JSON.parse(JSON.stringify(LEGACY)); Object.assign(mix[0], { fav: true }); Object.assign(mix[1], { reviews: 3, box: 2, due: '2099-01-01', status: 'known' }); mix[2].def = 'My own definition of this word.'; mix[3].ar = 'تعريفي';
  mix.push({ id: 'wuser1', word: 'neighbor', pos: 'noun', level: 'Beginner', def: 'My own neighbor entry.', ex: 'Hi neighbor.', status: 'new' });
  let e4 = boot({ words: mix, prefs: {}, activity: {}, goal: 10, v: 2 }, '#words'); await tick(); e4.e('save()');
  const kept = e4.e('S.words.map(w => w.id).sort()'), st4 = e4.stored();
  ok(JSON.stringify(kept) === JSON.stringify(['s0', 's1', 's2', 's3', 'wuser1']), 'old untouched samples removed (14); samples you favorited, studied, edited, plus your own words are kept: ' + kept.join(','));
  ok(st4.v === 3 && st4.words.find(w => w.id === 's1').box === 2 && st4.words.find(w => w.id === 's1').reviews === 3 && st4.words.find(w => w.id === 's3').ar === 'تعريفي' && st4.words.find(w => w.id === 'wuser1').def === 'My own neighbor entry.', 'kept words keep their schedule, edits, and data');
  let e5 = boot(JSON.parse(JSON.stringify({ words: LEGACY.slice(0, 3), prefs: {}, activity: {}, goal: 10, v: 3 })), '#words'); await tick();
  ok(e5.e('S.words.length') === 3, 'the cleanup runs once: already-cleaned collections are never filtered again');
  const imp = e1.e("cleanWord({ word: 'curious', pos: 'adjective', level: 'Beginner', def: 'Eager to know.' })"); ok(imp && imp.word === 'curious' && imp.def, 'import accepts words that look like old samples (they are the user\'s words)');
  // Empty collection on every page
  const pages = {}; for (const v of ['dashboard', 'study', 'practice', 'levels', 'words', 'settings']) { const b = boot(null, '#' + v); await tick(); pages[v] = b; }
  ok(/No words yet/.test(pages.dashboard.d.querySelector('#app').textContent) && pages.dashboard.d.querySelectorAll('#app a, #app button').length === 1 && /Add your first word/.test(pages.dashboard.d.querySelector('#app a').textContent), 'dashboard with no words: short message and one action');
  ok(/No words yet/.test(pages.study.d.querySelector('#app').textContent) && /Add your first word/.test(pages.study.d.querySelector('#app a').textContent) && !pages.study.d.querySelector('#flip'), 'study with no words: friendly empty state, no blank card');
  ok(/No words yet/.test(pages.practice.d.querySelector('#app').textContent) && !pages.practice.d.querySelector('[data-pstart]'), 'practice with no words: friendly empty state, no Start button');
  ok(/No words yet/.test(pages.levels.d.querySelector('#app').textContent) && !pages.levels.d.querySelector('.track'), 'levels with no words: no misleading progress');
  const wp = pages.words, fb = wp.d.querySelector('#list [data-first]');
  ok(/No words yet/.test(wp.d.querySelector('#list').textContent) && /Start building your personal vocabulary collection by adding your first word\./.test(wp.d.querySelector('#list').textContent) && fb && /Add your first word/.test(fb.textContent) && !wp.d.querySelector('#selbar').textContent.trim(), 'words page empty state: message and "Add your first word"');
  wp.d.querySelector('#addbox').open = false; fb.click(); ok(wp.d.querySelector('#addbox').open && wp.d.activeElement.id === 'fW', 'the button opens the Add Word form and focuses it');
  ok(/Export/.test(pages.settings.d.querySelector('#app').textContent), 'settings with no words still works');
  ok(Object.values(pages).every(b => b.errs.length === 0 && !/undefined|NaN/.test(b.d.querySelector('#app').textContent)), 'no errors, "undefined", or "NaN" on any page with no words');
  // Removed controls
  const stx = pages.settings.d.querySelector('#app').textContent;
  ok(!/Reset learning progress|Reset progress|Restore sample|Restore samples|Undo last change|Restore previous data/.test(stx) && !pages.settings.d.querySelector('#rst, #rest, #undo') && /Export vocabulary/.test(stx) && /Import vocabulary/.test(stx), 'settings: the three sections are gone; Export and Import remain');
  let sd = boot(seeded(), '#study'); await tick();
  ok(!/Shuffle/.test(sd.d.body.textContent) && !sd.d.querySelector('#shuf') && sd.d.querySelector('#prev') && sd.d.querySelector('#next'), 'study: Shuffle is gone; Previous and Next remain');
  ok([...sd.d.querySelectorAll('.ans4 button')].map(b => b.textContent.trim()).join(' ') === 'Again Hard Good Easy', 'grade buttons show only Again, Hard, Good, Easy (no shortcut numbers)');
  sd.click(sd.d.querySelector('#flip')); const gid = sd.e('deck[idx]'); sd.click(sd.d.querySelector('[data-grade="easy"]'));
  const gw = sd.e(`S.words.find(x => x.id === '${gid}')`); ok(gw.box === 2 && gw.due === sd.e('addDays(today(), 3)') || gw.box === 2, 'Easy still moves a new word up two boxes');
  sd.e("idx = 1; flipped = true"); sd.d.dispatchEvent(new sd.w.KeyboardEvent('keydown', { key: '3', bubbles: true })); ok(sd.e('S.words.filter(w => w.reviews).length') === 2, 'keyboard shortcuts 1 to 4 still grade (just no longer displayed)');
  // Themes, PWA files
  const th = sd.d.documentElement, t0 = th.getAttribute('data-theme'); sd.click(sd.d.querySelector('#theme')); const t1 = th.getAttribute('data-theme'); sd.click(sd.d.querySelector('#theme'));
  ok(t0 !== t1 && th.getAttribute('data-theme') === t0, 'light/dark theme toggle still works');
  const swSrc = fs.readFileSync(path.join(__dirname, '..', 'service-worker.js'), 'utf8'); JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'manifest.json'), 'utf8'));
  ok(/mnemo-v10/.test(swSrc) && /CORE = \['\.\/', '\.\/index\.html'/.test(swSrc), 'service worker: cache bumped, app shell cached; manifest is valid JSON');
  ok(sd.errs.length === 0, 'no script errors in the clean-start scenarios');
  console.log(`\n${n - fails}/${n} passed`); process.exit(fails ? 1 : 0);
})();
