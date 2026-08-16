// ==========================================================================
// BookMart - Publisher Service & UI Handler (js/publishers.js)
// ==========================================================================

import { collection, getDocs, doc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { samplePublishers, sampleBooks } from "./seed-data.js";
import { renderStarRating, formatCurrency } from "./utils.js";
import { createBookCardHtml } from "./books.js";

/**
 * Fetch all publishers from Firestore (with fallback)
 * @returns {Promise<Array>}
 */
export async function fetchPublishers() {
  try {
    const querySnapshot = await getDocs(collection(db, "publishers"));
    if (!querySnapshot.empty) {
      const publishers = [];
      querySnapshot.forEach(docSnap => {
        publishers.push({ id: docSnap.id, ...docSnap.data() });
      });
      return publishers;
    }
  } catch (error) {
    console.warn("Firestore publishers fetch failed, using fallback:", error);
  }
  return samplePublishers;
}

/**
 * Fetch single publisher by ID
 * @param {string} publisherId 
 * @returns {Promise<Object|null>}
 */
export async function fetchPublisherById(publisherId) {
  if (!publisherId) return null;

  try {
    const docRef = doc(db, "publishers", publisherId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
  } catch (err) {
    console.warn("Publisher fetch error:", err);
  }

  const match = samplePublishers.find(p => p.id === publisherId);
  return match || null;
}

/**
 * Render Publisher Grid
 * @param {string} containerId 
 */
export async function renderPublisherGrid(containerId = "publishers-grid-container") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const publishers = await fetchPublishers();

  if (publishers.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🏢</div>
        <h3>No Publishers Found</h3>
        <p>Publishers will appear here once configured.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = publishers.map(pub => `
    <div class="category-card" style="padding: 2rem 1.25rem;">
      <img src="${pub.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80'}" alt="${pub.name}" style="width: 72px; height: 72px; object-fit: contain; margin-bottom: 1rem; border-radius: var(--radius-sm);" loading="lazy">
      <h3 style="font-size: 1.1rem; margin-bottom: 0.35rem;">${pub.name}</h3>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.5; height: 2.6em; overflow: hidden;">
        ${pub.description || 'Official partner publisher.'}
      </p>
      <div style="font-size: 0.8rem; font-weight: 700; color: var(--secondary-color); margin-bottom: 1.25rem;">
        ${pub.bookCount || 0} Published Books
      </div>
      <a href="/publisher-details.html?id=${pub.id}" class="btn btn-sm btn-outline" style="width: 100%;">View Titles</a>
    </div>
  `).join('');
}

/**
 * Render Publisher Details Page & Published Books
 * @param {string} publisherId 
 */
export async function renderPublisherDetailPage(publisherId) {
  const profileContainer = document.getElementById("publisher-profile-container");
  const booksContainer = document.getElementById("publisher-books-container");
  if (!profileContainer || !booksContainer) return;

  const publisher = await fetchPublisherById(publisherId);

  if (!publisher) {
    profileContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>Publisher Not Found</h3>
        <p>The requested publisher details could not be located.</p>
        <a href="/publishers.html" class="btn btn-primary">View All Publishers</a>
      </div>
    `;
    booksContainer.innerHTML = '';
    return;
  }

  document.title = `${publisher.name} - Publisher - BookMart`;

  profileContainer.innerHTML = `
    <div style="background-color: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius-lg); padding: 2.5rem; display: flex; gap: 2rem; align-items: center; margin-bottom: 3rem; flex-wrap: wrap;">
      <img src="${publisher.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80'}" alt="${publisher.name}" style="width: 110px; height: 110px; object-fit: contain; background: #FFF; padding: 0.5rem; border-radius: var(--radius-md); border: 1px solid var(--card-border);">
      <div style="flex: 1; min-width: 250px;">
        <span class="badge badge-success" style="margin-bottom: 0.5rem;">Verified Publisher</span>
        <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">${publisher.name}</h1>
        <p style="color: var(--text-muted); font-size: 1rem; line-height: 1.6; margin-bottom: 1rem;">${publisher.description || 'Leading publishing partner with BookMart.'}</p>
        <div style="font-size: 0.9rem; font-weight: 700; color: var(--primary-color);">
          📚 ${publisher.bookCount || 0} Total Titles Published
        </div>
      </div>
    </div>
  `;

  // Fetch publisher books
  let publisherBooks = [];
  try {
    const q = query(collection(db, "books"), where("publisherId", "==", publisher.id));
    const qSnap = await getDocs(q);
    if (!qSnap.empty) {
      qSnap.forEach(docSnap => publisherBooks.push({ id: docSnap.id, ...docSnap.data() }));
    }
  } catch (err) {
    console.warn("Firestore publisher books fetch error:", err);
  }

  if (publisherBooks.length === 0) {
    publisherBooks = sampleBooks.filter(b => b.publisherId === publisher.id || b.publisherName.toLowerCase() === publisher.name.toLowerCase());
  }

  if (publisherBooks.length === 0) {
    booksContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">📚</div>
        <h3>No Books Listed</h3>
        <p>No books currently available from ${publisher.name}.</p>
      </div>
    `;
    return;
  }

  booksContainer.innerHTML = publisherBooks.map(book => createBookCardHtml(book)).join('');
}
