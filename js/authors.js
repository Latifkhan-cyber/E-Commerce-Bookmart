// ==========================================================================
// BookMart - Author Service & UI Handler (js/authors.js)
// ==========================================================================

import { collection, getDocs, doc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { sampleAuthors, sampleBooks } from "./seed-data.js";
import { renderStarRating, formatCurrency } from "./utils.js";

/**
 * Fetch all authors from Firestore (with fallback dataset)
 * @returns {Promise<Array>}
 */
export async function fetchAuthors() {
  try {
    const querySnapshot = await getDocs(collection(db, "authors"));
    if (!querySnapshot.empty) {
      const authors = [];
      querySnapshot.forEach(docSnap => {
        authors.push({ id: docSnap.id, ...docSnap.data() });
      });
      return authors;
    }
  } catch (error) {
    console.warn("Firestore authors fetch failed, using fallback:", error);
  }
  return sampleAuthors;
}

/**
 * Fetch single author by ID
 * @param {string} authorId 
 * @returns {Promise<Object|null>}
 */
export async function fetchAuthorById(authorId) {
  if (!authorId) return null;

  try {
    const docRef = doc(db, "authors", authorId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
  } catch (err) {
    console.warn("Author fetch error:", err);
  }

  const match = sampleAuthors.find(a => a.id === authorId);
  return match || null;
}

/**
 * Render Authors Grid
 * @param {string} containerId 
 */
export async function renderAuthorGrid(containerId = "authors-grid-container") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const authors = await fetchAuthors();

  if (authors.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">✍️</div>
        <h3>No Authors Found</h3>
        <p>Author profiles will appear here once registered in the system.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = authors.map(author => `
    <div class="category-card" style="padding: 2rem 1.25rem;">
      <img src="${author.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80'}" alt="${author.name}" style="width: 84px; height: 84px; border-radius: 50%; object-fit: cover; margin-bottom: 1rem; border: 2px solid var(--secondary-color);" loading="lazy">
      <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">${author.name}</h3>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.5; height: 2.6em; overflow: hidden;">
        ${author.bio || 'Renowned author & contributor.'}
      </p>
      <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-color); margin-bottom: 1.25rem;">
        ${author.bookCount || 0} Books Published
      </div>
      <a href="/author-details.html?id=${author.id}" class="btn btn-sm btn-outline" style="width: 100%;">View Books</a>
    </div>
  `).join('');
}

/**
 * Render Author Details Page & Written Books
 * @param {string} authorId 
 */
export async function renderAuthorDetailPage(authorId) {
  const profileContainer = document.getElementById("author-profile-container");
  const booksContainer = document.getElementById("author-books-container");
  if (!profileContainer || !booksContainer) return;

  const author = await fetchAuthorById(authorId);

  if (!author) {
    profileContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>Author Not Found</h3>
        <p>The requested author profile could not be located.</p>
        <a href="/authors.html" class="btn btn-primary">View All Authors</a>
      </div>
    `;
    booksContainer.innerHTML = '';
    return;
  }

  document.title = `${author.name} - Author Profile - BookMart`;

  profileContainer.innerHTML = `
    <div style="background-color: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius-lg); padding: 2.5rem; display: flex; gap: 2rem; align-items: center; margin-bottom: 3rem; flex-wrap: wrap;">
      <img src="${author.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80'}" alt="${author.name}" style="width: 130px; height: 130px; border-radius: 50%; object-fit: cover; border: 4px solid var(--secondary-color); box-shadow: var(--shadow-md);">
      <div style="flex: 1; min-width: 250px;">
        <span class="badge badge-info" style="margin-bottom: 0.5rem;">Featured Author</span>
        <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">${author.name}</h1>
        <p style="color: var(--text-muted); font-size: 1rem; line-height: 1.6; margin-bottom: 1rem;">${author.bio || 'No biography available for this author.'}</p>
        <div style="font-size: 0.9rem; font-weight: 700; color: var(--primary-color);">
          📚 ${author.bookCount || 0} Written Works Available
        </div>
      </div>
    </div>
  `;

  // Fetch author books
  let authorBooks = [];
  try {
    const q = query(collection(db, "books"), where("authorId", "==", author.id));
    const qSnap = await getDocs(q);
    if (!qSnap.empty) {
      qSnap.forEach(docSnap => authorBooks.push({ id: docSnap.id, ...docSnap.data() }));
    }
  } catch (err) {
    console.warn("Firestore author books fetch error:", err);
  }

  if (authorBooks.length === 0) {
    authorBooks = sampleBooks.filter(b => b.authorId === author.id || b.authorName.toLowerCase() === author.name.toLowerCase());
  }

  if (authorBooks.length === 0) {
    booksContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">📖</div>
        <h3>No Books Listed</h3>
        <p>No books currently available for ${author.name}.</p>
      </div>
    `;
    return;
  }

  booksContainer.innerHTML = authorBooks.map(book => `
    <div class="book-card">
      <div class="book-cover-wrap">
        <img src="${book.coverImage}" alt="${book.title}" loading="lazy">
        <a href="/book-details.html?id=${book.id}" style="position:absolute;top:0;left:0;right:0;bottom:0;z-index:1;"></a>
      </div>
      <div class="book-details-wrap">
        <div class="book-category-tag">${book.categoryName}</div>
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
          <a href="/book-details.html?id=${book.id}" class="btn btn-sm btn-primary" style="z-index:2;">View</a>
        </div>
      </div>
    </div>
  `).join('');
}
