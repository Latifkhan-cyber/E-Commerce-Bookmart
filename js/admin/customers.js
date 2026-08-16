// ==========================================================================
// BookMart - Admin Customer Management Controller (js/admin/customers.js)
// ==========================================================================

import { collection, getDocs, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "../firebase-config.js";
import { formatCurrency, formatDate, showToast } from "../utils.js";

export async function fetchAdminCustomers() {
  try {
    const qSnap = await getDocs(collection(db, "users"));
    const customers = [];
    qSnap.forEach(d => {
      const u = d.data();
      if (u.role === "CUSTOMER") customers.push({ id: d.id, ...u });
    });
    return customers;
  } catch (err) {
    console.warn("Fetch customers error:", err);
    return [];
  }
}

export async function renderAdminCustomersTable() {
  const container = document.getElementById("admin-customers-table-body");
  if (!container) return;

  const customers = await fetchAdminCustomers();

  if (customers.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center;">No registered customers found.</td></tr>`;
    return;
  }

  container.innerHTML = customers.map(c => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <img src="${c.profileImage || 'https://ui-avatars.com/api/?name=User'}" alt="${c.name}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">
          <div>
            <div style="font-weight:700;">${c.name}</div>
            <div style="font-size:0.8rem;color:var(--text-muted);">${c.email}</div>
          </div>
        </div>
      </td>
      <td>${c.phone || 'N/A'}</td>
      <td>${formatDate(c.createdAt)}</td>
      <td>
        <span class="badge ${c.isBlocked ? 'badge-discount' : 'badge-success'}">
          ${c.isBlocked ? 'BLOCKED' : 'ACTIVE'}
        </span>
      </td>
      <td>
        <button class="btn btn-sm ${c.isBlocked ? 'btn-accent' : 'btn-danger'}" onclick="window.handleToggleBlockCustomer('${c.id}', ${!c.isBlocked})">
          ${c.isBlocked ? 'Unblock' : 'Block User'}
        </button>
      </td>
    </tr>
  `).join('');
}

window.handleToggleBlockCustomer = async (userId, blockStatus) => {
  const actionText = blockStatus ? "block" : "unblock";
  if (!confirm(`Are you sure you want to ${actionText} this customer?`)) return;

  try {
    await updateDoc(doc(db, "users", userId), {
      isBlocked: blockStatus,
      updatedAt: serverTimestamp()
    });
    showToast(`Customer account ${actionText}ed successfully!`, "info");
    renderAdminCustomersTable();
  } catch (err) {
    console.error("Block customer error:", err);
    showToast(`Failed to ${actionText} customer.`, "error");
  }
};
