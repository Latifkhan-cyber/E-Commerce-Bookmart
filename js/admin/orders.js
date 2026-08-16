// ==========================================================================
// BookMart - Admin Order Management Controller (js/admin/orders.js)
// ==========================================================================

import { collection, getDocs, doc, updateDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "../firebase-config.js";
import { formatCurrency, formatDate, showToast } from "../utils.js";

export async function fetchAdminOrders() {
  try {
    const qSnap = await getDocs(collection(db, "orders"));
    const orders = [];
    qSnap.forEach(d => orders.push({ id: d.id, ...d.data() }));
    return orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  } catch (err) {
    console.warn("Fetch admin orders error:", err);
    return [];
  }
}

export async function renderAdminOrdersTable(statusFilter = "all") {
  const container = document.getElementById("admin-orders-table-body");
  if (!container) return;

  const orders = await fetchAdminOrders();
  const filtered = statusFilter === "all" ? orders : orders.filter(o => o.orderStatus === statusFilter);

  if (filtered.length === 0) {
    container.innerHTML = `<tr><td colspan="7" style="text-align:center;">No orders found.</td></tr>`;
    return;
  }

  container.innerHTML = filtered.map(o => `
    <tr>
      <td style="font-weight:700;">${o.orderId || o.id}</td>
      <td>
        <div style="font-weight:600;">${o.customerName || 'Customer'}</div>
        <div style="font-size:0.8rem;color:var(--text-muted);">${o.customerEmail}</div>
      </td>
      <td style="font-size:0.85rem;">${formatDate(o.createdAt)}</td>
      <td style="font-weight:700;">${formatCurrency(o.total)}</td>
      <td>
        <select class="form-select" style="padding:0.25rem 0.5rem;font-size:0.85rem;" onchange="window.handleUpdatePaymentStatus('${o.id}', this.value)">
          <option value="Pending" ${o.paymentStatus === 'Pending' ? 'selected' : ''}>Pending (COD)</option>
          <option value="Paid" ${o.paymentStatus === 'Paid' ? 'selected' : ''}>Paid</option>
        </select>
      </td>
      <td>
        <select class="form-select" style="padding:0.25rem 0.5rem;font-size:0.85rem;" onchange="window.handleUpdateOrderStatus('${o.id}', this.value)">
          <option value="Pending" ${o.orderStatus === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Confirmed" ${o.orderStatus === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="Processing" ${o.orderStatus === 'Processing' ? 'selected' : ''}>Processing</option>
          <option value="Shipped" ${o.orderStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
          <option value="Delivered" ${o.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
          <option value="Cancelled" ${o.orderStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td>
        <a href="/admin/order-details.html?id=${o.orderId || o.id}" class="btn btn-sm btn-outline">Details</a>
      </td>
    </tr>
  `).join('');
}

window.handleUpdateOrderStatus = async (orderId, newStatus) => {
  try {
    await updateDoc(doc(db, "orders", orderId), {
      orderStatus: newStatus,
      updatedAt: serverTimestamp()
    });
    showToast(`Order #${orderId} status updated to ${newStatus}!`, "success");
  } catch (err) {
    console.error("Update status error:", err);
    showToast("Failed to update order status.", "error");
  }
};

window.handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
  try {
    await updateDoc(doc(db, "orders", orderId), {
      paymentStatus: newPaymentStatus,
      updatedAt: serverTimestamp()
    });
    showToast(`Payment status updated to ${newPaymentStatus}!`, "success");
  } catch (err) {
    console.error("Payment status update error:", err);
  }
};
