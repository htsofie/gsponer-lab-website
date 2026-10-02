/* ---------- render ---------- */
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const initials = n => n.split(' ').filter(Boolean).map(w => w[0]).slice(0,2).join('');
const photo = p => p.photo ? `<div class="photo"><img src="${esc(p.photo)}" alt="${esc(p.name)}"></div>` : `<div class="photo" role="img" aria-label="Photo placeholder for ${esc(p.name)}">${initials(p.name)}<span class="tag">photo</span></div>`;
const links = p => `<div class="links">${p.email ? `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>` : '<span class="todo">email</span>'}${p.linkedin ? `<a href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : '<span class="todo">LinkedIn</span>'}</div>`;

document.getElementById('pi').innerHTML = `<div class="pi">${photo(PI)}<div>
  <div class="role">${esc(PI.role)}</div><h2>${esc(PI.name)}</h2>
  <div class="prose">${PI.bio.map(t => `<p>${esc(t)}</p>`).join('')}</div>
  <dl class="facts"><dt>Office</dt><dd>${esc(PI.office)}</dd><dt>Honours</dt><dd>${esc(PI.honours)}</dd></dl>
  ${links(PI)}</div></div>`;

document.getElementById('groups').innerHTML = GROUPS.map(g => `<div class="group"><h2>${esc(g.title)}</h2><div class="grid">${g.people.map(p => `<article class="person">${photo(p)}<div><h3>${esc(p.name)}</h3><div class="role">${esc(p.role)}</div></div>${p.bio ? `<p>${esc(p.bio)}</p>` : '<p><span class="todo">add a short description</span></p>'}${links(p)}</article>`).join('')}</div></div>`).join('');

const bold = s => esc(s).replace(/Gsponer J/g, '<b>Gsponer J</b>');
function authors(a) {
  const l = a.split(', ');
  if (l.length <= 8) return bold(a);
  return `${bold(l.slice(0,3).join(', '))}, <span class="rest" hidden>${bold(l.slice(3).join(', '))}</span><button class="more" type="button">+${l.length-3} more</button>`;
}
const pubItem = p => `<li class="pub"><a class="t" href="${esc(p[4])}" target="_blank" rel="noopener">${esc(p[2])}</a><div class="au">${authors(p[1])}</div><div class="j">${esc(p[3])} · ${p[0]}</div></li>`;

const RECENT = [0, 1, 2, 4]; /* indices into PUBS shown on the home page */
document.getElementById('latest-pubs').innerHTML = RECENT.map(i => pubItem(PUBS[i])).join('');
document.getElementById('news-list').innerHTML = NEWS.map(n => `<div class="year"><h2>${n[0]}</h2><div class="pub"><div class="t">${esc(n[1])}</div><div class="au">${esc(n[2])}</div></div></div>`).join('') + '<div class="year"><h2>&nbsp;</h2><div class="pub"><span class="todo">add news item</span></div></div>';
const years = [...new Set(PUBS.map(p => p[0]))];
document.getElementById('pub-list').innerHTML = years.map(y => `<div class="year" data-y="${y}"><h2>${y}</h2><ul class="pubs">${PUBS.filter(p => p[0] === y).map(pubItem).join('')}</ul></div>`).join('') + '<p class="empty" id="pub-empty" hidden>No publications match.</p>';

const cardItem = (c, kind) => `<article class="card"><h3>${esc(c[0])}${c[3] && kind === 'db' ? `<span class="pill">${esc(c[3])}</span>` : ''}</h3><p>${esc(c[1])}</p>${kind === 'sw' && c[3] ? `<p><span class="todo">${esc(c[3])}</span></p>` : ''}<div class="links">${c[2] ? `<a href="${esc(c[2])}" target="_blank" rel="noopener">Open</a>` : ''}</div></article>`;
document.getElementById('sw-list').innerHTML = SW.map(c => cardItem(c, 'sw')).join('');
document.getElementById('db-list').innerHTML = DB.map(c => cardItem(c, 'db')).join('');

/* ---------- publications filter + author expand ---------- */
const q = document.getElementById('pub-q'), cnt = document.getElementById('pub-count');
function filterPubs() {
  const t = q.value.trim().toLowerCase(); let n = 0;
  document.querySelectorAll('#pub-list .year').forEach(y => {
    let any = false;
    y.querySelectorAll('.pub').forEach(li => {
      const show = !t || (li.textContent + (li.querySelector('.rest') ? '' : '')).toLowerCase().includes(t);
      li.hidden = !show; if (show) { any = true; n++; }
    });
    y.hidden = !any;
  });
  document.getElementById('pub-empty').hidden = n > 0;
  cnt.textContent = n + ' of ' + PUBS.length + ' papers';
}
q.addEventListener('input', filterPubs); filterPubs();
document.addEventListener('click', e => {
  const b = e.target.closest('.more'); if (!b) return;
  const r = b.previousElementSibling; r.hidden = !r.hidden;
  b.textContent = r.hidden ? '+' + b.dataset.n + ' more' : 'show fewer';
});
document.querySelectorAll('.more').forEach(b => { b.dataset.n = b.textContent.replace(/\D/g,''); });

/* ---------- routing ---------- */
function show(p) {
  if (!PAGES.includes(p)) p = 'home';
  document.querySelectorAll('section[data-page]').forEach(s => { s.hidden = s.dataset.page !== p; });
  document.body.dataset.page = p;
  document.querySelectorAll('#nav a').forEach(a => { if (a.getAttribute('href') === '#' + p) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  window.scrollTo(0, 0);
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  e.preventDefault(); const p = a.getAttribute('href').slice(1); show(p);
  try { history.replaceState(null, '', '#' + p); } catch (_) {}
});
window.addEventListener('hashchange', () => show(location.hash.slice(1)));
show(location.hash.slice(1));

/* ---------- seeker ---------- */
const found = document.getElementById('found'); let ft;
document.getElementById('peek').addEventListener('click', () => {
  found.classList.add('on'); clearTimeout(ft); ft = setTimeout(() => found.classList.remove('on'), 2200);
});

/* ---------- intro ---------- */
function startIntro() {
  const tpl = document.getElementById('intro-tpl');
  document.body.appendChild(tpl.content.cloneNode(true));
  const el = document.body.lastElementChild;
  const colors = ['#2f6b4a', '#4f8a66', '#7fa88c', '#a9c6b2', '#c9a77f', '#a9825a', '#dcc7a6'];
  let seed = 7; const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = () => colors[Math.floor(r() * colors.length)];
  const items = [];
  const add = (x, y, s, rot) => {
    const c1 = pick(), c2 = pick();
    items.push({ y, html: `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)}) scale(${s.toFixed(2)})" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M-34 -4q8-22 17 0t17 0t17 0t14 -2" stroke="${c1}" stroke-width="9"/><path d="M-32 10c12 16 26-18 42-2s22 10 32-4" stroke="${c2}" stroke-width="3"/><path d="M-26 22h42" stroke="${c2}" stroke-width="7"/><path d="M14 14l15 8l-15 8z" fill="${c2}" stroke="none"/></g>` });
  };
  [[545, 10, 140, 860], [497, 9, 170, 830], [449, 8, 200, 800], [401, 6, 260, 740], [355, 4, 330, 670], [318, 2, 420, 580]].forEach(([y, n, x0, x1]) => {
    for (let i = 0; i < n; i++) add(x0 + (x1 - x0) * i / (n - 1) + (r() - 0.5) * 24, y + (r() - 0.5) * 20, 0.95 + r() * 0.4, (r() - 0.5) * 80);
  });
  for (let i = 0; i < 30; i++) { const a = r() * 6.283, d = Math.sqrt(r()); add(500 + Math.cos(a) * d * 150, 430 + Math.sin(a) * d * 90, 1 + r() * 0.5, r() * 180 - 90); }
  items.sort((a, b) => b.y - a.y);
  el.querySelector('.pile').innerHTML = items.map(i => i.html).join('');
  document.body.style.overflow = 'hidden';
  const end = () => { el.remove(); document.body.style.overflow = ''; };
  el.addEventListener('animationend', e => { if (e.animationName === 'introOut') end(); });
  const skip = el.querySelector('.intro-skip');
  skip.addEventListener('click', end);
  skip.focus();
}
document.getElementById('replay').addEventListener('click', () => { if (!document.querySelector('.intro')) { show('home'); startIntro(); } });
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && (location.hash === '' || location.hash === '#home')) startIntro();

/* ---------- banner fades into the page on scroll ---------- */
(function () {
  const banner = document.querySelector('.banner'), img = document.querySelector('.banner-img');
  let ticking = false;
  function update() {
    ticking = false;
    const y = window.scrollY, h = banner.offsetHeight;
    banner.style.opacity = Math.max(0, 1 - y / (h * 0.8));
    img.style.transform = 'translateY(' + Math.round(y * 0.2) + 'px)';
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
})();
