// ==========================================================================
// BookMart - Admin Inventory Controller (js/admin/inventory.js)
// ==========================================================================

import { collection, getDocs, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "../firebase-config.js";
import { showToast } from "../utils.js";
import { sampleBooks } from "../seed-data.js";

export async function renderAdminInventoryTable() {
  const container = document.getElementById("admin-inventory-table-body");
  if (!container) return;

  let books = [];
  try {
    const qSnap = await getDocs(collection(db, "books"));
    qSnap.forEach(d => books.push({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("Fetch inventory error:", err);
  }

  if (books.length === 0) books = sampleBooks;

  container.innerHTML = books.map(b => `
    <tr>
      <td>
        <div style="font-weight:700;">${b.title}</div>
        <div style="font-size:0.8rem;color:var(--text-muted);">${b.categoryName}</div>
      </td>
      <td>${b.soldCount || 0} copies</td>
      <td>
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <input type="number" id="inv-stock-${b.id}" value="${b.stock || 0}" class="form-input" style="width:90px;padding:0.35rem;font-weight:700;">
          <button class="btn btn-sm btn-primary" onclick="window.handleQuickUpdateStock('${b.id}')">Save</button>
        </div>
      </td>
      <td>
        <span class="badge ${(b.stock || 0) > 5 ? 'badge-success' : (b.stock || 0) > 0 ? 'badge-warning' : 'badge-discount'}">
          ${(b.stock || 0) > 5 ? 'IN STOCK' : (b.stock || 0) > 0 ? 'LOW STOCK' : 'OUT OF STOCK'}
        </span>
      </td>
    </tr>
  `).join('');
}

window.handleQuickUpdateStock = async (bookId) => {
  const input = document.getElementById(`inv-stock-${bookId}`);
  if (!input) return;

  const newStock = parseInt(input.value);
  if (isNaN(newStock) || newStock < 0) {
    showToast("Please enter a valid non-negative stock number.", "warning");
    return;
  }

  try {
    await updateDoc(doc(db, "books", bookId), {
      stock: newStock,
      updatedAt: serverTimestamp()
    });
    showToast("Stock quantity updated successfully!", "success");
    renderAdminInventoryTable();
  } catch (err) {
    console.error("Update stock error:", err);
    showToast("Failed to update stock in Firestore.", "error");
  }
};
