// =============================
// Utilities
// =============================
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navActions = document.getElementById('navActions');

if(mobileMenuBtn && navActions){
  mobileMenuBtn.addEventListener('click', () => {
    navActions.classList.toggle('active');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if(!e.target.closest('.nav') && navActions.classList.contains('active')){
      navActions.classList.remove('active');
    }
  });
}

function escapeHtml(str){
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

let toastTimer;

function showToast(message = 'Added to cart'){
  const toast = document.getElementById('toast');
  if(!toast) return;

  toast.textContent = message;
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000); // Show for 3 seconds
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
      { name: 'Weed Eating', price: 35, desc: 'Trimming around edges, trees, docks, and tight areas. Starting at $35.' },
      { name: 'Trimming & Edging', price: 30, desc: 'Crisp lines along sidewalks, driveways, and landscaping. Starting at $30.' },
      { name: 'Spraying', price: 45, desc: 'Weed control / spot spraying (tell us what areas in notes). Starting at $45.' },
      { name: 'Seeding', price: 85, desc: 'Overseeding / patch repair to thicken and improve turf. Starting at $85.' },
      { name: 'Spring / Fall Cleanup', price: 120, desc: 'Leaves, sticks, and seasonal debris removal. Starting at $120.' }
    ]
  },

  pressure: {
    title: 'Pressure Washing — choose what you need',
    subtitle: 'Click an item to add it under Pressure Washing in your cart.',
    category: 'Pressure Washing',
    items: [
      { name: 'Driveway Washing', desc: 'Select your driveway size for a starting price estimate.' },
      { name: 'House Washing', desc: 'Select your home size for a starting price estimate.' },
      { name: 'Gutter Cleaning', desc: 'Select your home size for a starting price estimate.' },
      { name: 'Deck / Patio Washing', desc: 'Select your deck or patio size for a starting price estimate.' },
      { name: 'Sidewalks & Steps', desc: 'Select your project size for a starting price estimate.' },
      { name: 'Dock / Boathouse Washing', desc: 'Select your dock size for a starting price estimate.' }
    ]
  },

  // ✅ Junk Removal now has PRICES that count toward cart total
  junk: {
    title: 'Junk Removal — choose load size',
    subtitle: 'Select a size, then you MUST add a note before it can be added to your cart.\n\n⚠️ Note: Prices listed are starting estimates only. Final cost is heavily dependent on the weight of materials — heavy items like concrete, dirt, or appliances will affect the total.',
    category: 'Junk Removal',
    items: [
      { name: 'Small Load',  price: 75,  desc: 'A few items or 1–2 bulky pieces. Starting at $75.' },
      { name: '¼ Truck',     price: 125, desc: 'Small room or garage corner. Starting at $125.' },
      { name: '½ Truck',     price: 200, desc: '1–2 rooms, light furniture. Starting at $200.' },
      { name: '¾ Truck',     price: 275, desc: 'Basement or larger cleanout. Starting at $275.' },
      { name: 'Full Truck',  price: 375, desc: 'Estate / remodel / big cleanout. Starting at $375.' }
    ]
  },

  windows: {
    title: 'Window Washing — choose size & story',
    subtitle: 'Click an item to add it under Window Washing in your cart.',
    category: 'Window Washing',
    items: [
      { name: 'Small Windows — 1st Story',            price: 6,  desc: 'Up to ~2×3 ft · $6/window · 1st floor.' },
      { name: 'Small Windows — 2nd Story',            price: 9,  desc: 'Up to ~2×3 ft · $9/window · 2nd floor.' },
      { name: 'Small Windows — 3rd+ Story',           price: 13, desc: 'Up to ~2×3 ft · $13/window · 3rd floor+.' },
      { name: 'Medium Windows — 1st Story',           price: 10, desc: '~3×4 to 3×5 ft · $10/window · 1st floor.' },
      { name: 'Medium Windows — 2nd Story',           price: 14, desc: '~3×4 to 3×5 ft · $14/window · 2nd floor.' },
      { name: 'Medium Windows — 3rd+ Story',          price: 20, desc: '~3×4 to 3×5 ft · $20/window · 3rd floor+.' },
      { name: 'Large / Picture Windows — 1st Story',  price: 15, desc: '4×5 ft and larger · $15/window · 1st floor.' },
      { name: 'Large / Picture Windows — 2nd Story',  price: 22, desc: '4×5 ft and larger · $22/window · 2nd floor.' },
      { name: 'Large / Picture Windows — 3rd+ Story', price: 30, desc: '4×5 ft and larger · $30/window · 3rd floor+.' },
      { name: 'Screens / Tracks Cleaning',            price: 4,  desc: '$4 per screen — add one per screen to set quantity.' }
    ]
  },

  snow: {
    title: 'Snow Removal — choose what you need',
    subtitle: 'Click an item to add it under Snow Removal in your cart.',
    category: 'Snow Removal',
    items: [
      { name: 'Driveway Clearing', desc: 'Select your driveway size for a starting price estimate. Salting add-on available.' },
      { name: 'Sidewalk Clearing', desc: 'Select your sidewalk area for a starting price estimate. Salting add-on available.' },
      { name: 'Salting', desc: 'Select area size for a starting price estimate.' }
    ]
  },

  concrete: {
    title: 'Concrete Work — choose what you need',
    subtitle: 'Click an item to add it under Concrete Work in your cart.',
    category: 'Concrete Work',
    items: [
      { name: 'Driveway Installation', sqftRate: 9, desc: 'New concrete driveway installation. Starting at $9/sq ft.' },
      { name: 'Patio Installation', sqftRate: 10, desc: 'New concrete patio. Starting at $10/sq ft.' },
      { name: 'Sidewalk Installation', sqftRate: 8, desc: 'New concrete sidewalk. Starting at $8/sq ft.' },
      { name: 'Concrete Repair', sqftRate: 7, desc: 'Crack repair and patching. Starting at $7/sq ft.' },
      { name: 'Concrete Sealing', sqftRate: 2, desc: 'Protective sealant to extend concrete life and reduce staining. Starting at $2/sq ft.' },
      { name: 'Concrete Overlay', sqftRate: 12, desc: 'Overlay existing concrete with new decorative surface. Starting at $12/sq ft.' },
      { name: 'Steps/Stairs', sqftRate: 15, desc: 'Concrete steps or stairs. Starting at $15/sq ft.' }
    ]
  },

  landscaping: {
    title: 'Landscaping — choose what you need',
    subtitle: 'Click an item to add it under Landscaping in your cart.',
    category: 'Landscaping',
    items: [
      { name: 'Mulch Installation', price: 180, desc: 'Fresh mulch install for beds and borders. Starting at $180.' },
      { name: 'Rock Installation', price: 250, desc: 'Decorative rock placement for low-maintenance landscaping. Starting at $250.' },
      { name: 'Bed Edging', price: 120, desc: 'Define and clean landscape bed edges. Starting at $120.' },
      { name: 'Shrub Trimming', price: 95, desc: 'Trim and shape shrubs for a clean look. Starting at $95.' },
      { name: 'Bush / Shrub Removal', price: 140, desc: 'Remove overgrown shrubs and clean up debris. Starting at $140.' },
      { name: 'Small Tree Trimming', price: 125, desc: 'Prune lower branches and improve tree appearance. Starting at $125.' },
      { name: 'Landscape Cleanup', price: 110, desc: 'Remove leaves, sticks, and debris from beds and hardscape. Starting at $110.' }
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
const qDate = document.getElementById('qDate');
const qTime = document.getElementById('qTime');
const qExtra = document.getElementById('qExtra');
const quoteSubmitBtn = document.getElementById('quoteSubmitBtn');
const quoteModalFoot = document.getElementById('quoteModalFoot');
const quoteSuccess = document.getElementById('quoteSuccess');
const addToCalBtn = document.getElementById('addToCalBtn');
const quoteDoneBtn = document.getElementById('quoteDoneBtn');

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

let _cartScrollY = 0;
function openCart(){ 
  cartDrawer.classList.add('open');
  _cartScrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${_cartScrollY}px`;
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';
}
function closeCart(){ 
  cartDrawer.classList.remove('open');
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflow = '';
  window.scrollTo(0, _cartScrollY);
}

function getItemUnitPrice(item){
  const addonsTotal = (Array.isArray(item.addons) && item.addons.length)
    ? item.addons.reduce((sum, addon) => sum + (typeof addon.price === 'number' ? addon.price : 0), 0)
    : 0;

  if (typeof item.basePrice === 'number'){
    return item.basePrice + addonsTotal;
  }
  return (typeof item.price === 'number') ? item.price : null;
}

function cartTotal(){
  let total = 0;
  for (const group of cart.values()){
    for (const item of group.items.values()){
      const unitPrice = getItemUnitPrice(item);
      if (typeof unitPrice === 'number'){
        total += unitPrice * (item.qty || 1);
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
  const count = [...cart.values()].reduce((a,g)=>a+g.items.size,0);
  cartCount.textContent = count;
  
  // Update floating cart badge
  const floatingCartCount = document.getElementById('floatingCartCount');
  if(floatingCartCount){
    floatingCartCount.textContent = count;
  }
  
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
      const unitPrice = getItemUnitPrice(item);
      let addonHtml = '';
      if (Array.isArray(item.addons) && item.addons.length){
        addonHtml = `
          <div class="muted" style="margin:8px 0 6px">Add-ons</div>
          <ul class="addon-list" style="margin:0 0 8px; padding-left:18px">
            ${item.addons.map(a => `<li>${escapeHtml(a.name)}${typeof a.price === 'number' ? ` <span class="muted">($${a.price})</span>` : ''}</li>`).join('')}
          </ul>
          <div>
            <div class="muted" style="margin:0 0 6px">Add-on notes (optional)</div>
            <textarea class="notearea" data-act="addon-note" data-cat="${escapeHtml(category)}" data-item="${escapeHtml(name)}" placeholder="Example: only front yard seeding, avoid flower beds, etc.">${escapeHtml(item.addonNote || '')}</textarea>
          </div>
        `;
      }

      rows.push(`
        <div class="cart-row">
          <div class="cart-row-top">
            <div class="name">${escapeHtml(name)}${typeof unitPrice === 'number' ? ` <span class="muted">($${unitPrice} ea)</span>` : ''}</div>
            <div class="qty">
              ${typeof unitPrice === 'number' ? `
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
      const unitPrice = getItemUnitPrice(item);
      const priceText = (typeof unitPrice === 'number')
        ? ` ($${unitPrice} ea × ${qty})`
        : '';
      // include addon lines in email
      const addonLines = (Array.isArray(item.addons) && item.addons.length)
        ? item.addons.map(a => `    - Add-on: ${a.name}${typeof a.price === 'number' ? ` ($${a.price})` : ''}`).join('\n')
        : '';
      const addonNoteText = (item.addonNote && item.addonNote.trim())
        ? `    - Add-on notes: ${item.addonNote.trim()}`
        : '';
      const noteText = (item.note && item.note.trim())
        ? ` | Notes: ${item.note.trim()}`
        : '';
      lines.push(`- ${name}${priceText}${noteText}`);
      if (addonLines) lines.push(addonLines);
      if (addonNoteText) lines.push(addonNoteText);
    }
    lines.push('');
  }
  return lines.join('\n').trim();
}

function splitCustomerName(fullName){
  const raw = String(fullName || '').trim();
  if (!raw) return { firstName: '', lastName: '' };
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ')
  };
}

function buildCartLineItemsForZap(){
  const lineItems = [];

  for (const [category, group] of cart.entries()){
    for (const [name, item] of group.items.entries()){
      const qty = item.qty || 1;
      const unitPrice = getItemUnitPrice(item);
      const hasNumericPrice = typeof unitPrice === 'number';
      const addons = Array.isArray(item.addons)
        ? item.addons.map(a => ({
            name: a.name,
            price: (typeof a.price === 'number' ? a.price : 0)
          }))
        : [];

      lineItems.push({
        category,
        service_name: name,
        quantity: qty,
        unit_price: hasNumericPrice ? unitPrice : 0,
        line_total: hasNumericPrice ? unitPrice * qty : 0,
        requires_manual_price: !hasNumericPrice,
        item_note: (item.note || '').trim(),
        addon_note: (item.addonNote || '').trim(),
        addons,
        addons_summary: addons.map(a => `${a.name} ($${a.price})`).join(', ')
      });
    }
  }

  return lineItems;
}

function buildLineItemsTextForZap(lineItems){
  if (!Array.isArray(lineItems) || !lineItems.length) return '';

  return lineItems.map((line, idx) => {
    const pricePart = line.requires_manual_price
      ? 'Manual pricing needed'
      : `$${line.unit_price} x ${line.quantity} = $${line.line_total}`;
    const notePart = line.item_note ? ` | Note: ${line.item_note}` : '';
    const addonPart = line.addons_summary ? ` | Add-ons: ${line.addons_summary}` : '';
    return `${idx + 1}. [${line.category}] ${line.service_name} | ${pricePart}${notePart}${addonPart}`;
  }).join('\n');
}

function openQuoteModal(){
  if (cart.size === 0) return;

  // Reset to form view (in case success screen was showing)
  quoteForm.style.display = '';
  quoteModalFoot.style.display = '';
  quoteSuccess.style.display = 'none';
  quoteSubmitBtn.disabled = false;
  quoteSubmitBtn.textContent = 'Send Request';

  // Set minimum date to today
  qDate.min = new Date().toISOString().split('T')[0];

  quoteModal.style.display = 'block';
  quoteModal.classList.add('open');
  modalBackdrop.classList.add('open');

  setTimeout(() => { try { qName.focus(); } catch(e){} }, 0);
}

// ✅ FIXED: removed broken junkModal/handyModal references
function closeQuoteModal(){
  quoteModal.classList.remove('open');
  quoteModal.style.display = 'none';

  // Reset to form view for next open
  quoteForm.style.display = '';
  quoteForm.reset();
  quoteModalFoot.style.display = '';
  quoteSuccess.style.display = 'none';
  quoteSubmitBtn.disabled = false;
  quoteSubmitBtn.textContent = 'Send Request';

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
  const matched = menu && Array.isArray(menu.items)
    ? menu.items.find(i => i.name === itemName)
    : null;
  const sqftRate = (matched && typeof matched.sqftRate === 'number') ? matched.sqftRate : null;

  window.currentSqftContext = { menuKey, menu, itemName, price, sqftRate };
  sqftTitle.textContent = `Square Footage for: ${itemName}`;
  sqftSubtitle.textContent = (typeof sqftRate === 'number')
    ? `Rate: $${sqftRate}/sq ft. Enter approximate square footage to calculate pricing.`
    : 'Approximate square footage helps us give you a more accurate estimate.';
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
  modalSubtitle.innerHTML = menu.subtitle + (menu.disclaimer ? `<div style="margin-top:8px; padding:8px 10px; background:rgba(255,180,0,.1); border-left:3px solid #f59e0b; border-radius:4px; font-size:13px; color:var(--muted)">${menu.disclaimer}</div>` : '');

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
modalViewCart.onclick = () => { openCart(); };

modalGrid.addEventListener('click', e => {
  const pick = e.target.closest('.pick');
  if (!pick) return;
  const menuKey = pick.dataset.menu;
  const itemName = pick.dataset.item;
  const menu = SERVICE_MENUS[menuKey];
  const found = menu.items.find(i => i.name === itemName);
  const price = found && typeof found.price === 'number' ? found.price : null;

  const lineItemName = (menuKey === 'junk') ? `Junk Removal — ${itemName}` : itemName;

  // For driveway washing, open size picker
  if (menuKey === 'pressure' && itemName === 'Driveway Washing'){
    openDriveModal();
    return;
  }

  // For house washing, open size picker
  if (menuKey === 'pressure' && itemName === 'House Washing'){
    openHouseModal();
    return;
  }

  // For gutter cleaning, open size picker
  if (menuKey === 'pressure' && itemName === 'Gutter Cleaning'){
    openGutterModal();
    return;
  }

  // For deck/patio washing, open size picker
  if (menuKey === 'pressure' && itemName === 'Deck / Patio Washing'){
    openDeckModal();
    return;
  }

  // For sidewalks & steps, open size picker
  if (menuKey === 'pressure' && itemName === 'Sidewalks & Steps'){
    openSidewalkModal();
    return;
  }

  // For dock/boathouse washing, open size picker
  if (menuKey === 'pressure' && itemName === 'Dock / Boathouse Washing'){
    openDockModal();
    return;
  }

  // Snow removal size pickers
  if (menuKey === 'snow' && itemName === 'Driveway Clearing'){
    openSnowDriveModal();
    return;
  }
  if (menuKey === 'snow' && itemName === 'Sidewalk Clearing'){
    openSnowSidewalkModal();
    return;
  }
  if (menuKey === 'snow' && itemName === 'Salting'){
    openSaltModal();
    return;
  }

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

  closeModal();
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

// Driveway size modal
const driveModal   = document.getElementById('driveModal');
const driveClose   = document.getElementById('driveClose');
const driveCancel  = document.getElementById('driveCancel');
const driveOptions = document.getElementById('driveOptions');

function openDriveModal(){
  driveModal.style.display = 'block';
  driveModal.classList.add('open');
  modalBackdrop.classList.add('open');
}
function closeDriveModal(){
  driveModal.classList.remove('open');
  driveModal.style.display = 'none';
  if (!modal.classList.contains('open') && !quoteModal.classList.contains('open') && !noteModal.classList.contains('open')){
    modalBackdrop.classList.remove('open');
  }
}

// House washing size modal
const houseModal   = document.getElementById('houseModal');
const houseClose   = document.getElementById('houseClose');
const houseCancel  = document.getElementById('houseCancel');
const houseOptions = document.getElementById('houseOptions');

function openHouseModal(){
  houseModal.style.display = 'block';
  houseModal.classList.add('open');
  modalBackdrop.classList.add('open');
}
function closeHouseModal(){
  houseModal.classList.remove('open');
  houseModal.style.display = 'none';
  if (!modal.classList.contains('open') && !quoteModal.classList.contains('open') && !noteModal.classList.contains('open')){
    modalBackdrop.classList.remove('open');
  }
}

if (houseClose)  houseClose.addEventListener('click',  closeHouseModal);
if (houseCancel) houseCancel.addEventListener('click', closeHouseModal);
if (houseOptions) houseOptions.addEventListener('click', e => {
  const btn = e.target.closest('.house-btn');
  if (!btn) return;
  const size  = btn.dataset.size;
  const price = btn.dataset.price ? Number(btn.dataset.price) : null;
  const itemName = `House Washing — ${size}`;
  closeHouseModal();
  closeModal();
  addItem('Pressure Washing', itemName, price);
});

// Gutter cleaning size modal
const gutterModal   = document.getElementById('gutterModal');
const gutterClose   = document.getElementById('gutterClose');
const gutterCancel  = document.getElementById('gutterCancel');
const gutterOptions = document.getElementById('gutterOptions');

function openGutterModal(){
  gutterModal.style.display = 'block';
  gutterModal.classList.add('open');
  modalBackdrop.classList.add('open');
}
function closeGutterModal(){
  gutterModal.classList.remove('open');
  gutterModal.style.display = 'none';
  if (!modal.classList.contains('open') && !quoteModal.classList.contains('open') && !noteModal.classList.contains('open')){
    modalBackdrop.classList.remove('open');
  }
}

if (gutterClose)  gutterClose.addEventListener('click',  closeGutterModal);
if (gutterCancel) gutterCancel.addEventListener('click', closeGutterModal);
if (gutterOptions) gutterOptions.addEventListener('click', e => {
  const btn = e.target.closest('.gutter-btn');
  if (!btn) return;
  const size  = btn.dataset.size;
  const price = btn.dataset.price ? Number(btn.dataset.price) : null;
  const itemName = `Gutter Cleaning — ${size}`;
  closeGutterModal();
  closeModal();
  addItem('Pressure Washing', itemName, price);
});

// Deck / Patio washing size modal
const deckModal   = document.getElementById('deckModal');
const deckClose   = document.getElementById('deckClose');
const deckCancel  = document.getElementById('deckCancel');
const deckOptions = document.getElementById('deckOptions');
function openDeckModal(){ deckModal.style.display='block'; deckModal.classList.add('open'); modalBackdrop.classList.add('open'); }
function closeDeckModal(){ deckModal.classList.remove('open'); deckModal.style.display='none'; if(!modal.classList.contains('open')&&!quoteModal.classList.contains('open')&&!noteModal.classList.contains('open')) modalBackdrop.classList.remove('open'); }
if (deckClose)  deckClose.addEventListener('click',  closeDeckModal);
if (deckCancel) deckCancel.addEventListener('click', closeDeckModal);
if (deckOptions) deckOptions.addEventListener('click', e => {
  const btn = e.target.closest('.deck-btn'); if (!btn) return;
  const size = btn.dataset.size; const price = btn.dataset.price ? Number(btn.dataset.price) : null;
  closeDeckModal(); closeModal(); addItem('Pressure Washing', `Deck / Patio Washing — ${size}`, price);
});

// Sidewalks & Steps size modal
const sidewalkModal   = document.getElementById('sidewalkModal');
const sidewalkClose   = document.getElementById('sidewalkClose');
const sidewalkCancel  = document.getElementById('sidewalkCancel');
const sidewalkOptions = document.getElementById('sidewalkOptions');
function openSidewalkModal(){ sidewalkModal.style.display='block'; sidewalkModal.classList.add('open'); modalBackdrop.classList.add('open'); }
function closeSidewalkModal(){ sidewalkModal.classList.remove('open'); sidewalkModal.style.display='none'; if(!modal.classList.contains('open')&&!quoteModal.classList.contains('open')&&!noteModal.classList.contains('open')) modalBackdrop.classList.remove('open'); }
if (sidewalkClose)  sidewalkClose.addEventListener('click',  closeSidewalkModal);
if (sidewalkCancel) sidewalkCancel.addEventListener('click', closeSidewalkModal);
if (sidewalkOptions) sidewalkOptions.addEventListener('click', e => {
  const btn = e.target.closest('.sidewalk-btn'); if (!btn) return;
  const size = btn.dataset.size; const price = btn.dataset.price ? Number(btn.dataset.price) : null;
  closeSidewalkModal(); closeModal(); addItem('Pressure Washing', `Sidewalks & Steps — ${size}`, price);
});

// Dock / Boathouse washing size modal
const dockModal   = document.getElementById('dockModal');
const dockClose   = document.getElementById('dockClose');
const dockCancel  = document.getElementById('dockCancel');
const dockOptions = document.getElementById('dockOptions');
function openDockModal(){ dockModal.style.display='block'; dockModal.classList.add('open'); modalBackdrop.classList.add('open'); }
function closeDockModal(){ dockModal.classList.remove('open'); dockModal.style.display='none'; if(!modal.classList.contains('open')&&!quoteModal.classList.contains('open')&&!noteModal.classList.contains('open')) modalBackdrop.classList.remove('open'); }
if (dockClose)  dockClose.addEventListener('click',  closeDockModal);
if (dockCancel) dockCancel.addEventListener('click', closeDockModal);
if (dockOptions) dockOptions.addEventListener('click', e => {
  const btn = e.target.closest('.dock-btn'); if (!btn) return;
  const size = btn.dataset.size; const price = btn.dataset.price ? Number(btn.dataset.price) : null;
  closeDockModal(); closeModal(); addItem('Pressure Washing', `Dock / Boathouse Washing — ${size}`, price);
});

// Snow removal modals
const snowDriveModal    = document.getElementById('snowDriveModal');
const snowSidewalkModal = document.getElementById('snowSidewalkModal');
const saltModal         = document.getElementById('saltModal');
const saltConfirmModal  = document.getElementById('saltConfirmModal');
let _saltConfirmCtx = null;

function openSnowDriveModal(){ snowDriveModal.style.display='block'; snowDriveModal.classList.add('open'); modalBackdrop.classList.add('open'); }
function closeSnowDriveModal(){ snowDriveModal.classList.remove('open'); snowDriveModal.style.display='none'; if(!modal.classList.contains('open')&&!quoteModal.classList.contains('open')&&!noteModal.classList.contains('open')) modalBackdrop.classList.remove('open'); }

function openSnowSidewalkModal(){ snowSidewalkModal.style.display='block'; snowSidewalkModal.classList.add('open'); modalBackdrop.classList.add('open'); }
function closeSnowSidewalkModal(){ snowSidewalkModal.classList.remove('open'); snowSidewalkModal.style.display='none'; if(!modal.classList.contains('open')&&!quoteModal.classList.contains('open')&&!noteModal.classList.contains('open')) modalBackdrop.classList.remove('open'); }

function openSaltModal(){ saltModal.style.display='block'; saltModal.classList.add('open'); modalBackdrop.classList.add('open'); }
function closeSaltModal(){ saltModal.classList.remove('open'); saltModal.style.display='none'; if(!modal.classList.contains('open')&&!quoteModal.classList.contains('open')&&!noteModal.classList.contains('open')) modalBackdrop.classList.remove('open'); }

function openSaltConfirm(itemName, saltPrice){
  _saltConfirmCtx = { itemName, saltPrice };
  document.getElementById('saltConfirmMsg').innerHTML =
    `Would you like to add <strong>Salting</strong> to <em>${itemName}</em> for <strong>+$${saltPrice}</strong>?`;
  saltConfirmModal.style.display = 'block';
  saltConfirmModal.classList.add('open');
  modalBackdrop.classList.add('open');
}
function closeSaltConfirm(){
  saltConfirmModal.classList.remove('open');
  saltConfirmModal.style.display = 'none';
  modalBackdrop.classList.remove('open');
}

document.getElementById('saltConfirmClose').addEventListener('click', () => { closeSaltConfirm(); openCart(); });
document.getElementById('saltConfirmNo').addEventListener('click',    () => { closeSaltConfirm(); openCart(); });
document.getElementById('saltConfirmYes').addEventListener('click', () => {
  if (!_saltConfirmCtx) return;
  attachSaltAddon('Snow Removal', _saltConfirmCtx.itemName, _saltConfirmCtx.saltPrice);
  closeSaltConfirm();
  openCart();
});

function attachSaltAddon(category, itemName, saltPrice){
  const group = cart.get(category);
  if (!group) return;
  const entry = group.items.get(itemName);
  if (!entry) return;

  // Keep a stable base price so changing salting does not keep increasing totals.
  const existingSaltPrice = Array.isArray(entry.addons)
    ? (entry.addons.find(a => a.name === 'Salting')?.price ?? 0)
    : 0;
  if (typeof entry.basePrice !== 'number'){
    entry.basePrice = (typeof entry.price === 'number' ? entry.price : 0) - (typeof existingSaltPrice === 'number' ? existingSaltPrice : 0);
  }

  const nonSaltAddons = Array.isArray(entry.addons)
    ? entry.addons.filter(a => a.name !== 'Salting')
    : [];
  entry.addons = [...nonSaltAddons, { name: 'Salting', price: saltPrice }];
  entry.price = (typeof entry.basePrice === 'number' ? entry.basePrice : 0) + saltPrice;
  renderCart();
}

document.getElementById('snowDriveClose').addEventListener('click', closeSnowDriveModal);
document.getElementById('snowDriveCancel').addEventListener('click', closeSnowDriveModal);
document.getElementById('snowDriveOptions').addEventListener('click', e => {
  const btn = e.target.closest('.snow-drive-btn'); if (!btn) return;
  const size = btn.dataset.size;
  const price = Number(btn.dataset.price);
  const saltPrice = Number(btn.dataset.saltPrice);
  const itemName = `Driveway Clearing — ${size}`;
  closeSnowDriveModal(); closeModal();
  addItem('Snow Removal', itemName, price, { openCart: false });
  openSaltConfirm(itemName, saltPrice);
});

document.getElementById('snowSidewalkClose').addEventListener('click', closeSnowSidewalkModal);
document.getElementById('snowSidewalkCancel').addEventListener('click', closeSnowSidewalkModal);
document.getElementById('snowSidewalkOptions').addEventListener('click', e => {
  const btn = e.target.closest('.snow-sidewalk-btn'); if (!btn) return;
  const size = btn.dataset.size;
  const price = Number(btn.dataset.price);
  const saltPrice = Number(btn.dataset.saltPrice);
  const itemName = `Sidewalk Clearing — ${size}`;
  closeSnowSidewalkModal(); closeModal();
  addItem('Snow Removal', itemName, price, { openCart: false });
  openSaltConfirm(itemName, saltPrice);
});

document.getElementById('saltClose').addEventListener('click', closeSaltModal);
document.getElementById('saltCancel').addEventListener('click', closeSaltModal);
document.getElementById('saltOptions').addEventListener('click', e => {
  const btn = e.target.closest('.salt-btn'); if (!btn) return;
  const size = btn.dataset.size;
  const price = btn.dataset.price ? Number(btn.dataset.price) : null;
  closeSaltModal(); closeModal();
  addItem('Snow Removal', `Salting — ${size}`, price);
});

if (driveClose)  driveClose.addEventListener('click',  closeDriveModal);
if (driveCancel) driveCancel.addEventListener('click', closeDriveModal);
if (driveOptions) driveOptions.addEventListener('click', e => {
  const btn = e.target.closest('.drive-btn');
  if (!btn) return;
  const size  = btn.dataset.size;
  const price = btn.dataset.price ? Number(btn.dataset.price) : null;
  const itemName = `Driveway Washing — ${size}`;
  closeDriveModal();
  closeModal();
  addItem('Pressure Washing', itemName, price);
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
function addItem(category, name, price, opts = {}){
  const shouldOpenCart = opts.openCart !== false;
  const group = ensureCategory(category);
  const current = group.items.get(name);

  if (current){
    renderCart();
    if (shouldOpenCart) openCart();
    showToast('Item already in cart');
    return false;
  }

  group.items.set(name, { qty: 1, note: '', price });

  renderCart();
  if (shouldOpenCart) openCart();
  showToast();
  return true;
}

function setItemNote(category, name, note){
  const group = cart.get(category);
  if (!group) return;
  const entry = group.items.get(name);
  if (!entry) return;
  entry.note = note;
}

function setAddonNote(category, name, note){
  const group = cart.get(category);
  if (!group) return;
  const entry = group.items.get(name);
  if (!entry) return;
  entry.addonNote = note;
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
  if (ta.dataset.act === 'note'){
    setItemNote(ta.dataset.cat, ta.dataset.item, ta.value);
    return;
  }
  if (ta.dataset.act === 'addon-note'){
    setAddonNote(ta.dataset.cat, ta.dataset.item, ta.value);
  }
});

cartBtn.onclick = () => cartDrawer.classList.toggle('open');
cartClose.onclick = closeCart;
clearCart.onclick = () => { cart.clear(); renderCart(); };

// Floating cart button
const floatingCart = document.getElementById('floatingCart');
if(floatingCart){
  floatingCart.onclick = () => cartDrawer.classList.toggle('open');
}

// =============================
// Quote Request Wiring (ADDED)
// =============================
sendQuote.addEventListener('click', () => {
  closeCart();
  openQuoteModal();
});

quoteClose.addEventListener('click', closeQuoteModal);
quoteCancel.addEventListener('click', closeQuoteModal);

const ZAPIER_QUOTE_HOOK_URL = 'https://hooks.zapier.com/hooks/catch/26873065/up1wjde/';

function buildZapierPayload(total, cartText){
  const fullName = qName.value || '';
  const nameParts = splitCustomerName(fullName);
  const lineItems = buildCartLineItemsForZap();
  const lineItemNames = lineItems.map(i => i.service_name);
  const lineItemQuantities = lineItems.map(i => i.quantity);
  const lineItemUnitPrices = lineItems.map(i => i.unit_price);
  const lineItemCategories = lineItems.map(i => i.category);
  const lineItemNotes = lineItems.map(i => i.item_note || '');
  const lineItemAddons = lineItems.map(i => i.addons_summary || '');

  return {
    name: fullName,
    first_name: nameParts.firstName,
    last_name: nameParts.lastName,
    phone: qPhone.value || '',
    email: qEmail.value || '',
    address: qAddress.value || '',
    city: qCity.value || '',
    state: qState.value || '',
    preferred_date: qDate.value || '',
    preferred_time: qTime.value || '',
    extra: qExtra.value || '',
    cart: cartText || '',
    line_items: lineItems,
    line_items_count: lineItems.length,
    line_items_text: buildLineItemsTextForZap(lineItems),
    line_item_names: lineItemNames,
    line_item_quantities: lineItemQuantities,
    line_item_unit_prices: lineItemUnitPrices,
    line_item_categories: lineItemCategories,
    line_item_notes: lineItemNotes,
    line_item_addons: lineItemAddons,
    // Always send fixed line item fields 1-8 so Zapier can map them reliably.
    // Each selected service is its own clean Jobber quote row.
    ...Array.from({ length: 8 }).reduce((acc, _, i) => {
      const item = lineItems[i];
      const n = i + 1;
      acc[`name_${n}`] = item ? `[${item.category}] ${item.service_name}` : '';
      acc[`qty_${n}`] = item?.quantity || 0;
      acc[`price_${n}`] = item?.unit_price || 0;
      return acc;
    }, {}),
    estimated_total: total,
    submitted_at: new Date().toISOString(),
    source: 'north-star-site'
  };
}

quoteForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Populate hidden cart data field
  const total = effectiveTotal();
  const cartText = buildCartTextForEmail();
  document.getElementById('cartData').value = `Estimated total: $${total}\n\n${cartText}`;

  quoteSubmitBtn.disabled = true;
  quoteSubmitBtn.textContent = 'Sending…';

  const formspreeRequest = fetch(quoteForm.action, {
    method: 'POST',
    body: new FormData(quoteForm),
    headers: { 'Accept': 'application/json' }
  })
    .then(r => r.json())
    .then(data => Boolean(data && data.ok))
    .catch(() => false);

  const zapierRequest = fetch(ZAPIER_QUOTE_HOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildZapierPayload(total, cartText))
  })
    .then(r => r.ok)
    .catch(() => false);

  Promise.all([formspreeRequest, zapierRequest])
    .then(([formspreeOk, zapierOk]) => {
      // Consider successful if either destination accepted the quote.
      if (formspreeOk || zapierOk) {
        // Build Google Calendar link with all appointment details
        const calUrl = buildGCalUrl(
          qDate.value, qTime.value,
          qName.value, qAddress.value, qCity.value, qState.value,
          cartText, total
        );
        addToCalBtn.href = calUrl;

        // Show success screen, hide form
        quoteForm.style.display = 'none';
        quoteModalFoot.style.display = 'none';
        quoteSuccess.style.display = 'block';
      } else {
        quoteSubmitBtn.disabled = false;
        quoteSubmitBtn.textContent = 'Send Request';
        alert('There was a problem sending your request. Please try again or call us at 507-920-6409.');
      }
    })
    .catch(() => {
      quoteSubmitBtn.disabled = false;
      quoteSubmitBtn.textContent = 'Send Request';
      alert('There was a problem sending your request. Please try again or call us at 507-920-6409.');
    });
});

// =============================
// Google Calendar URL Builder
// =============================
function buildGCalUrl(date, time, name, address, city, state, cartSummary, total){
  // Map time preference to start/end hours
  let startHour = 8, endHour = 18;
  if (String(time).includes('Morning'))   { startHour = 8;  endHour = 12; }
  if (String(time).includes('Afternoon')) { startHour = 12; endHour = 17; }
  if (String(time).includes('Evening'))  { startHour = 17; endHour = 19; }

  const pad = n => String(n).padStart(2, '0');
  const [year, month, day] = (date || '').split('-');
  const startDt = `${year}${month}${day}T${pad(startHour)}0000`;
  const endDt   = `${year}${month}${day}T${pad(endHour)}0000`;

  const timeLabel = time || 'Any time';
  const title     = encodeURIComponent('North Star Maintenance — Service Appointment');
  const location  = encodeURIComponent([address, city, state].filter(Boolean).join(', '));
  const details   = encodeURIComponent(
    `Customer: ${name}\nTime Preference: ${timeLabel}\n\nServices:\n${cartSummary}\n\nEstimated Total: $${total}`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDt}/${endDt}&details=${details}&location=${location}`;
}

// Done button — close modal and clear cart after successful quote
quoteDoneBtn.addEventListener('click', () => {
  closeQuoteModal();
  cart.clear();
  renderCart();
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
  const fallbackPrice = (typeof ctx.sqftRate === 'number') ? null : ctx.price;
  addItem(ctx.menu.category, ctx.itemName, fallbackPrice);
  closeSqftModal();
  closeModal();
});

if (sqftConfirm) sqftConfirm.addEventListener('click', () => {
  const ctx = window.currentSqftContext;
  if (!ctx) return;
  
  const sqft = sqftInput.value.trim();
  const sqftNumber = Number(sqft);
  let itemName = ctx.itemName;
  let finalPrice = ctx.price;
  
  if (sqft && sqftNumber > 0) {
    if (typeof ctx.sqftRate === 'number'){
      finalPrice = Math.round((sqftNumber * ctx.sqftRate) * 100) / 100;
      itemName = `${ctx.itemName} — ${sqftNumber} sq ft @ $${ctx.sqftRate}/sq ft`;
    } else {
      itemName = `${ctx.itemName} — ${sqft} sq ft`;
    }
  }
  
  addItem(ctx.menu.category, itemName, finalPrice);
  closeSqftModal();
  closeModal();
});
