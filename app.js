// =============================
// Utilities
// =============================
document.getElementById('year').textContent = new Date().getFullYear();

function escapeHtml(str){
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(){
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000); // Show for 2 seconds
}

// =============================
// Data & Config
// =============================
const MIN_SERVICE_CHARGE = 65;

// cart: Map<category, { items: Map<itemName, { qty, note, price|null }> }>
let cart = new Map();

// Load cart from localStorage
function loadCart(){
  const saved = localStorage.getItem('cart_data');
  if (saved){
    try {
      const data = JSON.parse(saved);
      cart.clear();
      Object.entries(data).forEach(([category, categoryData]) => {
        const items = new Map(Object.entries(categoryData.items));
        cart.set(category, { items, category: categoryData.category });
      });
    } catch(e) {
      console.error('Error loading cart:', e);
    }
  }
}

// Save cart to localStorage
function saveCart(){
  const data = {};
  cart.forEach((categoryData, category) => {
    data[category] = {
      category: categoryData.category,
      items: Object.fromEntries(categoryData.items)
    };
  });
  localStorage.setItem('cart_data', JSON.stringify(data));
}

loadCart();

const SERVICE_MENUS = {
  lawn: {
    title: 'Lawn Care — choose what you need',
    subtitle: 'Click an item to add it under Lawn Care in your cart.',
    category: 'Lawn Care',
    items: [
      { name: 'Mowing', desc: 'Clean, even cut with edging available. Priced by yard size - estimate provided.' },
      { name: 'Weed Eating', desc: 'Trimming around edges, trees, docks, and tight areas. Estimate provided upon request.' },
      { name: 'Trimming & Edging', desc: 'Crisp lines along sidewalks, driveways, and landscaping. Estimate provided upon request.' },
      { name: 'Spraying', desc: 'Weed control / spot spraying (tell us what areas in notes). Estimate provided upon request.' },
      { name: 'Seeding', desc: 'Overseeding / patch repair to thicken and improve turf. Estimate provided upon request.' },
      { name: 'Spring / Fall Cleanup', desc: 'Leaves, sticks, and seasonal debris removal. Estimate provided upon request.' }
    ]
  },

  pressure: {
    title: 'Pressure Washing — choose what you need',
    subtitle: 'Click an item to add it under Pressure Washing in your cart.',
    category: 'Pressure Washing',
    items: [
      { name: 'Driveway Washing', desc: 'Concrete/blacktop cleaning. Estimate provided upon request.' },
      { name: 'House Washing', desc: 'Siding wash (gentle where needed). Estimate provided upon request.' },
      { name: 'Gutter Cleaning', desc: 'Clear leaves & debris. Estimate provided upon request.' },
      { name: 'Deck / Patio Washing', desc: 'Refresh outdoor spaces. Estimate provided upon request.' },
      { name: 'Sidewalks & Steps', desc: 'Safer, cleaner walkways. Estimate provided upon request.' },
      { name: 'Dock / Boathouse Washing', desc: 'Lake properties. Estimate provided upon request.' }
    ]
  },

  // ✅ Junk Removal now has PRICES that count toward cart total
  junk: {
    title: 'Junk Removal — choose load size',
    subtitle: 'Select a size, then you MUST add a note before it can be added to your cart.',
    category: 'Junk Removal',
    items: [
      { name: 'Small Load', desc: 'A few items or 1–2 bulky pieces. Estimate provided upon request.' },
      { name: '¼ Truck', desc: 'Small room or garage corner. Estimate provided upon request.' },
      { name: '½ Truck', desc: '1–2 rooms, light furniture. Estimate provided upon request.' },
      { name: '¾ Truck', desc: 'Basement or larger cleanout. Estimate provided upon request.' },
      { name: 'Full Truck', desc: 'Estate / remodel / big cleanout. Estimate provided upon request.' }
    ]
  },

  windows: {
    title: 'Window Washing — choose size & story',
    subtitle: 'Click an item to add it under Window Washing in your cart.',
    category: 'Window Washing',
    items: [
      { name: 'Small Windows — 1st Story', desc: 'Up to ~2×3 ft (24×36 in). Estimate provided upon request.' },
      { name: 'Small Windows — 2nd Story', desc: 'Up to ~2×3 ft (24×36 in). Estimate provided upon request.' },
      { name: 'Small Windows — 3rd+ Story', desc: 'Up to ~2×3 ft (24×36 in). Estimate provided upon request.' },
      { name: 'Medium Windows — 1st Story', desc: '~3×4 to 3×5 ft. Estimate provided upon request.' },
      { name: 'Medium Windows — 2nd Story', desc: '~3×4 to 3×5 ft. Estimate provided upon request.' },
      { name: 'Medium Windows — 3rd+ Story', desc: '~3×4 to 3×5 ft. Estimate provided upon request.' },
      { name: 'Large / Picture Windows — 1st Story', desc: '4×5 ft and larger. Estimate provided upon request.' },
      { name: 'Large / Picture Windows — 2nd Story', desc: '4×5 ft and larger. Estimate provided upon request.' },
      { name: 'Large / Picture Windows — 3rd+ Story', desc: '4×5 ft and larger. Estimate provided upon request.' },
      { name: 'Screens / Tracks Cleaning', desc: 'Priced per screen. Estimate provided upon request.' }
    ]
  },

  snow: {
    title: 'Snow Removal — choose what you need',
    subtitle: 'Click an item to add it under Snow Removal in your cart.',
    category: 'Snow Removal',
    items: [
      { name: 'Driveway Clearing', desc: 'Clear snow from driveway. Estimate provided upon request.' },
      { name: 'Sidewalk Clearing', desc: 'Clear snow from sidewalks. Estimate provided upon request.' },
      { name: 'Salting', desc: 'Apply salt for ice prevention. Estimate provided upon request.' }
    ]
  },

  concrete: {
    title: 'Concrete Work — choose what you need',
    subtitle: 'Click an item to add it under Concrete Work in your cart.',
    category: 'Concrete Work',
    items: [
      { name: 'Driveway Installation', desc: 'New concrete driveway installation. Estimate provided upon request.' },
      { name: 'Patio Installation', desc: 'New concrete patio. Estimate provided upon request.' },
      { name: 'Sidewalk Installation', desc: 'New concrete sidewalk. Estimate provided upon request.' },
      { name: 'Concrete Repair', desc: 'Crack repair and patching. Estimate provided upon request.' },
      { name: 'Concrete Overlay', desc: 'Overlay existing concrete with new decorative surface. Estimate provided upon request.' },
      { name: 'Steps/Stairs', desc: 'Concrete steps or stairs. Estimate provided upon request.' }
    ]
  }
};

// =============================
// DOM References
// =============================
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartClose = document.getElementById('cartClose');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const clearCart = document.getElementById('clearCart');
const sendQuote = document.getElementById('sendQuote');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const cartNote = document.getElementById('cartNote');

const modal = document.getElementById('serviceModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');
const modalGrid = document.getElementById('modalGrid');
const modalViewCart = document.getElementById('modalViewCart');

const quoteModal = document.getElementById('quoteModal');
const quoteClose = document.getElementById('quoteClose');
const quoteCancel = document.getElementById('quoteCancel');
const quoteForm = document.getElementById('quoteForm');

const qName = document.getElementById('qName');
const qPhone = document.getElementById('qPhone');
const qEmail = document.getElementById('qEmail');
const qAddress = document.getElementById('qAddress');
const qCity = document.getElementById('qCity');
const qState = document.getElementById('qState');
const qExtra = document.getElementById('qExtra');

// Note modal
const noteModal = document.getElementById('noteModal');
const noteClose = document.getElementById('noteClose');
const noteCancel = document.getElementById('noteCancel');
const noteAdd = document.getElementById('noteAdd');
const noteTitle = document.getElementById('noteTitle');
const noteLabel = document.getElementById('noteLabel');
const noteTextarea = document.getElementById('noteTextarea');

// Frequency modal (for selecting One Time / Weekly / Monthly)
const freqModal = document.getElementById('freqModal');
const freqClose = document.getElementById('freqClose');
const freqCancel = document.getElementById('freqCancel');
const freqOptions = document.getElementById('freqOptions');
const freqTitle = document.getElementById('freqTitle');
const freqSubtitle = document.getElementById('freqSubtitle');

// Yard size modal (shown before frequency for mowing)
const yardModal = document.getElementById('yardModal');
const yardClose = document.getElementById('yardClose');
const yardCancel = document.getElementById('yardCancel');
const yardOptions = document.getElementById('yardOptions');
const yardTitle = document.getElementById('yardTitle');
const yardSubtitle = document.getElementById('yardSubtitle');

// Square footage modal (for concrete work)
const sqftModal = document.getElementById('sqftModal');
const sqftClose = document.getElementById('sqftClose');
const sqftSkip = document.getElementById('sqftSkip');
const sqftConfirm = document.getElementById('sqftConfirm');
const sqftInput = document.getElementById('sqftInput');
const sqftTitle = document.getElementById('sqftTitle');
const sqftSubtitle = document.getElementById('sqftSubtitle');

// =============================
// Cart Helpers
// =============================
function ensureCategory(category){
  if (!cart.has(category)) cart.set(category, { items: new Map() });
  return cart.get(category);
}

function openCart(){ 
  cartDrawer.classList.add('open'); 
  document.body.style.overflow = 'hidden';
}
function closeCart(){ 
  cartDrawer.classList.remove('open'); 
  document.body.style.overflow = '';
}

function cartTotal(){
  let total = 0;
  for (const group of cart.values()){
    for (const item of group.items.values()){
      if (typeof item.price === 'number'){
        total += item.price * (item.qty || 1);
      }
    }
  }
  return total;
}

function effectiveTotal(){
  if (cart.size === 0) return 0;
  // Apply minimum service charge only when Handyman Services are in the cart
  if (cart.has('Handyman Services')){
    return Math.max(MIN_SERVICE_CHARGE, cartTotal());
  }
  return cartTotal();
}

// =============================
// Rendering
// =============================
function renderCart(){
  cartCount.textContent = [...cart.values()].reduce((a,g)=>a+g.items.size,0);
  const total = effectiveTotal();
  cartTotalPrice.textContent = `$${total}`;
  saveCart();

  if (cart.size === 0){
    cartItems.innerHTML = '<p class="muted">Your cart is empty.</p>';
    sendQuote.disabled = true;
    return;
  }

  const rows = [];
  for (const [category, group] of cart.entries()){
    for (const [name, item] of group.items.entries()){
      let addonHtml = '';
      if (Array.isArray(item.addons) && item.addons.length){
        addonHtml = `
          <div class="muted" style="margin:8px 0 6px">Add-ons</div>
          <ul class="addon-list" style="margin:0 0 8px; padding-left:18px">
            ${item.addons.map(a => `<li>${escapeHtml(a.name)}${typeof a.price === 'number' ? ` <span class="muted">($${a.price})</span>` : ''}</li>`).join('')}
          </ul>
        `;
      }

      rows.push(`
        <div class="cart-row">
          <div class="cart-row-top">
            <div class="name">${escapeHtml(name)}${typeof item.price === 'number' ? ` <span class="muted">($${item.price} ea)</span>` : ''}</div>
            <div class="qty">
              ${typeof item.price === 'number' ? `
                <button class="iconbtn" data-act="dec" data-cat="${escapeHtml(category)}" data-item="${escapeHtml(name)}">−</button>
                <span class="badge">${item.qty || 1}</span>
                <button class="iconbtn" data-act="inc" data-cat="${escapeHtml(category)}" data-item="${escapeHtml(name)}">+</button>
              ` : ''}
              <button class="iconbtn" data-act="remove" data-cat="${escapeHtml(category)}" data-item="${escapeHtml(name)}">Remove</button>
            </div>
          </div>

          <div>
            <div class="muted" style="margin:0 0 6px">Notes for this item</div>
            <textarea class="notearea" data-act="note" data-cat="${escapeHtml(category)}" data-item="${escapeHtml(name)}" placeholder="Example: lake house, by the dock, front yard only, etc.">${escapeHtml(item.note || '')}</textarea>
          </div>
          ${addonHtml}
        </div>
      `);
    }
  }
  cartItems.innerHTML = rows.join('');
  sendQuote.disabled = false;

  if (cartNote){
    const minApplied = cart.has('Handyman Services') && cartTotal() < MIN_SERVICE_CHARGE;
    cartNote.textContent = minApplied
      ? `Minimum service charge of $${MIN_SERVICE_CHARGE} applied.`
      : 'Estimated total shown above.';
  }
}

// =============================
// Quote helpers
// =============================
function buildCartTextForEmail(){
  const lines = [];
  for (const [category, group] of cart.entries()){
    lines.push(`${category}:`);
    for (const [name, item] of group.items.entries()){
      const qty = item.qty || 1;
      const priceText = (typeof item.price === 'number')
        ? ` ($${item.price} ea × ${qty})`
        : '';
      // include addon lines in email
      const addonLines = (Array.isArray(item.addons) && item.addons.length)
        ? item.addons.map(a => `    - Add-on: ${a.name}${typeof a.price === 'number' ? ` ($${a.price})` : ''}`).join('\n')
        : '';
      const noteText = (item.note && item.note.trim())
        ? ` | Notes: ${item.note.trim()}`
        : '';
      lines.push(`- ${name}${priceText}${noteText}`);
      if (addonLines) lines.push(addonLines);
    }
    lines.push('');
  }
  return lines.join('\n').trim();
}

function openQuoteModal(){
  if (cart.size === 0) return;

  quoteModal.style.display = 'block';
  quoteModal.classList.add('open');
  modalBackdrop.classList.add('open');

  setTimeout(() => { try { qName.focus(); } catch(e){} }, 0);
}

// ✅ FIXED: removed broken junkModal/handyModal references
function closeQuoteModal(){
  quoteModal.classList.remove('open');
  quoteModal.style.display = 'none';

  // keep backdrop if service picker modal is open; otherwise close it
  if (!modal.classList.contains('open') && !noteModal.classList.contains('open')){
    modalBackdrop.classList.remove('open');
  }
}

// Note modal functions
function openNoteModal(title, label, placeholder, callback){
  noteTitle.textContent = title;
  noteLabel.textContent = label;
  noteTextarea.placeholder = placeholder;
  noteTextarea.value = '';
  noteModal.style.display = 'block';
  noteModal.classList.add('open');
  modalBackdrop.classList.add('open');
  setTimeout(() => { try { noteTextarea.focus(); } catch(e){} }, 0);
  window.currentNoteCallback = callback;
}


function openFreqModal(menuKey, menu, itemName, price){
  // store context for when a frequency is chosen (may already include yardSize)
  if (!window.currentFreqContext) window.currentFreqContext = {};
  window.currentFreqContext.menuKey = menuKey;
  window.currentFreqContext.menu = menu;
  window.currentFreqContext.itemName = itemName;
  window.currentFreqContext.price = price;

  freqTitle.textContent = `Select frequency for: ${itemName}`;
  freqSubtitle.textContent = 'Choose how often you would like this service.';
  freqModal.style.display = 'block';
  freqModal.classList.add('open');
  modalBackdrop.classList.add('open');
  setTimeout(() => { try { freqOptions.querySelector('.freq-btn').focus(); } catch(e){} }, 0);
}

function openYardModal(menuKey, menu, itemName, price){
  // initialize context
  window.currentFreqContext = { menuKey, menu, itemName, price };
  yardTitle.textContent = `Select yard size for: ${itemName}`;
  yardSubtitle.textContent = 'Approximate yard size helps us estimate time/pricing.';
  yardModal.style.display = 'block';
  yardModal.classList.add('open');
  modalBackdrop.classList.add('open');
  setTimeout(() => { try { yardOptions.querySelector('.yard-btn').focus(); } catch(e){} }, 0);
}

function normalizeFrequency(freq){
  if (!freq) return freq;
  const lower = String(freq).toLowerCase().trim();
  if (lower.includes('bi')) return 'Bi-Weekly';
  if (lower.includes('month')) return 'Monthly';
  if (lower.includes('one') || lower.includes('once')) return 'One Time';
  if (lower.startsWith('we') || lower.includes('week')) return 'Weekly';
  // fallback: capitalize first letter
  return freq.charAt(0).toUpperCase() + freq.slice(1);
}

function closeYardModal(){
  yardModal.classList.remove('open');
  yardModal.style.display = 'none';
  if (!modal.classList.contains('open') && !quoteModal.classList.contains('open') && !noteModal.classList.contains('open')){
    modalBackdrop.classList.remove('open');
  }
}

function closeFreqModal(){
  freqModal.classList.remove('open');
  freqModal.style.display = 'none';
  // keep backdrop if other modals are open
  if (!modal.classList.contains('open') && !quoteModal.classList.contains('open') && !noteModal.classList.contains('open')){
    modalBackdrop.classList.remove('open');
  }
  window.currentFreqContext = null;
}

function openSqftModal(menuKey, menu, itemName, price){
  window.currentSqftContext = { menuKey, menu, itemName, price };
  sqftTitle.textContent = `Square Footage for: ${itemName}`;
  sqftSubtitle.textContent = 'Approximate square footage helps us give you a more accurate estimate.';
  sqftInput.value = '';
  sqftModal.style.display = 'block';
  sqftModal.classList.add('open');
  modalBackdrop.classList.add('open');
  setTimeout(() => { try { sqftInput.focus(); } catch(e){} }, 0);
}

function closeSqftModal(){
  sqftModal.classList.remove('open');
  sqftModal.style.display = 'none';
  if (!modal.classList.contains('open') && !quoteModal.classList.contains('open') && !noteModal.classList.contains('open')){
    modalBackdrop.classList.remove('open');
  }
}

function closeNoteModal(){
  noteModal.classList.remove('open');
  noteModal.style.display = 'none';
  // keep backdrop if other modals are open
  if (!modal.classList.contains('open') && !quoteModal.classList.contains('open')){
    modalBackdrop.classList.remove('open');
  }
}

// =============================
// Modals
// =============================
function openModal(key){
  const menu = SERVICE_MENUS[key];
  if (!menu) return;

  modalTitle.textContent = menu.title;
  modalSubtitle.textContent = menu.subtitle;

  modalGrid.innerHTML = menu.items.map(it => {
    const badge = (typeof it.price === 'number') ? `$${it.price} ea` : 'Add';
    return `
      <div class="pick" data-menu="${escapeHtml(key)}" data-item="${escapeHtml(it.name)}" role="button" tabindex="0">
        <div class="pick-top">
          <h4>${escapeHtml(it.name)}</h4>
          <span class="badge">${escapeHtml(badge)}</span>
        </div>
        <p>${escapeHtml(it.desc || '')}</p>
      </div>
    `;
  }).join('');

  modal.classList.add('open');
  modalBackdrop.classList.add('open');
}

function closeModal(){
  modal.classList.remove('open');
  modalBackdrop.classList.remove('open');
}

// =============================

// Events
// =============================
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('click', () => {
    const menu = card.dataset.menu;
    const name = card.dataset.service;

    // Junk opens junk menu
    if (name === 'Junk Removal') { openModal('junk'); return; }

    // Handyman requires note before adding
    if (name === 'Handyman Services') {
      openNoteModal(
        `Required note for: ${name}`,
        "Please describe what you'd like done",
        "Examples: fix a leaky faucet, install shelves, paint a room",
        (note) => {
          if (note) {
            addItem(name, name, null);
            setItemNote(name, name, note);
            renderCart();
            openCart();
          }
        }
      );
      return;
    }

    if (menu) openModal(menu);
    else addItem(name, name, null);
  });
});

modalClose.onclick = closeModal;
modalViewCart.onclick = () => { closeModal(); openCart(); };

modalGrid.addEventListener('click', e => {
  const pick = e.target.closest('.pick');
  if (!pick) return;
  const menuKey = pick.dataset.menu;
  const itemName = pick.dataset.item;
  const menu = SERVICE_MENUS[menuKey];
  const found = menu.items.find(i => i.name === itemName);
  const price = found && typeof found.price === 'number' ? found.price : null;

  const lineItemName = (menuKey === 'junk') ? `Junk Removal — ${itemName}` : itemName;

  // For mowing, open yard-size selector first, then frequency
  if (menuKey === 'lawn' && itemName === 'Mowing'){
    openYardModal(menuKey, menu, itemName, price);
    return;
  }

  // For concrete work, open square footage modal
  if (menuKey === 'concrete'){
    console.log('Opening sqft modal for concrete work:', itemName);
    openSqftModal(menuKey, menu, itemName, price);
    return;
  }

  // Junk requires note before adding
  if (menuKey === 'junk'){
    openNoteModal(
      `Required note for: ${lineItemName}`,
      "Please describe what we're hauling away",
      "Examples: couch + mattress, garage bags, appliances, construction debris",
      (note) => {
        if (note) {
          addItem(menu.category, lineItemName, price);
          setItemNote(menu.category, lineItemName, note);
          renderCart();
          closeModal();
          openCart();
        }
      }
    );
    return;
  }

  addItem(menu.category, lineItemName, price);
});

// Frequency modal events
if (freqClose) freqClose.addEventListener('click', closeFreqModal);
if (freqCancel) freqCancel.addEventListener('click', closeFreqModal);
if (freqOptions) freqOptions.addEventListener('click', (e) => {
  const btn = e.target.closest('.freq-btn');
  if (!btn) return;
  const freq = btn.dataset.frequency;
  const ctx = window.currentFreqContext;
  if (!ctx) return;
  const yardLabel = ctx.yardSize ? ` — ${ctx.yardSize}` : '';
  // Discounts: Weekly = 15%, Bi-Weekly = 10%
  let discount = 0;
  if (freq === 'Weekly') discount = 0.15;
  else if (freq === 'Bi-Weekly') discount = 0.10;
  const basePrice = (typeof ctx.price === 'number') ? ctx.price : null;
  const finalPrice = (basePrice !== null) ? Math.round(basePrice * (1 - discount) * 100) / 100 : null;
  // store final selections in context and open addons modal
  ctx.finalFreq = freq;
  ctx.finalPrice = finalPrice;
  ctx.displayName = `${ctx.itemName}${yardLabel} — ${freq}`;
  openAddonsModal();
});

// Yard modal events
if (yardClose) yardClose.addEventListener('click', closeYardModal);
if (yardCancel) yardCancel.addEventListener('click', closeYardModal);
if (yardOptions) yardOptions.addEventListener('click', (e) => {
  const btn = e.target.closest('.yard-btn');
  if (!btn) return;
  const yard = btn.dataset.yard;
  const ctx = window.currentFreqContext;
  if (!ctx) return;
  ctx.yardSize = yard;
  // capture price from the selected yard button (if provided)
  if (btn.dataset.price) ctx.price = Number(btn.dataset.price);
  // proceed to frequency selection
  closeYardModal();
  openFreqModal(ctx.menuKey, ctx.menu, ctx.itemName, ctx.price);
});

// Add-ons modal DOM refs & handlers
const addonsModal = document.getElementById('addonsModal');
const addonsClose = document.getElementById('addonsClose');
const addonsCancel = document.getElementById('addonsCancel');
const addonsConfirm = document.getElementById('addonsConfirm');
const addonsList = document.getElementById('addonsList');

function openAddonsModal(){
  if (!window.currentFreqContext) return;
  addonsModal.style.display = 'block';
  addonsModal.classList.add('open');
  modalBackdrop.classList.add('open');
  setTimeout(() => { try { addonsList.querySelector('.addon-checkbox').focus(); } catch(e){} }, 0);
}

function closeAddonsModal(){
  addonsModal.classList.remove('open');
  addonsModal.style.display = 'none';
  if (!modal.classList.contains('open') && !quoteModal.classList.contains('open') && !noteModal.classList.contains('open')){
    modalBackdrop.classList.remove('open');
  }
}

function finalizeMowingWithoutAddons(){
  const ctx = window.currentFreqContext;
  if (!ctx) return;
  const yardLabel = ctx.yardSize ? ` — ${ctx.yardSize}` : '';
  const mainName = `${ctx.itemName}${yardLabel} — ${ctx.finalFreq}`;
  addItem(ctx.menu.category, mainName, ctx.finalPrice);
  // update the created entry to store base price and final combined price
  const group = cart.get(ctx.menu.category);
  if (group){
    const entry = group.items.get(mainName);
    if (entry){
      entry.basePrice = ctx.finalPrice;
      entry.addons = entry.addons || [];
      // recompute combined price
      const addonsTotal = (Array.isArray(entry.addons) && entry.addons.length)
        ? entry.addons.reduce((s,a)=>s + (typeof a.price === 'number' ? a.price : 0), 0)
        : 0;
      entry.price = (typeof ctx.finalPrice === 'number' ? ctx.finalPrice : 0) + addonsTotal;
      // update UI to show addons/pricing
      renderCart();
    }
  }
  closeFreqModal();
  closeModal();
}

if (addonsClose) addonsClose.addEventListener('click', () => { closeAddonsModal(); finalizeMowingWithoutAddons(); });
if (addonsCancel) addonsCancel.addEventListener('click', () => { closeAddonsModal(); finalizeMowingWithoutAddons(); });
if (addonsConfirm) addonsConfirm.addEventListener('click', () => {
  const ctx = window.currentFreqContext;
  if (!ctx) return;
  const yardLabel = ctx.yardSize ? ` — ${ctx.yardSize}` : '';
  const mainName = `${ctx.itemName}${yardLabel} — ${ctx.finalFreq}`;
  // add main item
  addItem(ctx.menu.category, mainName, ctx.finalPrice);
  // attach addons to the main item entry and update combined price
  const checked = Array.from(addonsList.querySelectorAll('.addon-checkbox:checked'));
  const addons = checked.map(cb => ({ name: cb.dataset.addon, price: cb.dataset.price ? Number(cb.dataset.price) : null }));
  const group = cart.get(ctx.menu.category);
  if (group){
    const entry = group.items.get(mainName);
    if (entry){
      entry.basePrice = ctx.finalPrice;
      entry.addons = addons;
      const addonsTotal = addons.reduce((s,a)=>s + (typeof a.price === 'number' ? a.price : 0), 0);
      entry.price = (typeof ctx.finalPrice === 'number' ? ctx.finalPrice : 0) + addonsTotal;
      // refresh cart UI to show updated addons and price
      renderCart();
    }
  }
  closeAddonsModal();
  closeFreqModal();
  closeModal();
});

// =============================
// Cart Actions
// =============================
function addItem(category, name, price){
  const group = ensureCategory(category);
  const current = group.items.get(name);

  if (!current){
    group.items.set(name, { qty: 1, note: '', price });
  } else if (typeof price === 'number'){
    current.qty++;
  }

  renderCart();
  openCart();
  showToast();
}

function setItemNote(category, name, note){
  const group = cart.get(category);
  if (!group) return;
  const entry = group.items.get(name);
  if (!entry) return;
  entry.note = note;
}

cartItems.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const cat = btn.dataset.cat;
  const item = btn.dataset.item;
  const act = btn.dataset.act;

  const group = cart.get(cat);
  if (!group) return;

  const entry = group.items.get(item);
  if (!entry) return;

  if (act === 'remove') group.items.delete(item);
  if (act === 'inc') entry.qty++;
  if (act === 'dec') entry.qty = Math.max(1, entry.qty - 1);

  if (group.items.size === 0) cart.delete(cat);

  renderCart();
});

cartItems.addEventListener('input', e => {
  const ta = e.target.closest('textarea');
  if (!ta) return;
  if (ta.dataset.act !== 'note') return;
  setItemNote(ta.dataset.cat, ta.dataset.item, ta.value);
});

cartBtn.onclick = () => cartDrawer.classList.toggle('open');
cartClose.onclick = closeCart;
clearCart.onclick = () => { cart.clear(); renderCart(); };

// =============================
// Quote Request Wiring (ADDED)
// =============================
sendQuote.addEventListener('click', openQuoteModal);

quoteClose.addEventListener('click', closeQuoteModal);
quoteCancel.addEventListener('click', closeQuoteModal);

quoteForm.addEventListener('submit', (e) => {
  // Populate hidden cart data
  const total = effectiveTotal();
  const cartText = buildCartTextForEmail();
  document.getElementById('cartData').value = `Estimated total: $${total}\n\n${cartText}`;

  // Let the form submit normally to Formspree
  // No preventDefault, so it submits
  closeQuoteModal();
});

// Note modal events
noteClose.addEventListener('click', closeNoteModal);
noteCancel.addEventListener('click', closeNoteModal);
noteAdd.addEventListener('click', () => {
  const note = noteTextarea.value.trim();
  if (window.currentNoteCallback) {
    window.currentNoteCallback(note);
  }
  closeNoteModal();
});

// =============================
// Init
// =============================
renderCart();

// =============================
// Gallery Category Cards Loader
// =============================
function loadGalleryPhotos() {
  const galleryGrid = document.getElementById('galleryGrid');
  if (!galleryGrid) return; // Not on home page
  
  // Try to load from localStorage first
  let photos = JSON.parse(localStorage.getItem('galleryPhotos')) || [];
  
  // If no photos in localStorage, try loading from JSON file
  if (photos.length === 0) {
    fetch('./gallery-data.json')
      .then(r => r.json())
      .then(data => {
        photos = data.photos || [];
        renderGalleryCategoryCards(photos);
      })
      .catch(() => {
        // Show placeholder if no photos
        renderGalleryCategoryCards([]);
      });
  } else {
    renderGalleryCategoryCards(photos);
  }
}

function renderGalleryCategoryCards(photos) {
  const galleryGrid = document.getElementById('galleryGrid');
  if (!galleryGrid) return;
  
  // Define service categories with nice names and colors
  const categories = [
    { id: 'lawn-care', name: 'Lawn Care', gradient: 'linear-gradient(135deg, #2f6b4f 0%, #1a4d37 100%)' },
    { id: 'pressure-washing', name: 'Pressure Washing', gradient: 'linear-gradient(135deg, #4a7c9e 0%, #2d5a7b 100%)' },
    { id: 'junk-removal', name: 'Junk Removal', gradient: 'linear-gradient(135deg, #8b6f47 0%, #6b5337 100%)' },
    { id: 'handyman', name: 'Handyman Services', gradient: 'linear-gradient(135deg, #b89e6a 0%, #987e4a 100%)' },
    { id: 'window-washing', name: 'Window Washing', gradient: 'linear-gradient(135deg, #6b9fb8 0%, #4b7f98 100%)' },
    { id: 'snow-removal', name: 'Snow Removal', gradient: 'linear-gradient(135deg, #9ea4b8 0%, #6e7488 100%)' },
    { id: 'concrete-work', name: 'Concrete Work', gradient: 'linear-gradient(135deg, #858585 0%, #5a5a5a 100%)' }
  ];
  
  // Count photos in each category
  const categoryCounts = {};
  photos.forEach(photo => {
    categoryCounts[photo.category] = (categoryCounts[photo.category] || 0) + 1;
  });
  
  // Get the first photo for each category as thumbnail
  const categoryThumbnails = {};
  photos.forEach(photo => {
    if (!categoryThumbnails[photo.category]) {
      categoryThumbnails[photo.category] = photo.imageUrl;
    }
  });
  
  if (photos.length === 0) {
    galleryGrid.innerHTML = `
      <div class="card gallery-item" style="grid-column: 1/-1; text-align:center; padding:40px;">
        <p class="muted">No photos yet. <a href="admin.html">Add your first photo</a> to showcase your work!</p>
      </div>
    `;
    return;
  }
  
  // Render category cards (show all categories, even if no photos yet)
  galleryGrid.innerHTML = categories.map(cat => {
    const count = categoryCounts[cat.id] || 0;
    const thumbnail = categoryThumbnails[cat.id];
    
    return `
      <a href="gallery.html?category=${cat.id}" class="card gallery-item" style="text-decoration:none; cursor:pointer;">
        ${thumbnail 
          ? `<img src="${escapeHtml(thumbnail)}" alt="${cat.name}" style="width:100%; height:200px; object-fit:cover; display:block;" onerror="this.outerHTML='<div class=\\'gallery-placeholder\\' style=\\'${cat.gradient}; height:200px; display:flex; align-items:center; justify-content:center;\\'><div class=\\'gallery-label\\'>${cat.name}</div></div>';">`
          : `<div class="gallery-placeholder" style="${cat.gradient}">
               <div class="gallery-label">${cat.name}</div>
             </div>`
        }
        <p style="margin: 12px 16px; text-align: center; font-weight:700;">${cat.name}${count > 0 ? ` <span class="badge">${count} photo${count !== 1 ? 's' : ''}</span>` : ''}</p>
      </a>
    `;
  }).join('');
}

// Load gallery on page load
loadGalleryPhotos();

// =============================
// Square Footage Modal Events
// =============================
if (sqftClose) sqftClose.addEventListener('click', closeSqftModal);
if (sqftSkip) sqftSkip.addEventListener('click', () => {
  const ctx = window.currentSqftContext;
  if (!ctx) return;
  addItem(ctx.menu.category, ctx.itemName, ctx.price);
  closeSqftModal();
  closeModal();
});

if (sqftConfirm) sqftConfirm.addEventListener('click', () => {
  const ctx = window.currentSqftContext;
  if (!ctx) return;
  
  const sqft = sqftInput.value.trim();
  let itemName = ctx.itemName;
  
  if (sqft && parseInt(sqft) > 0) {
    itemName = `${ctx.itemName} — ${sqft} sq ft`;
  }
  
  addItem(ctx.menu.category, itemName, ctx.price);
  closeSqftModal();
  closeModal();
});
