// ==========================================================================
// BookMart - Admin Publisher Controller (js/admin/publishers.js)
// ==========================================================================

import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "../firebase-config.js";
import { showToast } from "../utils.js";
import { samplePublishers } from "../seed-data.js";

export async function fetchAdminPublishers() {
  try {
    const qSnap = await getDocs(collection(db, "publishers"));
    if (!qSnap.empty) {
      const pubs = [];
      qSnap.forEach(d => pubs.push({ id: d.id, ...d.data() }));
      return pubs;
    }
  } catch (err) {
    console.warn("Fetch admin publishers error:", err);
  }
  return samplePublishers;
}

export async function renderAdminPublishersTable() {
  const container = document.getElementById("admin-publishers-table-body");
  if (!container) return;

  const publishers = await fetchAdminPublishers();

  container.innerHTML = publishers.map(p => `
    <tr>
      <td><img src="${p.logo}" alt="${p.name}" style="width:40px;height:40px;object-fit:contain;"></td>
      <td style="font-weight:700;">${p.name}</td>
      <td style="font-size:0.85rem;color:var(--text-muted);">${(p.description || '').substring(0, 60)}...</td>
      <td style="font-weight:600;">${p.bookCount || 0} Titles</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="window.handleDeletePublisher('${p.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

export async function saveAdminPublisher(name, description, logo) {
  try {
    const pubId = `pub-${Date.now()}`;
    await setDoc(doc(db, "publishers", pubId), {
      name: name.trim(),
      description: description.trim(),
      logo: logo || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80",
      bookCount: 0,
      createdAt: serverTimestamp()
    });
    showToast(`Publisher "${name}" created!`, "success");
    return true;
  } catch (err) {
    console.error("Save publisher error:", err);
    showToast("Failed to save publisher.", "error");
    return false;
  }
}

window.handleDeletePublisher = async (id) => {
  if (confirm("Delete this publisher?")) {
    await deleteDoc(doc(db, "publishers", id));
    showToast("Publisher record deleted", "info");
    renderAdminPublishersTable();
  }
};
