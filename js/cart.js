// ==========================================================================
// BookMart - Shopping Cart Controller (js/cart.js)
// ==========================================================================

import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import { fetchBookById } from "./books.js";
import { formatCurrency, showToast } from "./utils.js";

/**
 * Get current cart items (from Firestore if logged in, else localStorage)
 * @returns {Promise<Array>} List of { bookId, quantity }
 */
export async function getCartItems() {
  const user = auth.currentUser;
  if (user) {
    try {
      // 1.5s timeout race condition to keep UI lightning fast
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500));
      const fetchPromise = getDoc(doc(db, "carts", user.uid));
      
      const docSnap = await Promise.race([fetchPromise, timeoutPromise]);
      if (docSnap && docSnap.exists()) {
        const items = docSnap.data().items || [];
        localStorage.setItem("bookmart_cart", JSON.stringify(items));
        return items;
      }
    } catch (err) {
      // Use local storage cache for instant response
    }
  }
  return JSON.parse(localStorage.getItem("bookmart_cart") || "[]");
}

/**
 * Save cart items (to Firestore if logged in, else localStorage)
 * @param {Array} items 
 */
export async function saveCartItems(items) {
  localStorage.setItem("bookmart_cart", JSON.stringify(items));
  updateNavCartBadge(items);

  const user = auth.currentUser;
  if (user) {
    try {
      await setDoc(doc(db, "carts", user.uid), {
        userId: user.uid,
        items: items,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn("Firestore cart save background error:", err);
    }
  }
}

/**
 * Add book to cart with stock validation
 * @param {string} bookId 
 * @param {number} quantity 
 */
export async function addToCart(bookId, quantity = 1) {
  if (!bookId) return;

  const book = await fetchBookById(bookId);
  if (!book) {
    showToast("Book details unavailable", "error");
    return;
  }

  if ((book.stock || 0) <= 0) {
    showToast(`"${book.title}" is currently out of stock.`, "warning");
    return;
  }

  let items = await getCartItems();
  const existingIndex = items.findIndex(item => item.bookId === bookId);

  if (existingIndex > -1) {
    const newQty = items[existingIndex].quantity + quantity;
    if (newQty > (book.stock || 99)) {
      showToast(`Cannot add more. Maximum available stock is ${book.stock}.`, "warning");
      items[existingIndex].quantity = book.stock;
    } else {
      items[existingIndex].quantity = newQty;
      showToast(`Updated "${book.title}" quantity in cart (${items[existingIndex].quantity})`, "success");
    }
  } else {
    if (quantity > (book.stock || 99)) {
      quantity = book.stock;
      showToast(`Adjusted quantity to available stock (${book.stock})`, "warning");
    }
    items.push({ bookId, quantity });
    showToast(`Added "${book.title}" to cart! 🛒`, "success");
  }

  await saveCartItems(items);
}

/**
 * Update item quantity
 * @param {string} bookId 
 * @param {number} newQty 
 */
export async function updateCartQuantity(bookId, newQty) {
  let items = await getCartItems();
  const book = await fetchBookById(bookId);
  const maxStock = book ? (book.stock || 99) : 99;

  if (newQty <= 0) {
    await removeFromCart(bookId);
    return;
  }

  if (newQty > maxStock) {
    showToast(`Stock limit reached (${maxStock})`, "warning");
    newQty = maxStock;
  }

  const index = items.findIndex(item => item.bookId === bookId);
  if (index > -1) {
    items[index].quantity = newQty;
    await saveCartItems(items);
    renderCartPage();
  }
}

/**
 * Remove single item from cart
 * @param {string} bookId 
 */
export async function removeFromCart(bookId) {
  let items = await getCartItems();
  items = items.filter(item => item.bookId !== bookId);
  await saveCartItems(items);
  showToast("Item removed from cart", "info");
  renderCartPage();
}

/**
 * Clear entire cart
 */
export async function clearCart() {
  await saveCartItems([]);
  showToast("Cart cleared", "info");
  renderCartPage();
}

/**
 * Update navbar badge
 */
export function updateNavCartBadge(items) {
  const badge = document.getElementById("cart-badge");
  if (badge) {
    const totalQty = (items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
    badge.textContent = totalQty;
  }
}

/**
 * Render Cart Page UI
 */
export async function renderCartPage() {
  const tableContainer = document.getElementById("cart-items-container");
  const summaryContainer = document.getElementById("cart-summary-container");
  if (!tableContainer || !summaryContainer) return;

  const rawItems = await getCartItems();

  if (rawItems.length === 0) {
    tableContainer.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-state-icon">🛒</div>
        <h3>Your Cart is Empty</h3>
        <p>Looks like you haven't added any books to your cart yet.</p>
        <a href="/books.html" class="btn btn-primary">Explore Bookstore</a>
      </div>
    `;
    summaryContainer.innerHTML = '';
    return;
  }

  const populatedItems = [];
  let subtotal = 0;

  for (const item of rawItems) {
    const book = await fetchBookById(item.bookId);
    if (book) {
      const itemPrice = book.discountPrice || book.price;
      const itemSubtotal = itemPrice * item.quantity;
      subtotal += itemSubtotal;

      populatedItems.push({
        ...book,
        quantity: item.quantity,
        itemPrice,
        itemSubtotal
      });
    }
  }

  const shippingFee = subtotal > 50 ? 0 : 5.00;
  const total = subtotal + shippingFee;

  tableContainer.innerHTML = `
    <div class="cart-table-wrap">
      <table class="cart-table">
        <thead>
          <tr>
            <th>Book</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${populatedItems.map(item => `
            <tr>
              <td>
                <div class="cart-item-info">
                  <img src="${item.coverImage}" alt="${item.title}" class="cart-item-img">
                  <div>
                    <a href="/book-details.html?id=${item.id}" class="cart-item-title">${item.title}</a>
                    <div class="cart-item-author">by ${item.authorName}</div>
                  </div>
                </div>
              </td>
              <td style="font-weight:600;">${formatCurrency(item.itemPrice)}</td>
              <td>
                <div class="qty-control">
                  <button class="qty-btn" onclick="window.updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                  <input type="number" value="${item.quantity}" readonly class="qty-input">
                  <button class="qty-btn" onclick="window.updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
              </td>
              <td style="font-weight:700;color:var(--primary-color);">${formatCurrency(item.itemSubtotal)}</td>
              <td>
                <button class="btn btn-sm btn-outline" style="color:var(--danger-color);border-color:transparent;" onclick="window.removeFromCart('${item.id}')" title="Remove Item">✕</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="padding:1rem 1.25rem;display:flex;justify-content:space-between;align-items:center;background:var(--border-light);">
        <a href="/books.html" class="btn btn-sm btn-outline">← Continue Shopping</a>
        <button class="btn btn-sm btn-danger" onclick="window.clearCart()">Clear Cart</button>
      </div>
    </div>
  `;

  summaryContainer.innerHTML = `
    <div class="cart-summary-card">
      <h3 class="cart-summary-title">Order Summary</h3>

      <div class="summary-row">
        <span>Items Subtotal</span>
        <span>${formatCurrency(subtotal)}</span>
      </div>

      <div class="summary-row">
        <span>Estimated Shipping</span>
        <span>${shippingFee === 0 ? '<span style="color:var(--accent-color);font-weight:700;">FREE</span>' : formatCurrency(shippingFee)}</span>
      </div>

      ${subtotal < 50 ? `<div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;">Add ${formatCurrency(50 - subtotal)} more for FREE shipping!</div>` : ''}

      <div class="summary-row total">
        <span>Total Amount</span>
        <span>${formatCurrency(total)}</span>
      </div>

      <a href="/checkout.html" class="btn btn-lg btn-primary" style="width:100%;">
        Proceed to Checkout →
      </a>
    </div>
  `;
}

// Global Delegated Event Listener for ANY Add-To-Cart & Wishlist buttons across the whole app
document.addEventListener("click", async (e) => {
  const addCartBtn = e.target.closest(".add-to-cart-btn");
  if (addCartBtn) {
    e.preventDefault();
    e.stopPropagation();
    const bookId = addCartBtn.dataset.bookId;
    if (bookId) {
      addCartBtn.disabled = true;
      const origText = addCartBtn.innerHTML;
      addCartBtn.innerHTML = "<span>...</span>";
      await addToCart(bookId, 1);
      addCartBtn.disabled = false;
      addCartBtn.innerHTML = origText;
    }
    return;
  }

  const wishlistBtn = e.target.closest(".wishlist-btn");
  if (wishlistBtn) {
    e.preventDefault();
    e.stopPropagation();
    const bookId = wishlistBtn.dataset.bookId;
    if (bookId && window.addToWishlist) {
      await window.addToWishlist(bookId);
    }
  }
});

// Bind Global Window
window.addToCart = addToCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;

// Init Badge on Load
updateNavCartBadge(JSON.parse(localStorage.getItem("bookmart_cart") || "[]"));
