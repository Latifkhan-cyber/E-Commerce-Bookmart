// ==========================================================================
// BookMart - Book Details Service & Component Handler (js/book-details.js)
// ==========================================================================

import { fetchBookById, fetchAllBooks, createBookCardHtml } from "./books.js";
import { renderStarRating, formatCurrency, showToast } from "./utils.js";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db, auth } from "./firebase-config.js";

/**
 * Render Book Details Page
 * @param {string} bookId 
 */
export async function renderBookDetails(bookId) {
  const container = document.getElementById("book-details-content");
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 4rem 0; text-align: center;">
      <div class="skeleton" style="width: 100%; height: 400px; border-radius: var(--radius-lg);"></div>
    </div>
  `;

  const book = await fetchBookById(bookId);

  if (!book) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📕</div>
        <h3>Book Not Found</h3>
        <p>The book title you requested could not be located in our store catalog.</p>
        <a href="/books.html" class="btn btn-primary">Browse All Books</a>
      </div>
    `;
    return;
  }

  document.title = `${book.title} - BookMart`;

  const discountPercent = book.discountPrice && book.price ? Math.round(((book.price - book.discountPrice) / book.price) * 100) : 0;
  const isOutOfStock = (book.stock || 0) <= 0;
  const isLowStock = (book.stock || 0) > 0 && (book.stock || 0) <= 5;

  const imagesList = [book.coverImage, ...(book.additionalImages || [])];

  container.innerHTML = `
    <div class="book-details-layout">
      <!-- Left: Image Gallery -->
      <div class="book-gallery">
        <div class="main-image">
          <img id="primary-gallery-img" src="${imagesList[0]}" alt="${book.title}">
        </div>
        ${imagesList.length > 1 ? `
          <div class="thumbs-list">
            ${imagesList.map((img, idx) => `
              <div class="thumb-item ${idx === 0 ? 'active' : ''}" data-img="${img}">
                <img src="${img}" alt="Thumbnail ${idx + 1}">
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Right: Main Details & Actions -->
      <div>
        <div class="book-category-tag" style="font-size:0.85rem;">${book.categoryName || 'General Catalog'}</div>
        <h1 style="font-size: 2.2rem; margin-bottom: 0.5rem; color: var(--primary-color);">${book.title}</h1>
        
        <div style="display:flex;align-items:center;gap:1.5rem;margin-bottom:1.25rem;flex-wrap:wrap;">
          <div class="book-author" style="font-size:1.05rem;margin-bottom:0;">
            by <a href="/author-details.html?id=${book.authorId}" style="color:var(--secondary-color);font-weight:600;">${book.authorName}</a>
          </div>
          <div class="book-rating" style="margin-bottom:0;font-size:1rem;">
            ${renderStarRating(book.rating || 5)}
            <span style="font-weight:bold;color:var(--text-main);">${book.rating || 5.0}</span>
            <span>(${book.reviewCount || 0} reviews)</span>
          </div>
        </div>

        <!-- Price Box -->
        <div style="background-color:var(--border-light);padding:1.25rem 1.5rem;border-radius:var(--radius-md);margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
          <div class="price-box" style="gap:0.75rem;">
            <span class="current-price" style="font-size:2rem;">${formatCurrency(book.discountPrice || book.price)}</span>
            ${book.discountPrice ? `<span class="original-price" style="font-size:1.2rem;">${formatCurrency(book.price)}</span>` : ''}
            ${discountPercent > 0 ? `<span class="badge badge-discount">Save ${discountPercent}%</span>` : ''}
          </div>
          
          <div>
            ${isOutOfStock ? `<span class="badge badge-discount">Out of Stock</span>` : 
              isLowStock ? `<span class="badge badge-warning">Low Stock (${book.stock} left)</span>` : 
              `<span class="badge badge-success">In Stock (${book.stock} available)</span>`}
          </div>
        </div>

        <!-- Description -->
        <p style="color:var(--text-muted);font-size:1rem;line-height:1.7;margin-bottom:2rem;">
          ${book.description}
        </p>

        <!-- Quantity & Action Buttons -->
        <div style="display:flex;gap:1rem;align-items:center;margin-bottom:2.5rem;flex-wrap:wrap;">
          <div class="qty-control" style="height:48px;">
            <button class="qty-btn" id="qty-minus" style="width:40px;height:100%;font-size:1.2rem;">-</button>
            <input type="number" id="detail-qty" value="1" min="1" max="${book.stock || 1}" class="qty-input" style="height:100%;font-size:1.1rem;" readonly>
            <button class="qty-btn" id="qty-plus" style="width:40px;height:100%;font-size:1.2rem;">+</button>
          </div>

          <button id="add-cart-detail-btn" class="btn btn-lg btn-primary" ${isOutOfStock ? 'disabled' : ''} style="flex:1;min-width:180px;">
            🛒 Add to Cart
          </button>

          <button id="buy-now-btn" class="btn btn-lg btn-accent" ${isOutOfStock ? 'disabled' : ''}>
            ⚡ Buy Now
          </button>

          <button id="wishlist-detail-btn" class="btn btn-lg btn-outline btn-icon" title="Add to Wishlist">
            ❤️
          </button>
        </div>

        <!-- Quick Specs Table -->
        <div style="border-top:1px solid var(--card-border);padding-top:1.5rem;">
          <h4 style="margin-bottom:1rem;">Book Specifications</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;font-size:0.9rem;">
            <div><strong style="color:var(--text-muted);">Publisher:</strong> <a href="/publisher-details.html?id=${book.publisherId}">${book.publisherName}</a></div>
            <div><strong style="color:var(--text-muted);">ISBN-13:</strong> ${book.isbn || 'N/A'}</div>
            <div><strong style="color:var(--text-muted);">Language:</strong> ${book.language || 'English'}</div>
            <div><strong style="color:var(--text-muted);">Page Count:</strong> ${book.pages || 'N/A'} pages</div>
            <div><strong style="color:var(--text-muted);">Publication Year:</strong> ${book.publicationYear || 'N/A'}</div>
            <div><strong style="color:var(--text-muted);">Category:</strong> <a href="/category.html?id=${book.categoryId}">${book.categoryName}</a></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Related Books Carousel / Grid -->
    <div style="margin-top: 4rem; border-top: 1px solid var(--card-border); padding-top: 3rem;">
      <h2 style="margin-bottom: 1.5rem;">Related Books You May Like</h2>
      <div class="books-grid" id="related-books-grid"></div>
    </div>
  `;

  // Gallery Thumbnail Event
  container.querySelectorAll(".thumb-item").forEach(thumb => {
    thumb.addEventListener("click", (e) => {
      container.querySelectorAll(".thumb-item").forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
      const primaryImg = document.getElementById("primary-gallery-img");
      if (primaryImg) primaryImg.src = thumb.dataset.img;
    });
  });

  // Quantity Handlers
  const qtyInput = document.getElementById("detail-qty");
  document.getElementById("qty-minus")?.addEventListener("click", () => {
    let val = parseInt(qtyInput.value) || 1;
    if (val > 1) qtyInput.value = val - 1;
  });

  document.getElementById("qty-plus")?.addEventListener("click", () => {
    let val = parseInt(qtyInput.value) || 1;
    if (val < (book.stock || 99)) qtyInput.value = val + 1;
    else showToast(`Only ${book.stock} units available in stock.`, "warning");
  });

  // Add to Cart Event
  document.getElementById("add-cart-detail-btn")?.addEventListener("click", async () => {
    const qty = parseInt(qtyInput.value) || 1;
    const btn = document.getElementById("add-cart-detail-btn");
    btn.disabled = true;
    btn.textContent = "Adding...";
    await window.addToCart(book.id, qty);
    btn.disabled = false;
    btn.textContent = "🛒 Add to Cart";
  });

  // Buy Now Event (Adds to cart & redirects to checkout)
  document.getElementById("buy-now-btn")?.addEventListener("click", async () => {
    const qty = parseInt(qtyInput.value) || 1;
    const btn = document.getElementById("buy-now-btn");
    btn.disabled = true;
    btn.textContent = "Processing...";
    await window.addToCart(book.id, qty);
    window.location.href = "/checkout.html";
  });

  // Wishlist Event
  document.getElementById("wishlist-detail-btn")?.addEventListener("click", async () => {
    if (window.addToWishlist) {
      await window.addToWishlist(book.id);
    }
  });

  // Render Related Books
  renderRelatedBooks(book.categoryId, book.id);
}

/**
 * Render Related Books in Same Category
 */
async function renderRelatedBooks(categoryId, currentBookId) {
  const container = document.getElementById("related-books-grid");
  if (!container) return;

  const allBooks = await fetchAllBooks();
  const related = allBooks.filter(b => b.categoryId === categoryId && b.id !== currentBookId).slice(0, 4);

  if (related.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted);grid-column:1/-1;">No related books currently available.</p>`;
    return;
  }

  container.innerHTML = related.map(b => createBookCardHtml(b)).join('');
}
