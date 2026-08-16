// ==========================================================================
// BookMart - Books Catalog Service & Filter Controller (js/books.js)
// ==========================================================================

import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { sampleBooks } from "./seed-data.js";
import { renderStarRating, formatCurrency } from "./utils.js";

// Instant 0ms cache defaulting to sampleBooks
let booksCache = sampleBooks;
let isFirestoreFetched = false;

/**
 * Fetch all books instantly (0ms delay) with background Firestore sync
 * @returns {Promise<Array>}
 */
export async function fetchAllBooks() {
  if (!isFirestoreFetched) {
    // Non-blocking background sync from Firestore
    getDocs(collection(db, "books")).then(qSnap => {
      if (!qSnap.empty) {
        const books = [];
        qSnap.forEach(docSnap => books.push({ id: docSnap.id, ...docSnap.data() }));
        booksCache = books;
        isFirestoreFetched = true;
      }
    }).catch(() => {});
  }

  return booksCache;
}

/**
 * Fetch single book by ID
 * @param {string} bookId 
 * @returns {Promise<Object|null>}
 */
export async function fetchBookById(bookId) {
  if (!bookId) return null;

  const books = await fetchAllBooks();
  const match = books.find(b => b.id === bookId);
  if (match) return match;

  return sampleBooks.find(b => b.id === bookId) || null;
}

/**
 * Fetch Featured Books
 */
export async function fetchFeaturedBooks(maxCount = 8) {
  const books = await fetchAllBooks();
  return books.slice(0, maxCount);
}

/**
 * Fetch Best Sellers (sorted by soldCount)
 */
export async function fetchBestSellers(maxCount = 8) {
  const books = await fetchAllBooks();
  return [...books].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, maxCount);
}

/**
 * Fetch New Arrivals (sorted by publicationYear or createdAt)
 */
export async function fetchNewArrivals(maxCount = 8) {
  const books = await fetchAllBooks();
  return [...books].sort((a, b) => (b.publicationYear || 0) - (a.publicationYear || 0)).slice(0, maxCount);
}

/**
 * Fetch Discounted Deals
 */
export async function fetchDealBooks(maxCount = 12) {
  const books = await fetchAllBooks();
  return books.filter(b => b.discountPrice && b.discountPrice < b.price).slice(0, maxCount);
}

/**
 * Render Book Card HTML string
 * @param {Object} book 
 * @returns {string}
 */
export function createBookCardHtml(book) {
  const discountPercent = book.discountPrice && book.price ? Math.round(((book.price - book.discountPrice) / book.price) * 100) : 0;

  return `
    <div class="book-card">
      <div class="book-cover-wrap">
        <img src="${book.coverImage}" alt="${book.title}" loading="lazy">
        ${discountPercent > 0 ? `<span class="badge badge-discount" style="position:absolute;top:10px;left:10px;z-index:5;">-${discountPercent}% OFF</span>` : ''}
        <button class="wishlist-btn" data-book-id="${book.id}" title="Add to Wishlist">❤️</button>
        <a href="/book-details.html?id=${book.id}" style="position:absolute;top:0;left:0;right:0;bottom:0;z-index:1;"></a>
      </div>
      <div class="book-details-wrap">
        <div class="book-category-tag">${book.categoryName || 'General'}</div>
        <h3 class="book-title">
          <a href="/book-details.html?id=${book.id}">${book.title}</a>
        </h3>
        <div class="book-author">by ${book.authorName}</div>
        <div class="book-rating">
          ${renderStarRating(book.rating || 5)}
          <span>(${book.reviewCount || 0})</span>
        </div>
        <div class="book-price-row">
          <div class="price-box">
            <span class="current-price">${formatCurrency(book.discountPrice || book.price)}</span>
            ${book.discountPrice ? `<span class="original-price">${formatCurrency(book.price)}</span>` : ''}
          </div>
          <button class="btn btn-sm btn-primary add-to-cart-btn" data-book-id="${book.id}" style="z-index:5;">
            🛒 Add
          </button>
        </div>
      </div>
    </div>
  `;
}
