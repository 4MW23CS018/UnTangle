const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const state = {
  user: null,
  events: [],
  publications: [],
  gallery: [],
  notifications: []
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('ieee_sb_state') || '{}');
    Object.assign(state, saved);
  } catch (_) {}
}

function saveState() {
  localStorage.setItem('ieee_sb_state', JSON.stringify(state));
}

function showToast(message, timeout = 3000) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), timeout);
}

function smoothNav() {
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      $$('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

function setupMobileNav() {
  const hamburger = $('#hamburger');
  const navLinks = $('.nav-links');
  hamburger.addEventListener('click', () => {
    const isOpen = getComputedStyle(navLinks).display !== 'none';
    if (!isOpen) {
      navLinks.style.display = 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.right = '20px';
      navLinks.style.top = '70px';
      navLinks.style.background = '#0d1626';
      navLinks.style.padding = '12px';
      navLinks.style.borderRadius = '12px';
      navLinks.style.border = '1px solid rgba(255,255,255,0.12)';
      navLinks.style.gap = '6px';
    } else {
      navLinks.removeAttribute('style');
    }
  });
}

function renderTeam() {
  const team = [
    { name: 'Dr. A. Advisor', role: 'Faculty Advisor', img: '' },
    { name: 'Jane Doe', role: 'Chair', img: '' },
    { name: 'John Smith', role: 'Vice Chair', img: '' },
    { name: 'Priya Kumar', role: 'Secretary', img: '' },
    { name: 'Wei Chen', role: 'Treasurer', img: '' },
    { name: 'Amir Ali', role: 'Publicity Lead', img: '' }
  ];
  const grid = $('#teamGrid');
  grid.innerHTML = team.map(m => `
    <div class="card glass" style="text-align:center">
      <div style="width:96px;height:96px;border-radius:50%;margin:0 auto 10px;background:linear-gradient(135deg,#0e2239,#173251);"></div>
      <h4 style="margin:6px 0 2px">${m.name}</h4>
      <p style="margin:0;color:#b7c5d3">${m.role}</p>
    </div>
  `).join('');
}

function seedDemoData() {
  if (!state.publications || state.publications.length === 0) {
    state.publications = [
      { title: 'Deep Learning for Edge Devices', authors: 'J. Doe, P. Kumar', link: '#', date: '2025-03-21' },
      { title: '6G Communication Paradigms', authors: 'W. Chen', link: '#', date: '2025-05-02' },
      { title: 'Robotics in Humanitarian Aid', authors: 'A. Ali', link: '#', date: '2025-06-15' }
    ];
  }
  if (!state.events || state.events.length === 0) {
    state.events = [
      { id: crypto.randomUUID(), title: 'AI Hackathon', date: nextDate(7), venue: 'Innovation Lab', desc: '48-hour build sprint', photos: [] },
      { id: crypto.randomUUID(), title: '5G Workshop', date: today(), venue: 'Auditorium', desc: 'Hands-on session', photos: [] },
      { id: crypto.randomUUID(), title: 'Women in Tech Panel', date: prevDate(20), venue: 'Seminar Hall', desc: 'Leaders share insights', photos: [] }
    ];
  }
}

function today() {
  return new Date().toISOString().slice(0,10);
}
function nextDate(days) {
  const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0,10);
}
function prevDate(days) {
  const d = new Date(); d.setDate(d.getDate() - days); return d.toISOString().slice(0,10);
}

function renderPublications() {
  const root = $('#publicationsGrid');
  root.innerHTML = state.publications.map(p => `
    <article class="card glass">
      <h4 style="margin:0 0 6px">${p.title}</h4>
      <p style="margin:0;color:#b7c5d3">${p.authors}</p>
      <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center">
        <span style="color:#b7c5d3">${p.date}</span>
        <a href="${p.link}" class="btn btn-outline" target="_blank" rel="noopener">View</a>
      </div>
    </article>
  `).join('');
}

function statusForEvent(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  if (d.toDateString() === now.toDateString()) return 'ongoing';
  return d > now ? 'upcoming' : 'past';
}

function renderEvents(filter = 'upcoming') {
  const grid = $('#eventsGrid');
  const items = state.events.filter(ev => filter === 'all' ? true : statusForEvent(ev.date) === filter);
  grid.innerHTML = items.map(ev => `
    <article class="card glass">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <h4 style="margin:0">${ev.title}</h4>
        <span class="chip ${statusForEvent(ev.date)}">${statusForEvent(ev.date).toUpperCase()}</span>
      </div>
      <p style="margin:8px 0;color:#b7c5d3">${ev.desc || ''}</p>
      <div style="display:flex;gap:10px;color:#b7c5d3">
        <span>📅 ${ev.date}</span>
        <span>📍 ${ev.venue}</span>
      </div>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
        ${ev.photos.slice(0,4).map(src => `<img src="${src}" alt="${ev.title}" style="width:72px;height:72px;object-fit:cover;border-radius:10px;cursor:zoom-in" data-lightbox />`).join('')}
      </div>
    </article>
  `).join('');
  // lightbox bindings
  $$('[data-lightbox]', grid).forEach(img => img.addEventListener('click', () => openLightbox(img.src)));
}

function bindCalendarFilters() {
  $$('.calendar-controls .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.calendar-controls .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderEvents(chip.dataset.filter);
    });
  });
}

function renderDashboard() {
  const dashEv = $('#dashEvents');
  dashEv.innerHTML = state.events
    .filter(e => ['upcoming','ongoing'].includes(statusForEvent(e.date)))
    .slice(0, 5)
    .map(e => `<div class="glass" style="padding:10px;border-radius:12px">${e.title} — ${e.date}</div>`)
    .join('');

  const dp = $('#dashPublications');
  dp.innerHTML = state.publications.slice(0,5).map(p => `<div class="glass" style="padding:10px;border-radius:12px">${p.title}</div>`).join('');

  const nl = $('#notificationsList');
  nl.innerHTML = (state.notifications || []).slice(-5).reverse().map(n => `<li class="glass" style="padding:10px;border-radius:12px">${n}</li>`).join('');
}

function renderGallery() {
  const grid = $('#galleryGrid');
  const allPhotos = state.events.flatMap(e => e.photos.map(src => ({ src, title: e.title })));
  grid.innerHTML = allPhotos.map(p => `<img src="${p.src}" alt="${p.title}" data-lightbox />`).join('');
  $$('[data-lightbox]', grid).forEach(img => img.addEventListener('click', () => openLightbox(img.src)));
}

function openLightbox(src) {
  const lb = $('#lightbox');
  $('#lightboxImg').src = src;
  lb.classList.remove('hidden');
}

function closeLightbox() {
  $('#lightbox').classList.add('hidden');
}

function bindLightbox() {
  $('#lightboxClose').addEventListener('click', closeLightbox);
  $('#lightbox').addEventListener('click', (e) => { if (e.target.id === 'lightbox') closeLightbox(); });
}

function bindCTA() {
  $('#ctaJoin').addEventListener('click', () => window.location.hash = '#about');
  $('#ctaLogin').addEventListener('click', openLoginModal);
}

function openLoginModal() {
  $('#loginModal').classList.remove('hidden');
  $('#loginModal').setAttribute('aria-hidden', 'false');
}

function closeLoginModal() {
  $('#loginModal').classList.add('hidden');
  $('#loginModal').setAttribute('aria-hidden', 'true');
}

function bindLoginModal() {
  $('#openLogin').addEventListener('click', openLoginModal);
  $('#ctaLogin').addEventListener('click', openLoginModal);
  $('#closeLogin').addEventListener('click', closeLoginModal);
  $('#xCloseLogin').addEventListener('click', closeLoginModal);
}

function bindLoginForm() {
  $('#loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#loginName').value.trim();
    const email = $('#loginEmail').value.trim();
    const membershipId = $('#loginId').value.trim();
    if (!name || !email || !membershipId) return;
    const isAdmin = membershipId.toUpperCase().endsWith('-ADMIN');
    state.user = { name, email, membershipId, role: isAdmin ? 'admin' : 'member' };
    state.notifications.push(`Welcome ${name}!`);
    saveState();
    closeLoginModal();
    updateAuthUI();
    showToast(`Logged in as ${state.user.role}.`);
  });
}

function updateAuthUI() {
  const dash = $('#dashboard');
  if (state.user) {
    dash.classList.remove('hidden');
    $('#adminPanel').classList.toggle('hidden', state.user.role !== 'admin');
  } else {
    dash.classList.add('hidden');
  }
  renderDashboard();
}

function bindEventForm() {
  const form = $('#eventForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = $('#eventTitle').value.trim();
    const date = $('#eventDate').value;
    const venue = $('#eventVenue').value.trim();
    const desc = $('#eventDesc').value.trim();
    const files = $('#eventPhotos').files;
    const photos = await Promise.all(Array.from(files).map(file => toBase64(file)));
    const ev = { id: crypto.randomUUID(), title, date, venue, desc, photos };
    state.events.unshift(ev);
    if (photos.length) state.gallery.push(...photos);
    state.notifications.push(`New event: ${title} on ${date}`);
    saveState();
    form.reset();
    renderEvents($('.calendar-controls .chip.active')?.dataset.filter || 'upcoming');
    renderDashboard();
    renderGallery();
    showToast('Event added');
  });
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function bindContactForm() {
  $('#contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    $('#contactStatus').textContent = 'Thank you! We will get back to you soon.';
    showToast('Message sent');
  });
}

function wireEventsSection() {
  bindCalendarFilters();
  renderEvents('upcoming');
}

function wirePublicationsSection() {
  renderPublications();
}

function wireGallerySection() {
  renderGallery();
}

function initYear() {
  $('#year').textContent = new Date().getFullYear();
}

function init() {
  loadState();
  seedDemoData();
  saveState();
  initYear();
  smoothNav();
  setupMobileNav();
  bindCTA();
  bindLoginModal();
  bindLoginForm();
  bindEventForm();
  bindContactForm();
  bindLightbox();
  renderTeam();
  wireEventsSection();
  wirePublicationsSection();
  wireGallerySection();
  updateAuthUI();
}

document.addEventListener('DOMContentLoaded', init);


