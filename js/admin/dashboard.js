// ==========================================================================
// BookMart - Admin Dashboard Controller (js/admin/dashboard.js)
// ==========================================================================

import { collection, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "../firebase-config.js";
import { formatCurrency, formatDate } from "../utils.js";
import { sampleBooks } from "../seed-data.js";

export async function loadAdminDashboardMetrics() {
  try {
    // 1. Fetch Books
    const booksSnap = await getDocs(collection(db, "books"));
    const books = [];
    booksSnap.forEach(d => books.push({ id: d.id, ...d.data() }));
    const activeBooks = books.length > 0 ? books : sampleBooks;

    // 2. Fetch Orders
    const ordersSnap = await getDocs(collection(db, "orders"));
    const orders = [];
    ordersSnap.forEach(d => orders.push({ id: d.id, ...d.data() }));

    // 3. Fetch Customers
    const usersSnap = await getDocs(collection(db, "users"));
    const customers = [];
    usersSnap.forEach(d => {
      const u = d.data();
      if (u.role === "CUSTOMER") customers.push(u);
    });

    // Metrics calculations
    const totalBooks = activeBooks.length;
    const totalCustomers = customers.length;
    const totalOrders = orders.length;

    const totalRevenue = orders
      .filter(o => o.orderStatus !== "Cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const pendingOrders = orders.filter(o => o.orderStatus === "Pending" || o.orderStatus === "Processing").length;
    const deliveredOrders = orders.filter(o => o.orderStatus === "Delivered").length;
    const lowStockBooks = activeBooks.filter(b => (b.stock || 0) <= 5);

    // Update Card Values
    const totalBooksEl = document.getElementById("admin-stat-books");
    const totalCustomersEl = document.getElementById("admin-stat-customers");
    const totalOrdersEl = document.getElementById("admin-stat-orders");
    const totalRevenueEl = document.getElementById("admin-stat-revenue");
    const pendingOrdersEl = document.getElementById("admin-stat-pending");
    const deliveredOrdersEl = document.getElementById("admin-stat-delivered");
    const lowStockEl = document.getElementById("admin-stat-lowstock");

    if (totalBooksEl) totalBooksEl.textContent = totalBooks;
    if (totalCustomersEl) totalCustomersEl.textContent = totalCustomers;
    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(totalRevenue);
    if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
    if (deliveredOrdersEl) deliveredOrdersEl.textContent = deliveredOrders;
    if (lowStockEl) lowStockEl.textContent = lowStockBooks.length;

    // Render Recent Orders Table
    renderRecentOrdersTable(orders.slice(0, 5));

    // Render Low Stock Table
    renderLowStockTable(lowStockBooks);

  } catch (err) {
    console.error("Dashboard metrics error:", err);
  }
}

function renderRecentOrdersTable(recentOrders) {
  const container = document.getElementById("recent-orders-table-body");
  if (!container) return;

  if (recentOrders.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">No orders recorded yet.</td></tr>`;
    return;
  }

  container.innerHTML = recentOrders.map(o => `
    <tr>
      <td style="font-weight:700;">${o.orderId || o.id}</td>
      <td>${o.customerName || 'Customer'}</td>
      <td>${formatDate(o.createdAt)}</td>
      <td style="font-weight:700;">${formatCurrency(o.total)}</td>
      <td><span class="badge ${o.orderStatus === 'Delivered' ? 'badge-success' : 'badge-warning'}">${o.orderStatus}</span></td>
      <td><a href="/admin/order-details.html?id=${o.orderId || o.id}" class="btn btn-sm btn-outline">View</a></td>
    </tr>
  `).join('');
}

function renderLowStockTable(lowStockBooks) {
  const container = document.getElementById("low-stock-table-body");
  if (!container) return;

  if (lowStockBooks.length === 0) {
    container.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--accent-color);font-weight:600;">✓ All book stock levels healthy!</td></tr>`;
    return;
  }

  container.innerHTML = lowStockBooks.map(b => `
    <tr>
      <td style="font-weight:600;">${b.title}</td>
      <td>${b.categoryName || 'General'}</td>
      <td style="font-weight:700;color:var(--danger-color);">${b.stock || 0} left</td>
      <td><a href="/admin/book-edit.html?id=${b.id}" class="btn btn-sm btn-accent">Update Stock</a></td>
    </tr>
  `).join('');
}
