// ==========================================================================
// BookMart - Customer Order History & Tracking Handler (js/orders.js)
// ==========================================================================

import { collection, query, where, getDocs, doc, getDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import { formatCurrency, formatDate, renderStarRating, showToast } from "./utils.js";
import { requireCustomerAuth } from "./auth-guard.js";

/**
 * Fetch customer orders from Firestore
 * @param {string} customerId 
 * @returns {Promise<Array>}
 */
export async function fetchCustomerOrders(customerId) {
  if (!customerId) return [];

  try {
    const q = query(
      collection(db, "orders"),
      where("customerId", "==", customerId)
    );
    const qSnap = await getDocs(q);
    const orders = [];
    qSnap.forEach(docSnap => {
      orders.push({ id: docSnap.id, ...docSnap.data() });
    });
    // Sort newest first
    return orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  } catch (err) {
    console.warn("Orders fetch error:", err);
    return [];
  }
}

/**
 * Fetch single order by Order ID
 * @param {string} orderId 
 * @returns {Promise<Object|null>}
 */
export async function fetchOrderById(orderId) {
  if (!orderId) return null;

  try {
    const docRef = doc(db, "orders", orderId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
  } catch (err) {
    console.warn("Order fetch error:", err);
  }
  return null;
}

/**
 * Render Customer Order History List Page
 */
export async function renderOrdersHistoryPage() {
  requireCustomerAuth();

  const container = document.getElementById("orders-history-container");
  if (!container) return;

  const user = auth.currentUser;
  if (!user) return;

  container.innerHTML = `
    <div style="padding: 2rem; text-align: center;">
      <div class="skeleton" style="width: 100%; height: 200px; border-radius: var(--radius-lg);"></div>
    </div>
  `;

  const orders = await fetchCustomerOrders(user.uid);

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <h3>No Orders Placed Yet</h3>
        <p>You haven't placed any book orders with BookMart yet.</p>
        <a href="/books.html" class="btn btn-primary">Start Shopping</a>
      </div>
    `;
    return;
  }

  const statusBadgeMap = {
    Pending: 'badge-warning',
    Confirmed: 'badge-info',
    Processing: 'badge-info',
    Shipped: 'badge-secondary',
    Delivered: 'badge-success',
    Cancelled: 'badge-discount'
  };

  container.innerHTML = `
    <div class="cart-table-wrap">
      <table class="cart-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(ord => `
            <tr>
              <td style="font-weight:700;color:var(--primary-color);">${ord.orderId || ord.id}</td>
              <td style="font-size:0.85rem;color:var(--text-muted);">${formatDate(ord.createdAt)}</td>
              <td>${(ord.items || []).length} Book(s)</td>
              <td style="font-weight:700;">${formatCurrency(ord.total)}</td>
              <td>
                <span class="badge ${statusBadgeMap[ord.orderStatus] || 'badge-secondary'}">${ord.orderStatus}</span>
              </td>
              <td>
                <a href="/order-details.html?id=${ord.orderId || ord.id}" class="btn btn-sm btn-outline">Track Order</a>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Render Order Tracking & Details Page
 * @param {string} orderId 
 */
export async function renderOrderTrackingPage(orderId) {
  requireCustomerAuth();

  const container = document.getElementById("order-tracking-content");
  if (!container) return;

  const order = await fetchOrderById(orderId);

  if (!order) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>Order Not Found</h3>
        <p>Could not locate details for Order ID "${orderId}".</p>
        <a href="/orders.html" class="btn btn-primary">View My Orders</a>
      </div>
    `;
    return;
  }

  document.title = `Order #${order.orderId || order.id} - BookMart Tracking`;

  const steps = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];
  const currentStepIdx = steps.indexOf(order.orderStatus);

  container.innerHTML = `
    <div style="background-color: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius-lg); padding: 2.5rem; margin-bottom: 2rem;">
      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;flex-wrap:wrap;gap:1rem;padding-bottom:1.5rem;border-bottom:1px solid var(--card-border);">
        <div>
          <span class="badge badge-info" style="margin-bottom:0.5rem;">Order Details</span>
          <h1 style="font-size: 1.8rem; margin-bottom: 0.25rem;">Order #${order.orderId || order.id}</h1>
          <div style="font-size:0.9rem;color:var(--text-muted);">Placed on ${formatDate(order.createdAt)} • Payment Method: <strong>${order.paymentMethod || 'Cash on Delivery'}</strong></div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.25rem;">Current Status</div>
          <span class="badge ${order.orderStatus === 'Delivered' ? 'badge-success' : order.orderStatus === 'Cancelled' ? 'badge-discount' : 'badge-warning'}" style="font-size:1rem;padding:0.4rem 1rem;">
            ${order.orderStatus}
          </span>
        </div>
      </div>

      <!-- Stepper Timeline -->
      ${order.orderStatus === 'Cancelled' ? `
        <div class="empty-state" style="padding:2rem;background:rgba(239, 68, 68, 0.05);border-color:var(--danger-color);margin-bottom:2.5rem;">
          <h3 style="color:var(--danger-color);">Order Cancelled</h3>
          <p>This order was cancelled and will not be processed further.</p>
        </div>
      ` : `
        <div style="margin-bottom:3rem;">
          <h3 style="font-size:1.1rem;margin-bottom:1.5rem;">Order Delivery Progress</h3>
          <div class="tracking-timeline">
            ${steps.map((step, idx) => {
              const isCompleted = idx < currentStepIdx;
              const isActive = idx === currentStepIdx;
              return `
                <div class="timeline-step ${isCompleted ? 'completed' : isActive ? 'active' : ''}">
                  <div class="step-icon">${isCompleted ? '✓' : idx + 1}</div>
                  <div style="font-size:0.85rem;font-weight:${isActive || isCompleted ? '700' : '500'};color:${isActive ? 'var(--secondary-color)' : isCompleted ? 'var(--accent-color)' : 'var(--text-muted)'};">${step}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `}

      <!-- Details Breakdown Grid -->
      <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:2.5rem;">
        <!-- Purchased Items -->
        <div>
          <h3 style="font-size:1.15rem;margin-bottom:1rem;">Ordered Items</h3>
          <div style="border:1px solid var(--border-light);border-radius:var(--radius-md);overflow:hidden;">
            ${(order.items || []).map(item => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:1rem;border-bottom:1px solid var(--border-light);">
                <div style="display:flex;align-items:center;gap:1rem;">
                  <img src="${item.coverImage}" alt="${item.title}" style="width:44px;height:60px;object-fit:cover;border-radius:var(--radius-sm);">
                  <div>
                    <div style="font-weight:700;font-size:0.95rem;">${item.title}</div>
                    <div style="font-size:0.85rem;color:var(--text-muted);">Qty: ${item.quantity} × ${formatCurrency(item.price)}</div>
                  </div>
                </div>
                <div style="font-weight:700;color:var(--primary-color);">${formatCurrency(item.price * item.quantity)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Shipping & Payment Breakdown -->
        <div>
          <h3 style="font-size:1.15rem;margin-bottom:1rem;">Shipping & Payment Summary</h3>
          <div style="background:var(--border-light);padding:1.5rem;border-radius:var(--radius-md);">
            <div style="margin-bottom:1.25rem;">
              <div style="font-weight:700;font-size:0.9rem;margin-bottom:0.25rem;">Shipping Address</div>
              <div style="font-size:0.85rem;color:var(--text-muted);line-height:1.5;">
                ${order.shippingAddress?.fullName}<br>
                ${order.shippingAddress?.address}<br>
                ${order.shippingAddress?.city}, ${order.shippingAddress?.province} ${order.shippingAddress?.postalCode}<br>
                📞 ${order.shippingAddress?.phone}
              </div>
            </div>

            <div style="border-top:1px solid var(--card-border);padding-top:1rem;">
              <div class="summary-row"><span>Subtotal:</span> <span>${formatCurrency(order.subtotal)}</span></div>
              <div class="summary-row"><span>Shipping:</span> <span>${order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee)}</span></div>
              ${order.discount ? `<div class="summary-row" style="color:var(--accent-color);"><span>Discount (${order.couponCode || 'Promo'}):</span> <span>-${formatCurrency(order.discount)}</span></div>` : ''}
              <div class="summary-row total" style="margin-bottom:0;"><span>Total Paid (COD):</span> <span>${formatCurrency(order.total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
