const body = document.body;
let currentPlan = body.dataset.initialCurrentPlan || 'free';
const isFreePlan = () => currentPlan === 'free';
let credits = Number(body.dataset.initialCredits || 150);
let generated = false;
let isPanelVisible = false;   // tracks if right panel is shown (after first search)
const logoutUrl = body.dataset.logoutUrl || '/logout';

const planConfig = {
  free: { label: 'Free Plan', badgeClass: 'free-badge', nearbyCount: 3, hasAll: false, hasSafety: false, hasAI: false, hasTransport: false },
  plus: { label: 'Plus Plan', badgeClass: 'plus-badge', nearbyCount: 10, hasAll: true, hasSafety: true, hasAI: false, hasTransport: true },
  pro: { label: 'Pro Plan', badgeClass: 'pro-badge', nearbyCount: 99, hasAll: true, hasSafety: true, hasAI: true, hasTransport: true },
};

const mockCompetitors = [
  { name: "Jollibee Sta. Mesa", dist: "200m" }, { name: "McDonald's PUP", dist: "420m" },
  { name: "Chowking Legarda", dist: "1km" }, { name: "KFC Rotonda", dist: "1.4km" },
  { name: "Shakey's Legarda", dist: "1.6km" }, { name: "Max's Restaurant", dist: "1.9km" },
  { name: "Mang Inasal PUP", dist: "2.1km" }, { name: "Greenwich Santa Mesa", dist: "2.3km" },
  { name: "Tokyo Tokyo", dist: "2.5km" }, { name: "Goldilocks Oroquieta", dist: "2.8km" }
];

const safetyData = { "City's Criminal Index": "Low (2.1/10)", "Flood Rate": "Moderate", "Earthquake Rate": "Low-Moderate", "Tsunami Rate": "Negligible" };

function renderPanel() {
  const cfg = planConfig[currentPlan];
  const badge = document.getElementById('planBadge');
  badge.className = 'plan-badge ' + cfg.badgeClass;
  badge.textContent = cfg.label;
  document.getElementById('creditDisplay').textContent = credits;

  const ftw = document.getElementById('footTrafficWidget');
  if (cfg.hasAll) {
    ftw.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><span style="font-size:13px;font-weight:700;color:#1A2340;">High</span><span style="font-size:12px;color:#9AA4B8;">~3,200 / day</span></div><div class="traffic-bar"><div class="traffic-fill" style="width:78%"></div></div>`;
  } else {
    ftw.innerHTML = `<div class="premium-field"><span style="font-size:12px;color:#9AA4B8;font-weight:600;">Upgrade to view</span>${isFreePlan() ? '<span class="premium-icon">💎</span>' : ''}</div>`;
  }

  const nb = document.getElementById('nearbyWidget');
  if (generated) {
    const items = ["7-Eleven", "SM Hypermarket", "Mercury Drug", "Robinsons Supermarket", "Alfamart", "Ministop", "Watsons", "Family Mart", "Puregold", "National Bookstore"].slice(0, Math.min(cfg.nearbyCount, 10));
    nb.innerHTML = `<div style="background:#F4F6FA;border-radius:10px;padding:10px 14px;">${items.map(i => `<div style="font-size:13px;color:#1A2340;font-weight:600;padding:4px 0;border-bottom:1px solid #E8ECF2;">${i}</div>`).join('')}${cfg.nearbyCount < 10 ? `<div style="font-size:11px;color:#4A7CF7;font-weight:700;margin-top:8px;text-align:right;">Upgrade Plan for more.</div>` : ''}</div>`;
  } else if (!cfg.hasAll) {
    nb.innerHTML = `<div class="upgrade-gate"><p>Upgrade Plan for advanced features.</p><a href="/plans" class="btn-upgrade-small">Upgrade</a></div>`;
  } else {
    nb.innerHTML = `<div class="upgrade-gate" style="background:#EEF2FF;"><p style="color:#4A7CF7;">Click Generate to load nearby establishments.</p></div>`;
  }

  document.getElementById('transportSection').style.display = cfg.hasTransport ? 'block' : 'none';
  const cl = document.getElementById('competitorList');
  const showCount = generated ? cfg.nearbyCount : 3;
  cl.innerHTML = mockCompetitors.slice(0, Math.min(showCount, mockCompetitors.length)).map((c, i) => `<div class="competitor-item"><span class="competitor-name">${i + 1}. ${c.name}</span><span class="competitor-dist">${c.dist}</span></div>`).join('');
  if (currentPlan === 'free' || !generated) cl.innerHTML += `<div style="font-size:11px;color:#4A7CF7;font-weight:700;text-align:right;margin-top:4px;">Upgrade Plan for more.</div>`;

  const sw = document.getElementById('safetyWidget');
  if (cfg.hasSafety) {
    sw.innerHTML = Object.entries(safetyData).map(([k, v]) => `<div class="stat-row"><span class="stat-label">${k}:</span><span class="stat-value">${v}</span></div>`).join('');
  } else {
    sw.innerHTML = Object.keys(safetyData).map(k => `<div><div class="stat-label" style="margin-bottom:4px;">${k}:</div><div class="premium-field"><span style="font-size:12px;color:#9AA4B8;font-weight:600;">Upgrade to view</span>${isFreePlan() ? '<span class="premium-icon">💎</span>' : ''}</div></div>`).join('');
  }

  const aw = document.getElementById('aiWidget');
  if (cfg.hasAI) {
    aw.innerHTML = `<div class="stat-label" style="margin-bottom:6px;">Suggested Business Industry:</div><div style="background:#F4F6FA;border-radius:10px;padding:14px;font-size:13px;color:#1A2340;font-weight:600;line-height:1.6;">Based on foot traffic (3,200/day), university presence, and competitor landscape, we suggest: <strong>Fast Casual Dining</strong>, <strong>Study Cafes</strong>, or <strong>Convenience Stores</strong>.</div>`;
  } else {
    aw.innerHTML = `<div class="stat-label" style="margin-bottom:6px;">Suggested Business Industry:</div><div class="upgrade-gate"><p>Upgrade Plan for advanced features.</p><a href="/plans" class="btn-upgrade-small">Upgrade</a></div>`;
  }
}

async function handleGenerate() {
  try {
    const response = await fetch('/deduct_credits', {
      method: 'POST'
    });

    const data = await response.json();

    if (!data.success) {
      showToast(data.message);
      return;
    }

    credits = data.credits;
    generated = true;

    renderPanel();
    showToast('Report generated! 50 credits used.');
  } catch (error) {
    console.error(error);
    showToast('Something went wrong.');
  }
}

function toggleSection(sectionId, chevronId) {
  const sec = document.getElementById(sectionId);
  const chev = document.getElementById(chevronId);
  const hidden = sec.style.display === 'none';
  sec.style.display = hidden ? '' : 'none';
  chev.classList.toggle('open', hidden);
}

function showToast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.style.display = 'block'; setTimeout(() => t.style.display = 'none', 2800); }

function showInfoPanel() {
  const panel = document.getElementById('infoPanel');
  if (panel.classList.contains('hidden-panel')) {
    panel.classList.remove('hidden-panel');
    isPanelVisible = true;
    generated = false;
    renderPanel();
    handleGenerate();
  }
}

function resetToLanding() {
  const panel = document.getElementById('infoPanel');
  if (!panel.classList.contains('hidden-panel')) {
    panel.classList.add('hidden-panel');
    isPanelVisible = false;
  }
  generated = false;
  renderPanel();
}

function performSearch() {
  const inputVal = document.getElementById('addressInput').value.trim();
  if (!inputVal) return;

  addToSearchHistory(inputVal);
  renderSidebarSaves();

  if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: inputVal + ', Philippines' }, (res, status) => {
      if (status === 'OK' && res[0]) {
        const map = window.currentMapInstance;
        if (map) {
          map.setCenter(res[0].geometry.location);
          map.setZoom(17);
          if (window.currentMarker) window.currentMarker.setMap(null);
          window.currentMarker = new google.maps.Marker({ position: res[0].geometry.location, map });
        }
        const comp = res[0].address_components;
        document.getElementById('cityField').textContent = comp.find(c => c.types.includes('locality'))?.short_name || 'Manila';
        document.getElementById('barangayField').textContent = comp.find(c => c.types.includes('sublocality_level_1'))?.short_name || 'Sta. Mesa';
      }
    });
  }
  showInfoPanel();
}

function goToLandingPage() {
  resetToLanding();
  if (window.currentMapInstance) {
    const defaultLoc = { lat: 14.5997, lng: 120.9842 };
    window.currentMapInstance.setCenter(defaultLoc);
    window.currentMapInstance.setZoom(16);
    if (window.currentMarker) window.currentMarker.setMap(null);
    window.currentMarker = new google.maps.Marker({ position: defaultLoc, map: window.currentMapInstance });
  }
  document.getElementById('addressInput').value = "123 Altura Ext. 456 Sta. Mesa, Manila";
  showToast("✨ New tab — search any address to see insights.");
}

let sidebarExpanded = false;
function toggleSidebar() {
  sidebarExpanded = !sidebarExpanded;
  const sidebar = document.getElementById('sidebar');
  const topbar = document.getElementById('topbar');
  const mainContent = document.getElementById('mainContent');
  const icon = document.getElementById('toggleIcon');
  sidebar.classList.toggle('expanded', sidebarExpanded);
  topbar.classList.toggle('sidebar-open', sidebarExpanded);
  mainContent.classList.toggle('sidebar-open', sidebarExpanded);
  icon.innerHTML = sidebarExpanded ? '<path d="M15 18l-6-6 6-6"/>' : '<path d="M9 18l6-6-6-6"/>';
}

function initMap() {
  const defaultLoc = { lat: 14.5997, lng: 120.9842 };
  const map = new google.maps.Map(document.getElementById('map'), {
    center: defaultLoc, zoom: 16,
    mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
  });
  window.currentMapInstance = map;
  window.currentMarker = new google.maps.Marker({ position: defaultLoc, map, title: '123 Altura Ext.' });

  const inputElem = document.getElementById('addressInput');
  inputElem.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  });
}

window.initMap = initMap;
window.handleGenerate = handleGenerate;
window.toggleSection = toggleSection;
window.toggleSidebar = toggleSidebar;

function openUserModal() {
  const modalEl = document.getElementById('userProfileModal');
  const avatarRow = document.querySelector('.sidebar-avatar-row');
  if (!modalEl || !avatarRow) return;

  const bsModal = new bootstrap.Modal(modalEl, { backdrop: false, keyboard: true });
  bsModal.show();

  requestAnimationFrame(() => {
    const dialog = modalEl.querySelector('.modal-dialog');
    if (!dialog) return;

    dialog.style.position = 'absolute';
    dialog.style.transform = 'none';
    dialog.style.right = 'auto';

    const sidebar = document.getElementById('sidebar');
    const gap = 8;
    const avatarTop = avatarRow.offsetTop;
    const avatarHeight = avatarRow.offsetHeight;

    const dialogHeight = dialog.getBoundingClientRect().height || dialog.offsetHeight;
    let top = avatarTop - dialogHeight - gap;
    if (top < 8) top = avatarTop + avatarHeight + gap;

    dialog.style.left = '8px';
    dialog.style.top = top + 'px';
    dialog.style.zIndex = 1200;
    dialog.style.maxWidth = (sidebar.clientWidth - 16) + 'px';

    if (modalEl._outsideClickHandler) {
      document.removeEventListener('mousedown', modalEl._outsideClickHandler, true);
    }
    modalEl._outsideClickHandler = function outsideClick(e) {
      const modalContent = modalEl.querySelector('.modal-content');
      if (!modalContent.contains(e.target) && !avatarRow.contains(e.target)) {
        bsModal.hide();
      }
    };
    setTimeout(() => document.addEventListener('mousedown', modalEl._outsideClickHandler, true), 0);

    modalEl.addEventListener('hidden.bs.modal', () => {
      if (modalEl._outsideClickHandler) {
        document.removeEventListener('mousedown', modalEl._outsideClickHandler, true);
        modalEl._outsideClickHandler = null;
      }
    }, { once: true });
  });

  modalEl.bsInstance = bsModal;
}

function logoutUser() {
  window.location.href = logoutUrl;
}

window.openUserModal = openUserModal;
window.logoutUser = logoutUser;

document.getElementById('newTabBtn').addEventListener('click', () => goToLandingPage());

resetToLanding();
renderPanel();

window.historyData = window.historyData || [];

function renderSidebarSaves() {
  const saveItems = document.getElementById('saveItems');
  if (!saveItems) return;
  const saves = window.historyData.slice(0, 4);

  if (saves.length === 0) {
    saveItems.innerHTML = `<div class="save-item">No saves yet</div>`;
    return;
  }

  saveItems.innerHTML = saves.map(item => `
      <button type="button" class="save-item save-button" onclick="loadSavedAddress(${item.id})" title="Load ${item.address}">
        ${item.address}
      </button>
    `).join('');
}

function addToSearchHistory(address) {
  if (!address) return;
  window.historyData = window.historyData || [];

  window.historyData = window.historyData.filter(item => item.address !== address);

  window.historyData.unshift({
    id: window.historyData.length + 1,
    address: address,
    timestamp: new Date(),
    favorited: false
  });

  window.historyData = window.historyData.slice(0, 50);
  renderSidebarSaves();
}

function loadSavedAddress(id) {
  const item = window.historyData.find(h => h.id === id);
  if (!item) return;
  const addressInput = document.getElementById('addressInput');
  if (!addressInput) return;

  addressInput.value = item.address;
  updateFavoriteBtnState();
  performSearch();
}

window.addToSearchHistory = addToSearchHistory;
window.loadSavedAddress = loadSavedAddress;

function toggleAddressFavorite() {
  const addressInput = document.getElementById('addressInput');
  const currentAddress = addressInput.value.trim();

  if (!currentAddress) {
    showToast('Please enter an address first');
    return;
  }

  if (!window.historyData) {
    window.historyData = [];
  }

  let item = window.historyData.find(h => h.address === currentAddress);

  if (item) {
    item.favorited = !item.favorited;
  } else {
    item = {
      id: window.historyData.length + 1,
      address: currentAddress,
      timestamp: new Date(),
      favorited: true
    };
    window.historyData.unshift(item);
  }

  updateFavoriteBtnState();
  showToast(item.favorited ? '❤️ Added to favorites!' : '💔 Removed from favorites');
}

function updateFavoriteBtnState() {
  const addressInput = document.getElementById('addressInput');
  const favoriteBtn = document.getElementById('favoriteBtn');
  const currentAddress = addressInput.value.trim();

  if (!currentAddress || !window.historyData) {
    favoriteBtn.classList.remove('favorited');
    return;
  }

  const item = window.historyData.find(h => h.address === currentAddress);
  if (item && item.favorited) {
    favoriteBtn.classList.add('favorited');
  } else {
    favoriteBtn.classList.remove('favorited');
  }
}

window.toggleAddressFavorite = toggleAddressFavorite;
window.updateFavoriteBtnState = updateFavoriteBtnState;

document.getElementById('addressInput').addEventListener('input', updateFavoriteBtnState);
document.getElementById('addressInput').addEventListener('change', updateFavoriteBtnState);

renderSidebarSaves();
updateFavoriteBtnState();

(function () {
  const s = document.createElement('script');
  s.src = 'https://maps.googleapis.com/maps/api/js?callback=initMap';
  s.async = true; s.defer = true;
  s.onerror = function () {
    document.getElementById('map').innerHTML = `<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=120.972%2C14.592%2C120.996%2C14.608&layer=mapnik&marker=14.5997%2C120.9842" style="width:100%;height:100%;border:none;border-radius:16px;" allowfullscreen></iframe>`;
  };
  document.head.appendChild(s);
})();
