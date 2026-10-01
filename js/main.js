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

document.getElementById('latest-pubs').innerHTML = PUBS.slice(0,3).map(pubItem).join('');
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
