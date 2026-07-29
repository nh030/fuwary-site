/* ===========================================================
   Fuwary サイト共通スクリプト
   料金やテキストは Google スプレッドシートから読み込みます。
   シートを書き換えると、この2ページの内容が自動で切り替わります。
   （シートが読めなかった場合は HTML に書かれた内容がそのまま表示されます）
   =========================================================== */

const SHEET_ID = '1_E0iUEAtdjn18jivYYZ323UcCL2qTx7uKWUvCl99wSs';
const PAGE = document.body.dataset.page;           // 'ふわりぃ' または 'い～よぉ'
const PREFIX = document.body.dataset.prefix;       // 'salon' または 'foot'

/* headers=1 は必須。省略すると Google 側が「何行目までが見出しか」を勝手に推測し、
   全部の行を見出しとみなして1行に連結した CSV を返すことがある。 */
const csvUrl = (sheetName) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(sheetName)}&_=${Date.now()}`;

/* ---------- CSV パース ---------- */
function parseCSV(text) {
  const rows = [];
  let row = [], cur = '', inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuote) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; } else { inQuote = false; }
      } else cur += c;
    } else {
      if (c === '"') inQuote = true;
      else if (c === ',') { row.push(cur); cur = ''; }
      else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
      else if (c !== '\r') cur += c;
    }
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

/* ヘッダー行をキーにしたオブジェクト配列へ */
function toObjects(rows) {
  if (!rows.length) return [];
  const head = rows[0].map((h) => h.trim());
  return rows.slice(1)
    .map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])))
    .filter((o) => Object.values(o).some((v) => v !== ''));
}

async function fetchSheet(name) {
  const res = await fetch(csvUrl(name));
  if (!res.ok) throw new Error(`${name}: ${res.status}`);
  return toObjects(parseCSV(await res.text()));
}

const esc = (s) => String(s).replace(/[<>]/g, (c) => ({ '<': '&lt;', '>': '&gt;' }[c]));

/* ---------- 描画 ---------- */

function renderMenu(list) {
  const box = document.getElementById('menu-list');
  if (!box) return;
  const items = list.filter((r) => r['ページ'] === PAGE);
  if (!items.length) return;
  box.innerHTML = items.map((m) => {
    const prices = [1, 2, 3]
      .map((n) => ({ t: m[`時間${n}`], p: m[`料金${n}`] }))
      .filter((x) => x.t || x.p)
      .map((x) => `<div class="price-row"><span>${esc(x.t)}</span><span class="p">${esc(x.p)}</span></div>`)
      .join('');
    return `<div class="card rv on">
      <h3><span class="dot"></span>${esc(m['メニュー名'])}</h3>
      ${m['バッジ'] ? `<span class="note-tag">${esc(m['バッジ'])}</span>` : ''}
      ${m['説明'] ? `<p class="desc">${esc(m['説明'])}</p>` : ''}
      ${prices}
    </div>`;
  }).join('');
}

function renderSpecial(kv) {
  const box = document.getElementById('special-box');
  if (!box || !kv['コース名']) return;
  const items = [1, 2, 3, 4, 5, 6]
    .map((n) => kv[`内容${n}`])
    .filter(Boolean)
    .map((v) => `<li>${esc(v)}</li>`)
    .join('');
  box.innerHTML = `
    ${kv['リボン'] ? `<span class="ribbon">${esc(kv['リボン'])}</span>` : ''}
    <h3>${esc(kv['コース名'])}</h3>
    ${kv['サブ'] ? `<div class="time">${esc(kv['サブ'])}</div>` : ''}
    <ul>${items}</ul>
    <div class="price-line">
      ${kv['通常価格'] ? `<span class="old">${esc(kv['通常価格'])}</span>` : ''}
      <span class="now">${esc(kv['価格'] || '')}</span>
    </div>`;
}

function renderOptions(list) {
  const box = document.getElementById('option-list');
  if (!box || !list.length) return;
  box.innerHTML = list.map((o) => `
    <div class="opt">
      <div class="o-name">${esc(o['オプション名'])}</div>
      <div class="o-time">${esc(o['時間'])}</div>
      <div class="o-price">${esc(o['料金'])}</div>
    </div>`).join('');
}

function renderCourses(list) {
  const box = document.getElementById('course-list');
  if (!box) return;
  const items = list.filter((r) => r['ページ'] === PAGE);
  if (!items.length) return;
  box.innerHTML = items.map((c) => `
    <div class="course rv on">
      <div class="course-top">
        <h3>${esc(c['講座名'])}</h3>
        ${c['料金'] ? `<span class="c-price">${esc(c['料金'])}</span>` : ''}
      </div>
      ${c['時間'] ? `<span class="c-time">${esc(c['時間'])}</span>` : ''}
      ${c['説明'] ? `<p>${esc(c['説明'])}</p>` : ''}
    </div>`).join('');
}

/* 基本情報（テキスト・SNSリンク）を反映 */
function applyInfo(kv) {
  document.querySelectorAll('[data-info]').forEach((el) => {
    const v = kv[el.dataset.info];
    if (v) el.innerHTML = v;   // 太字や改行タグを使えるようにあえてHTMLとして流し込む
  });
  document.querySelectorAll('[data-link]').forEach((el) => {
    const v = kv[el.dataset.link];
    if (v && /^https?:\/\//.test(v)) {
      el.href = v;
      el.target = '_blank';
      el.rel = 'noopener';
      el.onclick = null;
    }
  });
}

/* ---------- 読み込み ---------- */
async function loadContent() {
  try {
    const [menu, option, special, course, info] = await Promise.all([
      fetchSheet('メニュー'), fetchSheet('オプション'), fetchSheet('スペシャル'),
      fetchSheet('講座'), fetchSheet('基本情報'),
    ]);
    const specialKV = Object.fromEntries(special.map((r) => [r['項目'], r['内容']]));
    const infoKV = Object.fromEntries(info.map((r) => [r['キー'], r['内容']]));
    renderMenu(menu);
    renderOptions(option);
    renderSpecial(specialKV);
    renderCourses(course);
    applyInfo(infoKV);
  } catch (e) {
    console.warn('スプレッドシートを読み込めませんでした。ページ内の内容を表示します。', e);
  }
}

/* ---------- 表示演出・ナビ ---------- */
function initUI() {
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
  }, { threshold: .1 });
  document.querySelectorAll('.rv').forEach((el) => io.observe(el));

  const links = [...document.querySelectorAll('#nav a.sec')];
  const secs = links.map((a) => document.querySelector(a.getAttribute('href')));
  const navBox = document.querySelector('.nav-scroll');
  const toTop = document.getElementById('toTop');
  let lastIdx = -2;

  /* 選択中のタブがタブ表示エリアから外れていたら、見える位置まで寄せる
     （offsetLeft は基準要素によってずれるため、実際の表示位置で判定する） */
  function ensureTabVisible(el) {
    if (!navBox || !el) return;
    const box = navBox.getBoundingClientRect();
    const tab = el.getBoundingClientRect();
    const pad = 10;
    if (tab.left < box.left + pad) {
      navBox.scrollBy({ left: tab.left - box.left - pad, behavior: 'smooth' });
    } else if (tab.right > box.right - pad) {
      navBox.scrollBy({ left: tab.right - box.right + pad, behavior: 'smooth' });
    }
  }

  function spy() {
    const y = scrollY + 90;
    let idx = -1;
    secs.forEach((s, i) => { if (s && s.offsetTop <= y) idx = i; });
    if (idx !== lastIdx) {
      lastIdx = idx;
      links.forEach((a, i) => a.classList.toggle('active', i === idx));
      if (idx >= 0) ensureTabVisible(links[idx]);
    }
    if (toTop) toTop.classList.toggle('show', scrollY > 600);
  }
  let tick = false;
  addEventListener('scroll', () => {
    if (!tick) { tick = true; requestAnimationFrame(() => { spy(); tick = false; }); }
  }, { passive: true });
  spy();
}

initUI();
loadContent();
