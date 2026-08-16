// ==========================================================================
// BookMart - Admin Category Controller (js/admin/categories.js)
// ==========================================================================

import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "../firebase-config.js";
import { showToast } from "../utils.js";
import { sampleCategories } from "../seed-data.js";

export async function fetchAdminCategories() {
  try {
    const qSnap = await getDocs(collection(db, "categories"));
    if (!qSnap.empty) {
      const cats = [];
      qSnap.forEach(d => cats.push({ id: d.id, ...d.data() }));
      return cats;
    }
  } catch (err) {
    console.warn("Fetch admin categories error:", err);
  }
  return sampleCategories;
}

export async function renderAdminCategoriesTable() {
  const container = document.getElementById("admin-categories-table-body");
  if (!container) return;

  const categories = await fetchAdminCategories();

  container.innerHTML = categories.map(c => `
    <tr>
      <td><img src="${c.image}" alt="${c.name}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;"></td>
      <td style="font-weight:700;">${c.name}</td>
      <td style="font-size:0.85rem;color:var(--text-muted);">${c.slug}</td>
      <td style="font-weight:600;">${c.bookCount || 0} Books</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="window.handleDeleteCategory('${c.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

export async function saveAdminCategory(name, slug, description, image) {
  try {
    const catId = `cat-${Date.now()}`;
    await setDoc(doc(db, "categories", catId), {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description.trim(),
      image: image || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80",
      bookCount: 0,
      createdAt: serverTimestamp()
    });
    showToast(`Category "${name}" created!`, "success");
    return true;
  } catch (err) {
    console.error("Save category error:", err);
    showToast("Failed to save category.", "error");
    return false;
  }
}

window.handleDeleteCategory = async (id) => {
  if (confirm("Delete this category?")) {
    await deleteDoc(doc(db, "categories", id));
    showToast("Category deleted", "info");
    renderAdminCategoriesTable();
  }
};
