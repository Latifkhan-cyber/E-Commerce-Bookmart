// ==========================================================================
// BookMart - Category Service & UI Handler (js/categories.js)
// ==========================================================================

import { collection, getDocs, doc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { sampleCategories, sampleBooks } from "./seed-data.js";
import { renderStarRating, formatCurrency } from "./utils.js";
import { createBookCardHtml } from "./books.js";

let categoriesCache = sampleCategories;
let isCategoriesFetched = false;

/**
 * Fetch all categories instantly (0ms delay) with background Firestore sync
 * @returns {Promise<Array>}
 */
export async function fetchCategories() {
  if (!isCategoriesFetched) {
    getDocs(collection(db, "categories")).then(qSnap => {
      if (!qSnap.empty) {
        const cats = [];
        qSnap.forEach(d => cats.push({ id: d.id, ...d.data() }));
        categoriesCache = cats;
        isCategoriesFetched = true;
      }
    }).catch(() => {});
  }

  return categoriesCache;
}

/**
 * Fetch category by ID or Slug
 * @param {string} identifier 
 * @returns {Promise<Object|null>}
 */
export async function fetchCategoryByIdOrSlug(identifier) {
  if (!identifier) return null;

  const categories = await fetchCategories();
  const match = categories.find(c => c.id === identifier || c.slug === identifier.toLowerCase());
  if (match) return match;

  return sampleCategories.find(c => c.id === identifier || c.slug === identifier.toLowerCase()) || null;
}

/**
 * Render Category Grid Cards instantly
 * @param {string} containerId 
 */
export async function renderCategoryGrid(containerId = "categories-grid-container") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const categories = await fetchCategories();

  if (categories.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">📂</div>
        <h3>No Categories Found</h3>
        <p>Categories will appear here once added by the store administrator.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = categories.map(cat => `
    <a href="/category.html?id=${cat.id}" class="category-card">
      <img src="${cat.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80'}" alt="${cat.name}" loading="lazy">
      <h3>${cat.name}</h3>
      <span>${cat.description ? (cat.description.substring(0, 50) + '...') : ''}</span>
      <div style="margin-top: 0.65rem; font-size: 0.8rem; font-weight: 700; color: var(--secondary-color);">
        ${cat.bookCount || 0} Books Available
      </div>
    </a>
  `).join('');
}

/**
 * Render Category Details Page with Filtered Books
 * @param {string} categoryIdentifier 
 */
export async function renderCategoryDetailPage(categoryIdentifier) {
  const bannerContainer = document.getElementById("category-banner-container");
  const booksContainer = document.getElementById("category-books-container");
  if (!bannerContainer || !booksContainer) return;

  const category = await fetchCategoryByIdOrSlug(categoryIdentifier);

  if (!category) {
    bannerContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>Category Not Found</h3>
        <p>The requested book category could not be located.</p>
        <a href="/categories.html" class="btn btn-primary">Browse All Categories</a>
      </div>
    `;
    booksContainer.innerHTML = '';
    return;
  }

  document.title = `${category.name} Books - BookMart`;

  bannerContainer.innerHTML = `
    <div class="hero-section" style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); min-height: 200px; padding: 2.5rem 2rem;">
      <div class="hero-content">
        <span class="badge badge-warning" style="margin-bottom:0.75rem;">Category Catalog</span>
        <h1 style="font-size: 2.2rem; color: #FFF;">${category.name} Books</h1>
        <p style="color: #94A3B8; margin-bottom: 0;">${category.description || 'Explore our complete collection of titles in ' + category.name}</p>
      </div>
      <div class="hero-image" style="display: flex; justify-content: flex-end;">
        <img src="${category.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80'}" alt="${category.name}" style="width: 140px; height: 140px; border-radius: 50%; object-fit: cover; border: 3px solid var(--secondary-color);">
      </div>
    </div>
  `;

  const categoryBooks = sampleBooks.filter(b => b.categoryId === category.id || b.categoryName.toLowerCase() === category.name.toLowerCase());

  if (categoryBooks.length === 0) {
    booksContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">📚</div>
        <h3>No Books in ${category.name}</h3>
        <p>We are currently stocking new titles for this section. Check back soon!</p>
        <a href="/books.html" class="btn btn-outline">Explore All Books</a>
      </div>
    `;
    return;
  }

  booksContainer.innerHTML = categoryBooks.map(book => createBookCardHtml(book)).join('');
}
