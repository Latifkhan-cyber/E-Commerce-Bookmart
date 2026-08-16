// ==========================================================================
// BookMart - Admin Book CRUD Controller (js/admin/books.js)
// ==========================================================================

import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { db, storage } from "../firebase-config.js";
import { formatCurrency, showToast } from "../utils.js";
import { sampleBooks } from "../seed-data.js";

/**
 * Fetch all books for Admin table
 * @returns {Promise<Array>}
 */
export async function fetchAdminBooks() {
  try {
    const qSnap = await getDocs(collection(db, "books"));
    if (!qSnap.empty) {
      const books = [];
      qSnap.forEach(d => books.push({ id: d.id, ...d.data() }));
      return books;
    }
  } catch (err) {
    console.warn("Fetch admin books error:", err);
  }
  return sampleBooks;
}

/**
 * Render Admin Books Management Table
 */
export async function renderAdminBooksTable() {
  const container = document.getElementById("admin-books-table-body");
  if (!container) return;

  const books = await fetchAdminBooks();

  if (books.length === 0) {
    container.innerHTML = `<tr><td colspan="7" style="text-align:center;">No books found in catalog.</td></tr>`;
    return;
  }

  container.innerHTML = books.map(b => `
    <tr>
      <td>
        <img src="${b.coverImage}" alt="${b.title}" style="width:40px;height:52px;object-fit:cover;border-radius:var(--radius-sm);">
      </td>
      <td>
        <div style="font-weight:700;">${b.title}</div>
        <div style="font-size:0.8rem;color:var(--text-muted);">ISBN: ${b.isbn || 'N/A'}</div>
      </td>
      <td>${b.authorName}</td>
      <td>${b.categoryName}</td>
      <td style="font-weight:700;">${formatCurrency(b.discountPrice || b.price)}</td>
      <td>
        <span class="badge ${ (b.stock || 0) > 5 ? 'badge-success' : (b.stock || 0) > 0 ? 'badge-warning' : 'badge-discount'}">
          ${b.stock || 0} in stock
        </span>
      </td>
      <td>
        <div style="display:flex;gap:0.5rem;">
          <a href="/admin/book-edit.html?id=${b.id}" class="btn btn-sm btn-outline">Edit</a>
          <button class="btn btn-sm btn-danger" onclick="window.handleDeleteBook('${b.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Create or Edit Book
 * @param {Object} formData 
 * @param {File} coverFile 
 * @param {string|null} existingBookId 
 */
export async function saveAdminBook(formData, coverFile, existingBookId = null) {
  try {
    let coverUrl = formData.coverImage || "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&q=80";

    // Upload Cover Image to Firebase Storage if a new file selected
    if (coverFile) {
      const storageRef = ref(storage, `books/${Date.now()}_${coverFile.name}`);
      const uploadSnap = await uploadBytes(storageRef, coverFile);
      coverUrl = await getDownloadURL(uploadSnap.ref);
    }

    const bookId = existingBookId || `book-${Date.now()}`;

    const bookData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      authorId: formData.authorId,
      authorName: formData.authorName,
      publisherId: formData.publisherId,
      publisherName: formData.publisherName,
      categoryId: formData.categoryId,
      categoryName: formData.categoryName,
      isbn: formData.isbn.trim(),
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
      stock: Number(formData.stock),
      pages: Number(formData.pages || 300),
      language: formData.language || "English",
      publicationYear: Number(formData.publicationYear || 2023),
      coverImage: coverUrl,
      updatedAt: serverTimestamp()
    };

    if (!existingBookId) {
      bookData.soldCount = 0;
      bookData.rating = 5.0;
      bookData.reviewCount = 0;
      bookData.createdAt = serverTimestamp();
    }

    await setDoc(doc(db, "books", bookId), bookData, { merge: true });
    showToast(`Book "${formData.title}" saved successfully!`, "success");
    return true;
  } catch (err) {
    console.error("Save book error:", err);
    showToast("Failed to save book record.", "error");
    return false;
  }
}

/**
 * Delete Book from Firestore
 * @param {string} bookId 
 */
export async function deleteAdminBook(bookId) {
  if (!confirm("Are you sure you want to delete this book?")) return false;

  try {
    await deleteDoc(doc(db, "books", bookId));
    showToast("Book deleted successfully", "info");
    return true;
  } catch (err) {
    console.error("Delete book error:", err);
    showToast("Failed to delete book.", "error");
    return false;
  }
}

window.handleDeleteBook = async (bookId) => {
  const success = await deleteAdminBook(bookId);
  if (success) renderAdminBooksTable();
};
