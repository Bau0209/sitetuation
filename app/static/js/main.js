// ================== LANDING PAGE & PANEL LOGIC ===================
let currentPlan = 'free';
let credits = 150;
let generated = false;
let isPanelVisible = false;   // tracks if right panel is shown (after first search)

const planConfig = {
  free: { label: 'Free Plan',  badgeClass: 'free-badge',  nearbyCount: 3,  hasAll: false, hasSafety: false, hasAI: false, hasTransport: false },
  plus: { label: 'Plus Plan',  badgeClass: 'plus-badge',  nearbyCount: 10, hasAll: true,  hasSafety: true,  hasAI: false, hasTransport: true  },
  pro:  { label: 'Pro Plan',   badgeClass: 'pro-badge',   nearbyCount: 99, hasAll: true,  hasSafety: true,  hasAI: true,  hasTransport: true  },
};

const mockCompetitors = [
  { name: "Jollibee Sta. Mesa",   dist: "200m"  }, { name: "McDonald's PUP",       dist: "420m"  },
  { name: "Chowking Legarda",     dist: "1km"   }, { name: "KFC Rotonda",          dist: "1.4km" },
  { name: "Shakey's Legarda",     dist: "1.6km" }, { name: "Max's Restaurant",     dist: "1.9km" },
  { name: "Mang Inasal PUP",      dist: "2.1km" }, { name: "Greenwich Santa Mesa", dist: "2.3km" },
  { name: "Tokyo Tokyo",          dist: "2.5km" }, { name: "Goldilocks Oroquieta", dist: "2.8km" }
];

const safetyData = { "City's Criminal Index": "Low (2.1/10)", "Flood Rate": "Moderate", "Earthquake Rate": "Low-Moderate", "Tsunami Rate": "Negligible" };

function renderPanel() {
  const cfg = planConfig[currentPlan];
  const badge = document.getElementById('planBadge');
  badge.className = 'plan-badge ' + cfg.badgeClass;
  badge.textContent = cfg.label;
  document.getElementById('creditDisplay').textContent = credits;

  const ftw = document.getElementById('footTrafficWidget');
  if (cfg.hasAll) { ftw.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><span style="font-size:13px;font-weight:700;color:#1A2340;">High</span><span style="font-size:12px;color:#9AA4B8;">~3,200 / day</span></div><div class="traffic-bar"><div class="traffic-fill" style="width:78%"></div></div>`; } 
  else { ftw.innerHTML = `<div class="premium-field"><span style="font-size:12px;color:#9AA4B8;font-weight:600;">Upgrade to view</span><span class="premium-icon">💎</span></div>`; }

  const nb = document.getElementById('nearbyWidget');
  if (generated) {
    const items = ["7-Eleven","SM Hypermarket","Mercury Drug","Robinsons Supermarket","Alfamart","Ministop","Watsons","Family Mart","Puregold","National Bookstore"].slice(0, Math.min(cfg.nearbyCount, 10));
    nb.innerHTML = `<div style="background:#F4F6FA;border-radius:10px;padding:10px 14px;">${items.map(i=>`<div style="font-size:13px;color:#1A2340;font-weight:600;padding:4px 0;border-bottom:1px solid #E8ECF2;">${i}</div>`).join('')}${cfg.nearbyCount < 10 ? `<div style="font-size:11px;color:#4A7CF7;font-weight:700;margin-top:8px;text-align:right;">Upgrade Plan for more.</div>` : ''}</div>`;
  } else if (!cfg.hasAll) { nb.innerHTML = `<div class="upgrade-gate"><p>Upgrade Plan for advanced features.</p><a href="/plans" class="btn-upgrade-small">Upgrade</a></div>`; } 
  else { nb.innerHTML = `<div class="upgrade-gate" style="background:#EEF2FF;"><p style="color:#4A7CF7;">Click Generate to load nearby establishments.</p></div>`; }

  document.getElementById('transportSection').style.display = cfg.hasTransport ? 'block' : 'none';
  const cl = document.getElementById('competitorList');
  const showCount = generated ? cfg.nearbyCount : 3;
  cl.innerHTML = mockCompetitors.slice(0, Math.min(showCount, mockCompetitors.length)).map((c,i) => `<div class="competitor-item"><span class="competitor-name">${i+1}. ${c.name}</span><span class="competitor-dist">${c.dist}</span></div>`).join('');
  if (currentPlan === 'free' || !generated) cl.innerHTML += `<div style="font-size:11px;color:#4A7CF7;font-weight:700;text-align:right;margin-top:4px;">Upgrade Plan for more.</div>`;

  const sw = document.getElementById('safetyWidget');
  if (cfg.hasSafety) sw.innerHTML = Object.entries(safetyData).map(([k,v]) => `<div class="stat-row"><span class="stat-label">${k}:</span><span class="stat-value">${v}</span></div>`).join('');
  else sw.innerHTML = Object.keys(safetyData).map(k => `<div><div class="stat-label" style="margin-bottom:4px;">${k}:</div><div class="premium-field"><span style="font-size:12px;color:#9AA4B8;font-weight:600;">Upgrade to view</span><span class="premium-icon">💎</span></div></div>`).join('');

  const aw = document.getElementById('aiWidget');
  if (cfg.hasAI) aw.innerHTML = `<div class="stat-label" style="margin-bottom:6px;">Suggested Business Industry:</div><div style="background:#F4F6FA;border-radius:10px;padding:14px;font-size:13px;color:#1A2340;font-weight:600;line-height:1.6;">Based on foot traffic (3,200/day), university presence, and competitor landscape, we suggest: <strong>Fast Casual Dining</strong>, <strong>Study Cafes</strong>, or <strong>Convenience Stores</strong>.</div>`;
  else aw.innerHTML = `<div class="stat-label" style="margin-bottom:6px;">Suggested Business Industry:</div><div class="upgrade-gate"><p>Upgrade Plan for advanced features.</p><a href="/plans" class="btn-upgrade-small">Upgrade</a></div>`;
}

function handleGenerate() {
  if (credits < 50) { showToast('Insufficient credits!'); return; }
  credits -= 50;
  generated = true;
  renderPanel();
  showToast('Report generated! 50 credits used.');
}

function toggleSection(sectionId, chevronId) {
  const sec = document.getElementById(sectionId);
  const chev = document.getElementById(chevronId);
  const hidden = sec.style.display === 'none';
  sec.style.display = hidden ? '' : 'none';
  chev.classList.toggle('open', hidden);
}

function showToast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.style.display = 'block'; setTimeout(() => t.style.display = 'none', 2800); }

// ---- SHOW RIGHT PANEL (after search) ----
function showInfoPanel() {
  const panel = document.getElementById('infoPanel');
  if (panel.classList.contains('hidden-panel')) {
    panel.classList.remove('hidden-panel');
    isPanelVisible = true;
    // Ensure first render after search
    generated = false;   // reset generated state for fresh location report
    renderPanel();       // load default free plan UI with info
  }
}

// reset to landing (panel hidden)
function resetToLanding() {
  const panel = document.getElementById('infoPanel');
  if (!panel.classList.contains('hidden-panel')) {
    panel.classList.add('hidden-panel');
    isPanelVisible = false;
  }
  generated = false;
  renderPanel(); // sync UI but panel remains hidden (credits etc preserved)
}

// search action: geocode + update map + SHOW panel
function performSearch() {
  const inputVal = document.getElementById('addressInput').value.trim();
  if (!inputVal) return;
  if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: inputVal + ', Philippines' }, (res, status) => {
    });
  }
  // show the analysis panel
  showInfoPanel();
}

// ----- New Tab: go back to landing (panel hidden, map centered at default dummy)
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
      performSearch();
    }
  });
}
window.initMap = initMap;
window.handleGenerate = handleGenerate;
window.toggleSection = toggleSection;
window.toggleSidebar = toggleSidebar;

// new tab button behavior
document.getElementById('newTabBtn').addEventListener('click', () => goToLandingPage());

// initial state: landing (panel hidden)
resetToLanding();
renderPanel();  // preload UI data for later

// Load Google Maps API
(function() {
  const s = document.createElement('script');
  s.src = 'https://maps.googleapis.com/maps/api/js?callback=initMap';
  s.async = true; s.defer = true;
  s.onerror = function() {
    document.getElementById('map').innerHTML = `<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=120.972%2C14.592%2C120.996%2C14.608&layer=mapnik&marker=14.5997%2C120.9842" style="width:100%;height:100%;border:none;border-radius:16px;" allowfullscreen></iframe>`;
  };
  document.head.appendChild(s);
})();
const taglineInput = document.getElementById('taglineInput');
const primaryColorPicker = document.getElementById('primaryColor');
const secondaryColorPicker = document.getElementById('secondaryColor');
const primaryHexSpan = document.getElementById('primaryHex');
const secondaryHexSpan = document.getElementById('secondaryHex');
const textScaleSlider = document.getElementById('textScale');
const bgStyleSelect = document.getElementById('bgStyle');
const logoTypeRadios = document.querySelectorAll('input[name="logoType"]');
const liveContainer = document.getElementById('liveLogoContainer');
const embedCodePre = document.getElementById('embedCode');
const copyBtn = document.getElementById('copyBtn');
const downloadSvgBtn = document.getElementById('downloadSvgBtn');
const downloadPngBtn = document.getElementById('downloadPngBtn');
const toastMsgDiv = document.getElementById('toastMessage');

let currentLogoType = 'smartIcon';

function showToast(text) {
  toastMsgDiv.textContent = text || '✅ Copied to clipboard!';
  toastMsgDiv.style.opacity = '1';
  setTimeout(() => {
    toastMsgDiv.style.opacity = '0';
  }, 2000);
}

primaryColorPicker.addEventListener('input', () => {
  primaryHexSpan.innerText = primaryColorPicker.value;
  updateLogo();
});
secondaryColorPicker.addEventListener('input', () => {
  secondaryHexSpan.innerText = secondaryColorPicker.value;
  updateLogo();
});
brandInput.addEventListener('input', updateLogo);
taglineInput.addEventListener('input', updateLogo);
textScaleSlider.addEventListener('input', updateLogo);
bgStyleSelect.addEventListener('change', updateLogo);
logoTypeRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    if (e.target.checked) currentLogoType = e.target.value;
    updateLogo();
  });
});

function renderLogoElement() {
  const brand = brandInput.value.trim() || 'siteTuation';
  const tagline = taglineInput.value.trim() || 'Turning Locations into Smart Decisions.';
  const primary = primaryColorPicker.value;
  const secondary = secondaryColorPicker.value;
  const scaleVal = parseFloat(textScaleSlider.value);
  const bgStyle = bgStyleSelect.value;

  const containerDiv = document.createElement('div');
  containerDiv.style.display = 'flex';
  containerDiv.style.flexDirection = 'column';
  containerDiv.style.alignItems = 'center';
  containerDiv.style.justifyContent = 'center';
  containerDiv.style.width = '100%';
  containerDiv.style.transition = 'all 0.2s';

  if (bgStyle === 'soft') {
    containerDiv.style.background = `linear-gradient(135deg, ${primary}08, ${secondary}08)`;
    containerDiv.style.borderRadius = '32px';
    containerDiv.style.padding = '20px 24px';
  } else if (bgStyle === 'card') {
    containerDiv.style.background = '#FFFFFF';
    containerDiv.style.borderRadius = '36px';
    containerDiv.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02)';
    containerDiv.style.padding = '20px 24px';
  } else {
    containerDiv.style.background = 'transparent';
    containerDiv.style.padding = '0';
  }

  const svgNS = 'http://www.w3.org/2000/svg';
  const svgIcon = document.createElementNS(svgNS, 'svg');
  svgIcon.setAttribute('width', '64');
  svgIcon.setAttribute('height', '64');
  svgIcon.setAttribute('viewBox', '0 0 64 64');
  svgIcon.setAttribute('fill', 'none');
  svgIcon.style.marginBottom = '12px';

  if (currentLogoType === 'smartIcon') {
    const grad1 = document.createElementNS(svgNS, 'linearGradient');
    grad1.setAttribute('id', 'gradSmart');
    grad1.setAttribute('x1', '10%');
    grad1.setAttribute('y1', '10%');
    grad1.setAttribute('x2', '90%');
    grad1.setAttribute('y2', '90%');
    const stop1 = document.createElementNS(svgNS, 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', primary);
    const stop2 = document.createElementNS(svgNS, 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', secondary);
    grad1.appendChild(stop1);
    grad1.appendChild(stop2);
    svgIcon.appendChild(grad1);

    const rect1 = document.createElementNS(svgNS, 'rect');
    rect1.setAttribute('x', '14');
    rect1.setAttribute('y', '32');
    rect1.setAttribute('width', '8');
    rect1.setAttribute('height', '20');
    rect1.setAttribute('rx', '3');
    rect1.setAttribute('fill', primary);

    const rect2 = document.createElementNS(svgNS, 'rect');
    rect2.setAttribute('x', '28');
    rect2.setAttribute('y', '22');
    rect2.setAttribute('width', '8');
    rect2.setAttribute('height', '30');
    rect2.setAttribute('rx', '3');
    rect2.setAttribute('fill', secondary);

    const rect3 = document.createElementNS(svgNS, 'rect');
    rect3.setAttribute('x', '42');
    rect3.setAttribute('y', '12');
    rect3.setAttribute('width', '8');
    rect3.setAttribute('height', '40');
    rect3.setAttribute('rx', '3');
    rect3.setAttribute('fill', 'url(#gradSmart)');

    const polyline = document.createElementNS(svgNS, 'polyline');
    polyline.setAttribute('points', '18,54 32,38 46,24 52,30');
    polyline.setAttribute('stroke', secondary);
    polyline.setAttribute('stroke-width', '2.5');
    polyline.setAttribute('stroke-linecap', 'round');
    polyline.setAttribute('stroke-linejoin', 'round');
    polyline.setAttribute('fill', 'none');

    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', '52');
    circle.setAttribute('cy', '30');
    circle.setAttribute('r', '3');
    circle.setAttribute('fill', primary);

    svgIcon.appendChild(rect1);
    svgIcon.appendChild(rect2);
    svgIcon.appendChild(rect3);
    svgIcon.appendChild(polyline);
    svgIcon.appendChild(circle);
  } else if (currentLogoType === 'locationPin') {
    const gradPin = document.createElementNS(svgNS, 'linearGradient');
    gradPin.setAttribute('id', 'pinGrad');
    gradPin.setAttribute('x1', '0');
    gradPin.setAttribute('y1', '0');
    gradPin.setAttribute('x2', '64');
    gradPin.setAttribute('y2', '64');
    const s1 = document.createElementNS(svgNS, 'stop');
    s1.setAttribute('offset', '0%');
    s1.setAttribute('stop-color', primary);
    const s2 = document.createElementNS(svgNS, 'stop');
    s2.setAttribute('offset', '100%');
    s2.setAttribute('stop-color', secondary);
    gradPin.appendChild(s1);
    gradPin.appendChild(s2);
    svgIcon.appendChild(gradPin);

    const pathPin = document.createElementNS(svgNS, 'path');
    pathPin.setAttribute('d', 'M32 8C22.058 8 14 16.058 14 26c0 12 10 18 18 30 8-12 18-18 18-30 0-9.942-8.058-18-18-18z');
    pathPin.setAttribute('fill', 'url(#pinGrad)');
    pathPin.setAttribute('stroke', 'white');
    pathPin.setAttribute('stroke-width', '2');
    const innerCircle = document.createElementNS(svgNS, 'circle');
    innerCircle.setAttribute('cx', '32');
    innerCircle.setAttribute('cy', '26');
    innerCircle.setAttribute('r', '6');
    innerCircle.setAttribute('fill', 'white');
    svgIcon.appendChild(pathPin);
    svgIcon.appendChild(innerCircle);
  } else {
    const gradSpark = document.createElementNS(svgNS, 'linearGradient');
    gradSpark.setAttribute('id', 'sparkGrad');
    gradSpark.setAttribute('x1', '20%');
    gradSpark.setAttribute('y1', '10%');
    gradSpark.setAttribute('x2', '80%');
    gradSpark.setAttribute('y2', '90%');
    const st1 = document.createElementNS(svgNS, 'stop');
    st1.setAttribute('offset', '0%');
    st1.setAttribute('stop-color', primary);
    const st2 = document.createElementNS(svgNS, 'stop');
    st2.setAttribute('offset', '100%');
    st2.setAttribute('stop-color', secondary);
    gradSpark.appendChild(st1);
    gradSpark.appendChild(st2);
    svgIcon.appendChild(gradSpark);

    const polygon = document.createElementNS(svgNS, 'polygon');
    polygon.setAttribute('points', '32,8 52,28 32,56 12,28');
    polygon.setAttribute('fill', 'url(#sparkGrad)');
    polygon.setAttribute('stroke', 'white');
    polygon.setAttribute('stroke-width', '1.5');

    const line1 = document.createElementNS(svgNS, 'line');
    line1.setAttribute('x1', '32');
    line1.setAttribute('y1', '18');
    line1.setAttribute('x2', '32');
    line1.setAttribute('y2', '28');
    line1.setAttribute('stroke', 'white');
    line1.setAttribute('stroke-width', '2');
    line1.setAttribute('stroke-linecap', 'round');

    const line2 = document.createElementNS(svgNS, 'line');
    line2.setAttribute('x1', '32');
    line2.setAttribute('y1', '36');
    line2.setAttribute('x2', '32');
    line2.setAttribute('y2', '44');
    line2.setAttribute('stroke', 'white');
    line2.setAttribute('stroke-width', '2');
    line2.setAttribute('stroke-linecap', 'round');

    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('cx', '32');
    dot.setAttribute('cy', '32');
    dot.setAttribute('r', '2.5');
    dot.setAttribute('fill', 'white');

    svgIcon.appendChild(polygon);
    svgIcon.appendChild(line1);
    svgIcon.appendChild(line2);
    svgIcon.appendChild(dot);
  }

  const brandSpan = document.createElement('div');
  brandSpan.className = 'brand-text';
  brandSpan.innerText = brand;
  brandSpan.style.fontSize = `${28 * scaleVal}px`;
  brandSpan.style.fontWeight = '800';
  brandSpan.style.fontFamily = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
  brandSpan.style.letterSpacing = '-0.02em';
  brandSpan.style.background = `linear-gradient(135deg, ${primary}, ${secondary})`;
  brandSpan.style.backgroundClip = 'text';
  brandSpan.style.webkitBackgroundClip = 'text';
  brandSpan.style.color = 'transparent';
  brandSpan.style.marginBottom = '6px';
  brandSpan.style.textAlign = 'center';

  const taglineSpan = document.createElement('div');
  taglineSpan.className = 'tagline-text';
  taglineSpan.innerText = tagline;
  taglineSpan.style.fontSize = `${11 * Math.min(1.4, scaleVal)}px`;
  taglineSpan.style.fontWeight = '500';
  taglineSpan.style.fontFamily = "'Inter', sans-serif";
  taglineSpan.style.color = '#4B5563';
  taglineSpan.style.opacity = '0.8';
  taglineSpan.style.textAlign = 'center';
  taglineSpan.style.maxWidth = '280px';
  taglineSpan.style.marginTop = '2px';

  containerDiv.appendChild(svgIcon);
  containerDiv.appendChild(brandSpan);
  containerDiv.appendChild(taglineSpan);

  return containerDiv;
}

function updateLogo() {
  while (liveContainer.firstChild) {
    liveContainer.removeChild(liveContainer.firstChild);
  }
  const freshLogo = renderLogoElement();
  liveContainer.appendChild(freshLogo);
  generateEmbedCode();
}

function generateEmbedCode() {
  const brand = brandInput.value.trim() || 'siteTuation';
  const tagline = taglineInput.value.trim() || 'Turning Locations into Smart Decisions.';
  const primary = primaryColorPicker.value;
  const secondary = secondaryColorPicker.value;
  const scaleVal = parseFloat(textScaleSlider.value);
  const bgStyle = bgStyleSelect.value;
  const logoType = currentLogoType;

  let svgString = '';
  if (logoType === 'smartIcon') {
    svgString = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">\n  <defs>\n    <linearGradient id="gradSmart" x1="10%" y1="10%" x2="90%" y2="90%">\n      <stop offset="0%" stop-color="${primary}"/>\n      <stop offset="100%" stop-color="${secondary}"/>\n    </linearGradient>\n  </defs>\n  <rect x="14" y="32" width="8" height="20" rx="3" fill="${primary}"/>\n  <rect x="28" y="22" width="8" height="30" rx="3" fill="${secondary}"/>\n  <rect x="42" y="12" width="8" height="40" rx="3" fill="url(#gradSmart)"/>\n  <polyline points="18,54 32,38 46,24 52,30" stroke="${secondary}" stroke-width="2.5" fill="none" stroke-linecap="round"/>\n  <circle cx="52" cy="30" r="3" fill="${primary}"/>\n</svg>`;
  } else if (logoType === 'locationPin') {
    svgString = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">\n  <defs>\n    <linearGradient id="pinGrad" x1="0" y1="0" x2="64" y2="64">\n      <stop offset="0%" stop-color="${primary}"/>\n      <stop offset="100%" stop-color="${secondary}"/>\n    </linearGradient>\n  </defs>\n  <path d="M32 8C22.058 8 14 16.058 14 26c0 12 10 18 18 30 8-12 18-18 18-30 0-9.942-8.058-18-18-18z" fill="url(#pinGrad)" stroke="white" stroke-width="2"/>\n  <circle cx="32" cy="26" r="6" fill="white"/>\n</svg>`;
  } else {
    svgString = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">\n  <defs>\n    <linearGradient id="sparkGrad" x1="20%" y1="10%" x2="80%" y2="90%">\n      <stop offset="0%" stop-color="${primary}"/>\n      <stop offset="100%" stop-color="${secondary}"/>\n    </linearGradient>\n  </defs>\n  <polygon points="32,8 52,28 32,56 12,28" fill="url(#sparkGrad)" stroke="white" stroke-width="1.5"/>\n  <line x1="32" y1="18" x2="32" y2="28" stroke="white" stroke-width="2" stroke-linecap="round"/>\n  <line x1="32" y1="36" x2="32" y2="44" stroke="white" stroke-width="2" stroke-linecap="round"/>\n  <circle cx="32" cy="32" r="2.5" fill="white"/>\n</svg>`;
  }

  const bgStyleInline = bgStyle === 'soft' ? `background: linear-gradient(135deg, ${primary}08, ${secondary}08); border-radius: 32px; padding: 20px 24px;` : (bgStyle === 'card' ? `background: #FFFFFF; border-radius: 36px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); padding: 20px 24px;` : `background: transparent; padding: 0;`);

  const embedHTML = `<div style="display: inline-flex; flex-direction: column; align-items: center; font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; ${bgStyleInline}">\n  ${svgString}\n  <div style="font-size: ${Math.floor(28 * scaleVal)}px; font-weight: 800; background: linear-gradient(135deg, ${primary}, ${secondary}); background-clip: text; -webkit-background-clip: text; color: transparent; letter-spacing: -0.02em; margin: 8px 0 4px 0;">${brand}</div>\n  <div style="font-size: ${Math.floor(11 * Math.min(1.4, scaleVal))}px; font-weight: 500; color: #4B5563; text-align: center; max-width: 280px;">${tagline}</div>\n</div>`;
  embedCodePre.innerHTML = `<code>${escapeHtml(embedHTML)}</code>`;
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
    return c;
  });
}

copyBtn.addEventListener('click', () => {
  const codeContent = embedCodePre.innerText;
  navigator.clipboard.writeText(codeContent).then(() => {
    showToast('✅ Logo embed code copied!');
  }).catch(() => {
    showToast('⚠️ Manual copy');
  });
});

function getCurrentSVGBlob() {
  const brand = brandInput.value.trim() || 'siteTuation';
  const tagline = taglineInput.value.trim() || 'Turning Locations into Smart Decisions.';
  const primary = primaryColorPicker.value;
  const secondary = secondaryColorPicker.value;
  const scale = textScaleSlider.value;
  const bgStyleVal = bgStyleSelect.value;
  const logoType = currentLogoType;
  let svgIconString = '';

  if (logoType === 'smartIcon') {
    svgIconString = `<svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="10%" y1="10%" x2="90%" y2="90%"><stop offset="0%" stop-color="${primary}"/><stop offset="100%" stop-color="${secondary}"/></linearGradient></defs><rect x="14" y="32" width="8" height="20" rx="3" fill="${primary}"/><rect x="28" y="22" width="8" height="30" rx="3" fill="${secondary}"/><rect x="42" y="12" width="8" height="40" rx="3" fill="url(#g)"/><polyline points="18,54 32,38 46,24 52,30" stroke="${secondary}" stroke-width="2.5" fill="none"/><circle cx="52" cy="30" r="3" fill="${primary}"/></svg>`;
  } else if (logoType === 'locationPin') {
    svgIconString = `<svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="p" x1="0" y1="0" x2="64" y2="64"><stop offset="0%" stop-color="${primary}"/><stop offset="100%" stop-color="${secondary}"/></linearGradient></defs><path d="M32 8C22.058 8 14 16.058 14 26c0 12 10 18 18 30 8-12 18-18 18-30 0-9.942-8.058-18-18-18z" fill="url(#p)" stroke="white" stroke-width="2"/><circle cx="32" cy="26" r="6" fill="white"/></svg>`;
  } else {
    svgIconString = `<svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="s" x1="20%" y1="10%" x2="80%" y2="90%"><stop offset="0%" stop-color="${primary}"/><stop offset="100%" stop-color="${secondary}"/></linearGradient></defs><polygon points="32,8 52,28 32,56 12,28" fill="url(#s)" stroke="white" stroke-width="1.5"/><line x1="32" y1="18" x2="32" y2="28" stroke="white" stroke-width="2"/><line x1="32" y1="36" x2="32" y2="44" stroke="white" stroke-width="2"/><circle cx="32" cy="32" r="2.5" fill="white"/></svg>`;
  }

  const bgAttrs = bgStyleVal === 'soft' ? ` style="background: linear-gradient(135deg, ${primary}15, ${secondary}15); border-radius: 40px; padding: 24px;"` : (bgStyleVal === 'card' ? ` style="background: white; border-radius: 40px; padding: 24px; box-shadow: 0 8px 20px rgba(0,0,0,0.05);"` : ` style="padding: 8px;"`);
  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="auto" viewBox="0 0 400 200" style="font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><div${bgAttrs} style="display: flex; flex-direction: column; align-items: center; justify-content: center;">${svgIconString}<div style="font-size: ${Math.floor(34 * scale)}px; font-weight: 800; background: linear-gradient(135deg, ${primary}, ${secondary}); background-clip: text; -webkit-background-clip: text; color: transparent; margin-top: 12px;">${brand}</div><div style="font-size: 14px; color: #4B5563; margin-top: 6px;">${tagline}</div></div></div></foreignObject></svg>`;
  return new Blob([fullSvg], { type: 'image/svg+xml' });
}

downloadSvgBtn.addEventListener('click', () => {
  const blob = getCurrentSVGBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitetuation-logo.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('⬇️ SVG downloaded!');
});

downloadPngBtn.addEventListener('click', () => {
  const containerDiv = liveContainer.cloneNode(true);
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.top = '-9999px';
  tempDiv.style.left = '-9999px';
  tempDiv.appendChild(containerDiv);
  document.body.appendChild(tempDiv);
  html2canvas?.(containerDiv, { scale: 3, backgroundColor: null }).then(canvas => {
    const link = document.createElement('a');
    link.download = 'sitetuation-logo.png';
    link.href = canvas.toDataURL();
    link.click();
    document.body.removeChild(tempDiv);
    showToast('📸 PNG saved!');
  }).catch(() => {
    document.body.removeChild(tempDiv);
    showToast('⚠️ Use modern browser for PNG.');
  });
});

if (typeof html2canvas === 'undefined') {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  script.onload = () => console.log('html2canvas ready');
  document.head.appendChild(script);
}

updateLogo();
