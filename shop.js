// =============================
// Shop Cart Management
// =============================
document.getElementById('year').textContent = new Date().getFullYear();

let shopCart = new Map(); // product -> { qty, price }

// Load shop cart from localStorage
function loadShopCart(){
  const saved = localStorage.getItem('shop_cart');
  if (saved){
    try {
      const data = JSON.parse(saved);
      shopCart.clear();
      Object.entries(data).forEach(([product, item]) => {
        shopCart.set(product, item);
      });
    } catch(e) {
      console.error('Error loading shop cart:', e);
    }
  }
}

// Save shop cart to localStorage
function saveShopCart(){
  const data = Object.fromEntries(shopCart);
  localStorage.setItem('shop_cart', JSON.stringify(data));
}

loadShopCart();

function addProductToCart(productName, price){
  const current = shopCart.get(productName);
  
  if (current){
    renderShopCart();
    document.getElementById('cartDrawer').classList.add('open');
    showToast('Item already in cart');
    return;
  }

  shopCart.set(productName, { qty: 1, price });

  renderShopCart();
  document.getElementById('cartDrawer').classList.add('open');
  showToast();
}

function removeProductFromCart(productName){
  shopCart.delete(productName);
  renderShopCart();
}

function updateProductQty(productName, qty){
  if (qty <= 0){
    removeProductFromCart(productName);
  } else {
    const item = shopCart.get(productName);
    if (item) item.qty = qty;
    renderShopCart();
  }
}

function renderShopCart(){
  const cartItems = document.getElementById('cartItems');
  const cartCount = document.getElementById('cartCount');
  
  if (shopCart.size === 0){
    cartItems.innerHTML = '<div class="muted" style="padding:20px; text-align:center;">Your cart is empty</div>';
    cartCount.textContent = '0';
    
    // Update floating cart badge
    const floatingCartCount = document.getElementById('floatingCartCount');
    if(floatingCartCount){
      floatingCartCount.textContent = '0';
    }
    
    document.getElementById('cartTotalPrice').textContent = '$0.00';
    saveShopCart();
    return;
  }

  let html = '';
  let total = 0;
  let count = 0;

  shopCart.forEach((item, productName) => {
    const subtotal = item.qty * item.price;
    total += subtotal;
    count += item.qty;
    
    html += `
      <div class="cart-item">
        <div class="cart-item-name">${productName}</div>
        <div class="cart-item-controls">
          <button onclick="updateProductQty('${productName}', ${item.qty - 1})" class="qty-btn">-</button>
          <span class="cart-item-qty">${item.qty}</span>
          <button onclick="updateProductQty('${productName}', ${item.qty + 1})" class="qty-btn">+</button>
          <button onclick="removeProductFromCart('${productName}')" class="iconbtn" style="margin-left:10px;">✕</button>
        </div>
        <div class="cart-item-price">$${subtotal.toFixed(2)}</div>
      </div>
    `;
  });

  cartItems.innerHTML = html;
  cartCount.textContent = count;
  
  // Update floating cart badge
  const floatingCartCount = document.getElementById('floatingCartCount');
  if(floatingCartCount){
    floatingCartCount.textContent = count;
  }
  
  document.getElementById('cartTotalPrice').textContent = '$' + total.toFixed(2);
  saveShopCart();
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

// Cart drawer
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartClose = document.getElementById('cartClose');
const clearCartBtn = document.getElementById('clearCart');
const checkoutBtn = document.getElementById('checkoutBtn');

cartBtn.onclick = () => cartDrawer.classList.add('open');
cartClose.onclick = () => cartDrawer.classList.remove('open');

// Floating cart button
const floatingCart = document.getElementById('floatingCart');
if(floatingCart){
  floatingCart.onclick = () => cartDrawer.classList.add('open');
}

clearCartBtn.onclick = () => {
  shopCart.clear();
  renderShopCart();
};

checkoutBtn.onclick = () => {
  if (shopCart.size === 0) return;
  alert('Thank you for your order! This feature will be implemented soon.');
};

// Initialize
renderShopCart();
