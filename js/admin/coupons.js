// ==========================================================================
// BookMart - Admin Coupon Management Controller (js/admin/coupons.js)
// ==========================================================================

import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "../firebase-config.js";
import { formatCurrency, showToast } from "../utils.js";
import { sampleCoupons } from "../seed-data.js";

export async function fetchAdminCoupons() {
  try {
    const qSnap = await getDocs(collection(db, "coupons"));
    if (!qSnap.empty) {
      const coupons = [];
      qSnap.forEach(d => coupons.push({ id: d.id, ...d.data() }));
      return coupons;
    }
  } catch (err) {
    console.warn("Fetch admin coupons error:", err);
  }
  return sampleCoupons;
}

export async function renderAdminCouponsTable() {
  const container = document.getElementById("admin-coupons-table-body");
  if (!container) return;

  const coupons = await fetchAdminCoupons();

  container.innerHTML = coupons.map(c => `
    <tr>
      <td style="font-weight:800;color:var(--secondary-color);">${c.code}</td>
      <td>${c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `${formatCurrency(c.discountValue)} OFF`}</td>
      <td>${formatCurrency(c.minOrder || 0)}</td>
      <td>${c.usageCount || 0} / ${c.usageLimit || '∞'}</td>
      <td>
        <span class="badge ${c.active ? 'badge-success' : 'badge-secondary'}">
          ${c.active ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </td>
      <td>
        <div style="display:flex;gap:0.5rem;">
          <button class="btn btn-sm ${c.active ? 'btn-outline' : 'btn-accent'}" onclick="window.handleToggleCoupon('${c.id}', ${!c.active})">
            ${c.active ? 'Deactivate' : 'Activate'}
          </button>
          <button class="btn btn-sm btn-danger" onclick="window.handleDeleteCoupon('${c.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

export async function saveAdminCoupon(code, type, value, minOrder, maxDiscount) {
  try {
    const coupId = `coup-${Date.now()}`;
    await setDoc(doc(db, "coupons", coupId), {
      code: code.trim().toUpperCase(),
      discountType: type,
      discountValue: Number(value),
      minOrder: Number(minOrder || 0),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      expirationDate: "2030-12-31",
      usageLimit: 1000,
      usageCount: 0,
      active: true,
      createdAt: serverTimestamp()
    });
    showToast(`Coupon "${code}" created successfully!`, "success");
    return true;
  } catch (err) {
    console.error("Save coupon error:", err);
    showToast("Failed to save coupon.", "error");
    return false;
  }
}

window.handleToggleCoupon = async (id, newActive) => {
  try {
    await updateDoc(doc(db, "coupons", id), { active: newActive });
    showToast("Coupon status updated!", "info");
    renderAdminCouponsTable();
  } catch (err) {
    console.error("Toggle coupon error:", err);
  }
};

window.handleDeleteCoupon = async (id) => {
  if (confirm("Delete this coupon code?")) {
    await deleteDoc(doc(db, "coupons", id));
    showToast("Coupon deleted", "info");
    renderAdminCouponsTable();
  }
};
