// ===== DATA =====
const images = [
  { src: 'images/Mountain Sunrise.jpg', thumb: 'images/Mountain Sunrise-thumb.jpg', title: 'Mountain Sunrise', cat: 'nature' },
  { src: 'images/Modern Tower.jpg', thumb: 'images/Modern Tower-thumb.jpg', title: 'Modern Tower', cat: 'architecture' },
  { src: 'images/Desert Waves.jpg', thumb: 'images/Desert Waves-thumb.jpg', title: 'Desert Waves', cat: 'abstract' },
  { src: 'images/Forest Path.jpg', thumb: 'images/Forest Path-thumb.jpg', title: 'Forest Path', cat: 'nature' },
  { src: 'images/London Bridge.jpg', thumb: 'images/London Bridge-thumb.jpg', title: 'London Bridge', cat: 'travel' },
  { src: 'images/Tropical Waters.jpg', thumb: 'images/Tropical Waters-thumb.jpg', title: 'Tropical Waters', cat: 'travel' },
  { src: 'images/Winter Lake.jpg', thumb: 'images/Winter Lake-thumb.jpg', title: 'Winter Lake', cat: 'nature' },
  { src: 'images/Glass Facade.jpg', thumb: 'images/Glass Facade-thumb.jpg', title: 'Glass Facade', cat: 'architecture' },
  { src: 'images/Neon Abstract.jpg', thumb: 'images/Neon Abstract-thumb.jpg', title: 'Neon Abstract', cat: 'abstract' },
  { src: 'images/Sunset Valley.jpg', thumb: 'images/Sunset Valley-thumb.jpg', title: 'Sunset Valley', cat: 'nature' },
  { src: 'images/City Skyline.jpg', thumb: 'images/City Skyline-thumb.jpg', title: 'City Skyline', cat: 'architecture' },
  { src: 'images/Tokyo Nights.jpg', thumb: 'images/Tokyo Nights-thumb.jpg', title: 'Tokyo Nights', cat: 'travel' },
];

const catConfig = {
  all:          { label: 'All',          color: '#a78bfa', emoji: '✦' },
  nature:       { label: 'Nature',       color: '#34d399', emoji: '🌿' },
  architecture: { label: 'Architecture', color: '#60a5fa', emoji: '🏛' },
  abstract:     { label: 'Abstract',     color: '#f59e0b', emoji: '🎨' },
  travel:       { label: 'Travel',       color: '#f472b6', emoji: '✈' },
};

// ===== STATE =====
let currentFilter = 'all';
let currentSort = 'default';
let searchQuery = '';
let likedSet = new Set();
let lbIndex = 0;
let lbVisible = [];

// ===== UTILS =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function getVisible() {
  let list = images.map((img, i) => ({ ...img, _i: i }));
  if (currentFilter !== 'all') list = list.filter(img => img.cat === currentFilter);
  if (searchQuery) list = list.filter(img => img.title.toLowerCase().includes(searchQuery) || img.cat.includes(searchQuery));
  if (currentSort === 'name') list.sort((a, b) => a.title.localeCompare(b.title));
  if (currentSort === 'cat') list.sort((a, b) => a.cat.localeCompare(b.cat));
  return list;
}

// ===== FILTER BAR =====
function buildFilterBar() {
  const bar = document.getElementById('filterBar');
  const cats = ['all', ...Object.keys(catConfig).filter(k => k !== 'all')];
  bar.innerHTML = '';
  cats.forEach(cat => {
    const cfg = catConfig[cat];
    const count = cat === 'all' ? images.length : images.filter(i => i.cat === cat).length;
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (cat === currentFilter ? ' active' : '');
    btn.dataset.filter = cat;
    btn.innerHTML = `<span class="cat-dot" style="background:${cfg.color}"></span>${cfg.emoji} ${cfg.label}<span class="count">${count}</span>`;
    btn.addEventListener('click', () => {
      currentFilter = cat;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGallery();
    });
    bar.appendChild(btn);
  });
}

// ===== GALLERY RENDER =====
function renderGallery() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';

  const visible = getVisible();
  document.getElementById('visibleCount').textContent = visible.length;
  document.getElementById('totalCountB').textContent = images.length;

  if (visible.length === 0) {
    gallery.innerHTML = `<div class="empty-state" style="display:block">
      <div class="icon">🔍</div>
      <h3>No photos found</h3>
      <p>Try a different filter or search term</p>
    </div>`;
    return;
  }

  visible.forEach((img) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.dataset.originalIndex = img._i;

    const catColor = catConfig[img.cat]?.color || '#a78bfa';
    const catEmoji = catConfig[img.cat]?.emoji || '';
    const isLiked = likedSet.has(img._i);
    const likeCount = isLiked ? '1 like' : '';

    item.innerHTML = `
      <div class="cat-strip" style="background: linear-gradient(90deg, ${catColor}, transparent)"></div>
      <img data-src="${img.src}" alt="${img.title}">
      <div class="overlay">
        <div class="overlay-actions">
          <div class="action-icon fav-btn ${isLiked ? 'liked' : ''}" data-idx="${img._i}" title="Like">
            ${isLiked ? '❤️' : '🤍'}
          </div>
          <div class="action-icon zoom-icon" title="View full size">🔍</div>
        </div>
        <div class="like-badge" id="like-${img._i}">${likeCount}</div>
        <h3>${img.title}</h3>
        <div class="cat-tag" style="color:${catColor}">${catEmoji} ${img.cat}</div>
      </div>`;

    // Lazy load
    const imgEl = item.querySelector('img');
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          imgEl.src = imgEl.dataset.src;
          imgEl.onload = () => imgEl.classList.add('loaded');
          obs.unobserve(imgEl);
        }
      });
    }, { rootMargin: '100px' });
    observer.observe(imgEl);

    // Like button
    item.querySelector('.fav-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const i = parseInt(e.currentTarget.dataset.idx);
      if (likedSet.has(i)) { likedSet.delete(i); showToast('Removed from likes'); }
      else { likedSet.add(i); showToast('Added to likes ❤️'); }
      document.getElementById('likedCount').textContent = likedSet.size;
      renderGallery();
    });

    // Open lightbox
    item.addEventListener('click', (e) => {
      if (e.target.closest('.fav-btn')) return;
      lbVisible = getVisible();
      const clickedOrigIdx = parseInt(item.dataset.originalIndex);
      lbIndex = lbVisible.findIndex(v => v._i === clickedOrigIdx);
      openLightbox();
    });

    gallery.appendChild(item);
  });
}

// ===== LIGHTBOX =====
const lightbox = document.getElementById('lightbox');

function openLightbox() {
  updateLightbox();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
  buildThumbstrip();
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function updateLightbox() {
  const img = lbVisible[lbIndex];
  const lbImg = document.getElementById('lbImg');
  lbImg.style.opacity = '0';
  lbImg.src = img.src;
  lbImg.onload = () => { lbImg.style.opacity = '1'; lbImg.style.transition = 'opacity 0.3s'; };
  document.getElementById('lbTitle').textContent = img.title;
  document.getElementById('lbCounter').textContent = `${lbIndex + 1} / ${lbVisible.length}`;
  document.getElementById('lbIdxLabel').textContent = `Photo ${lbIndex + 1} of ${lbVisible.length}`;

  const catCfg = catConfig[img.cat];
  document.getElementById('lbCatBadge').innerHTML = `${catCfg.emoji} ${img.cat}`;
  document.getElementById('lbCatBadge').style.color = catCfg.color;

  const isLiked = likedSet.has(img._i);
  document.getElementById('lbFavBtn').textContent = isLiked ? '❤️' : '🤍';

  // Update active thumb
  document.querySelectorAll('.lb-thumb').forEach((t, i) => t.classList.toggle('active', i === lbIndex));
  const activeThumb = document.querySelector('.lb-thumb.active');
  if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function buildThumbstrip() {
  const strip = document.getElementById('lbThumbstrip');
  strip.innerHTML = '';
  lbVisible.forEach((img, i) => {
    const thumb = document.createElement('img');
    thumb.className = 'lb-thumb' + (i === lbIndex ? ' active' : '');
    thumb.src = img.thumb || img.src;
    thumb.addEventListener('click', () => { lbIndex = i; updateLightbox(); });
    strip.appendChild(thumb);
  });
}

function lbNext() { lbIndex = (lbIndex + 1) % lbVisible.length; updateLightbox(); }
function lbPrev() { lbIndex = (lbIndex - 1 + lbVisible.length) % lbVisible.length; updateLightbox(); }

document.getElementById('lbClose').onclick = closeLightbox;
document.getElementById('lbPrev').onclick = lbPrev;
document.getElementById('lbNext').onclick = lbNext;

document.getElementById('lbFavBtn').addEventListener('click', () => {
  const img = lbVisible[lbIndex];
  if (likedSet.has(img._i)) { likedSet.delete(img._i); showToast('Removed from likes'); }
  else { likedSet.add(img._i); showToast('Added to likes ❤️'); }
  document.getElementById('likedCount').textContent = likedSet.size;
  document.getElementById('lbFavBtn').textContent = likedSet.has(img._i) ? '❤️' : '🤍';
  renderGallery();
});

document.getElementById('lbShareBtn').addEventListener('click', () => {
  navigator.clipboard?.writeText(lbVisible[lbIndex].src).then(() => showToast('Image link copied! 🔗'));
});

lightbox.addEventListener('click', e => {
  if (e.target === lightbox || e.target.id === 'lbInner') closeLightbox();
});

// ===== KEYBOARD =====
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lbPrev();
  if (e.key === 'ArrowRight') lbNext();
});

// ===== SWIPE (mobile) =====
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) dx < 0 ? lbNext() : lbPrev();
});

// ===== SEARCH =====
document.getElementById('searchInput').addEventListener('input', e => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderGallery();
});

// ===== SORT =====
document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSort = btn.dataset.sort;
    renderGallery();
  });
});

// ===== VIEW TOGGLE =====
document.getElementById('gridViewBtn').addEventListener('click', () => {
  document.getElementById('gallery').classList.remove('list-view');
  document.getElementById('gridViewBtn').classList.add('active');
  document.getElementById('listViewBtn').classList.remove('active');
});

document.getElementById('listViewBtn').addEventListener('click', () => {
  document.getElementById('gallery').classList.add('list-view');
  document.getElementById('listViewBtn').classList.add('active');
  document.getElementById('gridViewBtn').classList.remove('active');
});

// ===== INIT =====
buildFilterBar();
renderGallery();