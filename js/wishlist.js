// ==========================================================================
// BookMart - Wishlist Controller (js/wishlist.js)
// ==========================================================================

import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import { fetchBookById, createBookCardHtml } from "./books.js";
import { showToast } from "./utils.js";
import { addToCart } from "./cart.js";

/**
 * Get wishlist book IDs
 * @returns {Promise<Array<string>>}
 */
export async function getWishlistBookIds() {
  const user = auth.currentUser;
  if (user) {
    try {
      const docSnap = await getDoc(doc(db, "wishlists", user.uid));
      if (docSnap.exists()) {
        return docSnap.data().bookIds || [];
      }
    } catch (err) {
      console.warn("Firestore wishlist fetch error:", err);
    }
  }
  return JSON.parse(localStorage.getItem("bookmart_wishlist") || "[]");
}

/**
 * Save wishlist IDs
 * @param {Array<string>} bookIds 
 */
export async function saveWishlistBookIds(bookIds) {
  const user = auth.currentUser;
  if (user) {
    try {
      await setDoc(doc(db, "wishlists", user.uid), {
        userId: user.uid,
        bookIds: bookIds,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn("Firestore wishlist save error:", err);
    }
  }
  localStorage.setItem("bookmart_wishlist", JSON.stringify(bookIds));
  updateNavWishlistBadge(bookIds);
}

/**
 * Toggle book in wishlist
 * @param {string} bookId 
 */
export async function addToWishlist(bookId) {
  let ids = await getWishlistBookIds();
  const index = ids.indexOf(bookId);

  if (index > -1) {
    ids.splice(index, 1);
    await saveWishlistBookIds(ids);
    showToast("Removed from Wishlist", "info");
  } else {
    ids.push(bookId);
    await saveWishlistBookIds(ids);
    showToast("Added to Wishlist ❤️", "success");
  }

  // Update button UI if present
  document.querySelectorAll(`.wishlist-btn[data-book-id="${bookId}"]`).forEach(btn => {
    btn.classList.toggle("active");
  });
}

/**
 * Update wishlist navbar badge
 */
function updateNavWishlistBadge(ids) {
  const badge = document.getElementById("wishlist-badge");
  if (badge) {
    badge.textContent = ids.length;
  }
}

/**
 * Render Wishlist Page UI
 */
export async function renderWishlistPage() {
  const container = document.getElementById("wishlist-grid-container");
  if (!container) return;

  const bookIds = await getWishlistBookIds();

  if (bookIds.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">❤️</div>
        <h3>Your Wishlist is Empty</h3>
        <p>Save books you love to your wishlist to read or purchase later.</p>
        <a href="/books.html" class="btn btn-primary">Browse Bookstore</a>
      </div>
    `;
    return;
  }

  const wishlistBooks = [];
  for (const id of bookIds) {
    const book = await fetchBookById(id);
    if (book) wishlistBooks.push(book);
  }

  container.innerHTML = wishlistBooks.map(book => createBookCardHtml(book)).join('');
}

// Bind Global Window
window.addToWishlist = addToWishlist;
