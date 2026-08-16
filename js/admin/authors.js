// ==========================================================================
// BookMart - Admin Author Controller (js/admin/authors.js)
// ==========================================================================

import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "../firebase-config.js";
import { showToast } from "../utils.js";
import { sampleAuthors } from "../seed-data.js";

export async function fetchAdminAuthors() {
  try {
    const qSnap = await getDocs(collection(db, "authors"));
    if (!qSnap.empty) {
      const authors = [];
      qSnap.forEach(d => authors.push({ id: d.id, ...d.data() }));
      return authors;
    }
  } catch (err) {
    console.warn("Fetch admin authors error:", err);
  }
  return sampleAuthors;
}

export async function renderAdminAuthorsTable() {
  const container = document.getElementById("admin-authors-table-body");
  if (!container) return;

  const authors = await fetchAdminAuthors();

  container.innerHTML = authors.map(a => `
    <tr>
      <td><img src="${a.image}" alt="${a.name}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;"></td>
      <td style="font-weight:700;">${a.name}</td>
      <td style="font-size:0.85rem;color:var(--text-muted);">${(a.bio || '').substring(0, 60)}...</td>
      <td style="font-weight:600;">${a.bookCount || 0} Works</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="window.handleDeleteAuthor('${a.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

export async function saveAdminAuthor(name, bio, image) {
  try {
    const authId = `auth-${Date.now()}`;
    await setDoc(doc(db, "authors", authId), {
      name: name.trim(),
      bio: bio.trim(),
      image: image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
      bookCount: 0,
      createdAt: serverTimestamp()
    });
    showToast(`Author "${name}" created!`, "success");
    return true;
  } catch (err) {
    console.error("Save author error:", err);
    showToast("Failed to save author.", "error");
    return false;
  }
}

window.handleDeleteAuthor = async (id) => {
  if (confirm("Delete this author?")) {
    await deleteDoc(doc(db, "authors", id));
    showToast("Author record deleted", "info");
    renderAdminAuthorsTable();
  }
};
