/* ============================================================
   THE CLEAN ARCHITECT — interactions
   ============================================================ */

// ---------- Hero on-load stagger ----------
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.hero .fade-up').forEach((el) => {
    const delay = parseInt(el.dataset.delay || '0', 10);
    setTimeout(() => el.classList.add('in'), delay);
  });
});

// ---------- Counter animation ----------
function animateCounter(el, to, duration = 1500, decimals = 0) {
  const start = performance.now();
  const from = 0;
  const suffix = el.dataset.suffix || '';
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  function fmt(v) {
    return (decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-US')) + suffix;
  }
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const v = from + (to - from) * ease(t);
    el.textContent = fmt(v);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = fmt(to);
  }
  requestAnimationFrame(tick);
}
document.querySelectorAll('.num-counter[data-suffix]').forEach(el => {
  el.textContent = '0' + (el.dataset.suffix || '');
});
const numbersGrid = document.getElementById('numbersGrid');
if (numbersGrid) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.num-counter').forEach(el => {
          const to = parseFloat(el.dataset.to);
          const decimals = parseInt(el.dataset.decimals || '0', 10);
          animateCounter(el, to, 1500, decimals);
        });
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });
  io.observe(numbersGrid);
}

// ---------- Generic scroll-reveal ----------
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

// ---------- Package tabs + galleries ----------
document.querySelectorAll('.pkg-card').forEach(card => {
  const tabs = card.querySelectorAll('.pkg-tab');
  const dyn = card.querySelector('.pkg-dyn');
  const priceEl = card.querySelector('.pkg-price');
  const galleries = card.querySelectorAll('.pkg-gallery');
  if (!tabs.length || !dyn) return;

  // Pre-built content blocks keyed by data-tab on .pkg-content
  const contents = card.querySelectorAll('.pkg-content');
  const contentById = {};
  contents.forEach(c => { contentById[c.dataset.tab] = c.innerHTML; });

  function activate(tabId) {
    tabs.forEach(t => t.classList.toggle('is-active', t.dataset.tab === tabId));
    galleries.forEach(g => g.classList.toggle('is-active', g.dataset.tab === tabId));
    // Reset gallery to first slide whenever switching tab
    const activeGallery = card.querySelector(`.pkg-gallery[data-tab="${tabId}"]`);
    if (activeGallery) goToSlide(activeGallery, 0);

    const newHtml = contentById[tabId];
    const tabEl = card.querySelector(`.pkg-tab[data-tab="${tabId}"]`);
    const newPrice = tabEl && tabEl.dataset.price;

    dyn.classList.add('is-fading');
    if (priceEl && newPrice) priceEl.classList.add('is-fading');

    setTimeout(() => {
      if (newHtml != null) dyn.innerHTML = newHtml;
      if (priceEl && newPrice) priceEl.textContent = newPrice;
      dyn.classList.remove('is-fading');
      if (priceEl && newPrice) priceEl.classList.remove('is-fading');
    }, 200);
  }
  tabs.forEach(tab => tab.addEventListener('click', () => activate(tab.dataset.tab)));
});

// ---------- Mini-galleries (slider per tab) ----------
function goToSlide(gallery, idx) {
  const slides = gallery.querySelectorAll('.pkg-slide');
  if (!slides.length) return;
  const n = slides.length;
  const target = ((idx % n) + n) % n;
  slides.forEach((s, i) => s.classList.toggle('is-active', i === target));
  gallery.dataset.current = target;
  const dotsContainer = gallery.querySelector('.gallery-dots');
  if (dotsContainer) {
    [...dotsContainer.children].forEach((d, i) => d.classList.toggle('is-active', i === target));
  }
}

document.querySelectorAll('.pkg-galleries').forEach(group => {
  const galleries = group.querySelectorAll('.pkg-gallery');
  const dotsEl = group.querySelector('.gallery-dots');

  function rebuildDots() {
    const active = group.querySelector('.pkg-gallery.is-active');
    if (!active || !dotsEl) return;
    const slides = active.querySelectorAll('.pkg-slide');
    dotsEl.innerHTML = '';
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'gallery-dot' + (slides[i].classList.contains('is-active') ? ' is-active' : '');
      b.setAttribute('aria-label', `Slide ${i + 1}`);
      b.addEventListener('click', () => goToSlide(active, i));
      dotsEl.appendChild(b);
    });
  }
  rebuildDots();

  // Prev / Next
  group.querySelector('.gallery-nav.prev').addEventListener('click', () => {
    const active = group.querySelector('.pkg-gallery.is-active');
    if (!active) return;
    const cur = parseInt(active.dataset.current || '0', 10);
    goToSlide(active, cur - 1);
  });
  group.querySelector('.gallery-nav.next').addEventListener('click', () => {
    const active = group.querySelector('.pkg-gallery.is-active');
    if (!active) return;
    const cur = parseInt(active.dataset.current || '0', 10);
    goToSlide(active, cur + 1);
  });

  // Observe class changes on galleries to rebuild dots when tab switches
  const mo = new MutationObserver(() => rebuildDots());
  galleries.forEach(g => mo.observe(g, { attributes: true, attributeFilter: ['class'] }));
});

// ---------- Add-ons + Cars (shared total) ----------
function formatMoney(n) { return '$' + n.toLocaleString('en-US'); }
const addonTotalEl = document.getElementById('addonTotal');
function recalcAddonTotal() {
  let total = 0;
  document.querySelectorAll('.addon-btn[data-added="true"], .car-add[data-added="true"]').forEach(b => {
    total += parseInt(b.dataset.price || '0', 10);
  });
  if (addonTotalEl) addonTotalEl.textContent = formatMoney(total);
}
document.querySelectorAll('.addon-btn, .car-add').forEach(btn => {
  btn.addEventListener('click', () => {
    const added = btn.getAttribute('data-added') === 'true';
    btn.setAttribute('data-added', added ? 'false' : 'true');
    recalcAddonTotal();
  });
});

// ---------- Cars carousel (nav + dots) ----------
(function () {
  const track = document.getElementById('cars-track');
  const prev = document.getElementById('cars-prev');
  const next = document.getElementById('cars-next');
  const dotsEl = document.getElementById('cars-dots');
  if (!track) return;
  const cards = track.querySelectorAll('.car-card');
  if (!cards.length) return;

  function step() {
    return cards[0].offsetWidth + 20; // card + gap
  }
  function syncNav() {
    if (!prev || !next) return;
    const max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
  }
  if (prev) prev.addEventListener('click', () => {
    track.scrollBy({ left: -step(), behavior: 'smooth' });
  });
  if (next) next.addEventListener('click', () => {
    track.scrollBy({ left: step(), behavior: 'smooth' });
  });
  track.addEventListener('scroll', syncNav, { passive: true });
  window.addEventListener('resize', syncNav);
  syncNav();

  // Dots
  if (dotsEl) {
    cards.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'gallery-dot' + (i === 0 ? ' is-active' : '');
      b.setAttribute('aria-label', `Car ${i + 1}`);
      b.addEventListener('click', () => {
        track.scrollTo({ left: cards[i].offsetLeft - track.offsetLeft, behavior: 'smooth' });
      });
      dotsEl.appendChild(b);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio > 0.55) {
          const idx = [...cards].indexOf(e.target);
          [...dotsEl.children].forEach((d, i) => d.classList.toggle('is-active', i === idx));
        }
      });
    }, { root: track, threshold: [0.55, 0.8] });
    cards.forEach(c => io.observe(c));
  }
})();

// ---------- Lightbox (YouTube cinematic films) ----------
(function () {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const lbTag = document.getElementById('lb-tag');
  const lbTitle = document.getElementById('lb-title');
  const lbSub = document.getElementById('lb-sub');
  const lbVideo = document.getElementById('lb-video');
  const lbClose = document.getElementById('lb-close');

  function open(data) {
    if (data.tag && lbTag) lbTag.textContent = data.tag;
    if (data.title && lbTitle) lbTitle.textContent = data.title;
    if (data.sub && lbSub) lbSub.textContent = data.sub;
    lbVideo.innerHTML = '';
    if (data.ytId) {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + encodeURIComponent(data.ytId)
        + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
      iframe.title = data.title || 'Proposal film';
      iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      lbVideo.appendChild(iframe);
      lb.classList.add('is-playing');
    } else {
      lb.classList.remove('is-playing');
    }
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('is-open');
    lb.classList.remove('is-playing');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Stop playback by clearing the iframe.
    lbVideo.innerHTML = '';
  }

  function bind(el) {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      open({
        ytId: el.dataset.ytId,
        tag: el.dataset.lbTag,
        title: el.dataset.lbTitle,
        sub: el.dataset.lbSub,
      });
    });
  }
  document.querySelectorAll('.video-thumb, .watch-films-link').forEach(bind);

  lbClose.addEventListener('click', close);
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lb.classList.contains('is-open')) close();
  });
})();

// ---------- FAQ accordion ----------
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');
  if (!btn || !answer) return;
  btn.addEventListener('click', () => {
    const open = item.getAttribute('data-open') === 'true';
    if (open) {
      answer.style.maxHeight = answer.scrollHeight + 'px';
      requestAnimationFrame(() => { answer.style.maxHeight = '0px'; });
      item.setAttribute('data-open', 'false');
      btn.setAttribute('aria-expanded', 'false');
    } else {
      answer.style.maxHeight = answer.scrollHeight + 'px';
      item.setAttribute('data-open', 'true');
      btn.setAttribute('aria-expanded', 'true');
      answer.addEventListener('transitionend', function handler() {
        if (item.getAttribute('data-open') === 'true') {
          answer.style.maxHeight = 'none';
        }
        answer.removeEventListener('transitionend', handler);
      });
    }
  });
});

