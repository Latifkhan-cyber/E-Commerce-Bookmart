// ==========================================================================
// BookMart - Checkout & Order Creation Engine (js/checkout.js)
// ==========================================================================

import { collection, doc, getDoc, setDoc, addDoc, updateDoc, increment, serverTimestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import { getCartItems, clearCart } from "./cart.js";
import { fetchBookById } from "./books.js";
import { formatCurrency, showToast, generateOrderId } from "./utils.js";
import { requireCustomerAuth } from "./auth-guard.js";

export class CheckoutManager {
  constructor() {
    this.cartItems = [];
    this.populatedItems = [];
    this.subtotal = 0;
    this.shippingFee = 0;
    this.discountAmount = 0;
    this.appliedCoupon = null;
    this.savedAddresses = [];
    this.selectedAddress = null;
  }

  async init() {
    requireCustomerAuth();
    this.cartItems = await getCartItems();

    if (this.cartItems.length === 0) {
      showToast("Your cart is empty. Please add books before checkout.", "warning");
      setTimeout(() => { window.location.href = "/books.html"; }, 800);
      return;
    }

    await this.loadCartDetails();
    await this.loadSavedAddresses();
    this.render();
    this.setupListeners();
  }

  async loadCartDetails() {
    this.populatedItems = [];
    this.subtotal = 0;

    for (const item of this.cartItems) {
      const book = await fetchBookById(item.bookId);
      if (book) {
        // Stock validation check
        if ((book.stock || 0) < item.quantity) {
          showToast(`Note: "${book.title}" only has ${book.stock} units in stock. Adjusting quantity.`, "warning");
          item.quantity = Math.max(1, book.stock);
        }

        const purchasePrice = book.discountPrice || book.price;
        const itemSubtotal = purchasePrice * item.quantity;
        this.subtotal += itemSubtotal;

        this.populatedItems.push({
          bookId: book.id,
          title: book.title,
          coverImage: book.coverImage,
          authorName: book.authorName,
          price: purchasePrice,
          quantity: item.quantity,
          itemSubtotal
        });
      }
    }

    this.shippingFee = this.subtotal > 50 ? 0 : 5.00;
  }

  async loadSavedAddresses() {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(collection(db, "addresses"), where("userId", "==", user.uid));
      const qSnap = await getDocs(q);
      this.savedAddresses = [];
      qSnap.forEach(docSnap => {
        this.savedAddresses.push({ id: docSnap.id, ...docSnap.data() });
      });
    } catch (err) {
      console.warn("Addresses load error:", err);
    }
  }

  render() {
    const orderItemsContainer = document.getElementById("checkout-items-summary");
    const totalsContainer = document.getElementById("checkout-totals-summary");
    const addressGridContainer = document.getElementById("saved-addresses-grid");

    if (orderItemsContainer) {
      orderItemsContainer.innerHTML = this.populatedItems.map(item => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem 0;border-bottom:1px solid var(--border-light);font-size:0.9rem;">
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <img src="${item.coverImage}" alt="${item.title}" style="width:36px;height:48px;object-fit:cover;border-radius:var(--radius-sm);">
            <div>
              <div style="font-weight:700;line-height:1.2;">${item.title}</div>
              <div style="font-size:0.8rem;color:var(--text-muted);">Qty: ${item.quantity} × ${formatCurrency(item.price)}</div>
            </div>
          </div>
          <div style="font-weight:700;">${formatCurrency(item.itemSubtotal)}</div>
        </div>
      `).join('');
    }

    this.updateTotalsUI();

    // Render Saved Addresses Cards if available
    if (addressGridContainer && this.savedAddresses.length > 0) {
      addressGridContainer.innerHTML = this.savedAddresses.map((addr, idx) => `
        <div class="address-card ${idx === 0 ? 'selected' : ''}" data-address-id="${addr.id}">
          <div style="font-weight:700;margin-bottom:0.25rem;">${addr.fullName} ${addr.isDefault ? '<span class="badge badge-success">Default</span>' : ''}</div>
          <div style="font-size:0.85rem;color:var(--text-muted);">${addr.phone}</div>
          <div style="font-size:0.85rem;margin-top:0.35rem;">${addr.address}, ${addr.city}, ${addr.province} ${addr.postalCode}</div>
        </div>
      `).join('');

      this.selectedAddress = this.savedAddresses[0];
      this.populateAddressForm(this.selectedAddress);
    }
  }

  updateTotalsUI() {
    const total = Math.max(0, this.subtotal + this.shippingFee - this.discountAmount);

    const totalsContainer = document.getElementById("checkout-totals-summary");
    if (totalsContainer) {
      totalsContainer.innerHTML = `
        <div class="summary-row">
          <span>Subtotal</span>
          <span>${formatCurrency(this.subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping Fee</span>
          <span>${this.shippingFee === 0 ? '<span style="color:var(--accent-color);font-weight:700;">FREE</span>' : formatCurrency(this.shippingFee)}</span>
        </div>
        ${this.discountAmount > 0 ? `
          <div class="summary-row" style="color:var(--accent-color);font-weight:600;">
            <span>Discount (${this.appliedCoupon ? this.appliedCoupon.code : ''})</span>
            <span>-${formatCurrency(this.discountAmount)}</span>
          </div>
        ` : ''}
        <div class="summary-row total">
          <span>Total Payable</span>
          <span>${formatCurrency(total)}</span>
        </div>
      `;
    }
  }

  populateAddressForm(addr) {
    if (!addr) return;
    document.getElementById("ship-name").value = addr.fullName || "";
    document.getElementById("ship-phone").value = addr.phone || "";
    document.getElementById("ship-address").value = addr.address || "";
    document.getElementById("ship-city").value = addr.city || "";
    document.getElementById("ship-province").value = addr.province || "";
    document.getElementById("ship-postal").value = addr.postalCode || "";
  }

  setupListeners() {
    // Address selection click
    const addressGridContainer = document.getElementById("saved-addresses-grid");
    if (addressGridContainer) {
      addressGridContainer.addEventListener("click", (e) => {
        const card = e.target.closest(".address-card");
        if (card) {
          addressGridContainer.querySelectorAll(".address-card").forEach(c => c.classList.remove("selected"));
          card.classList.add("selected");
          const addrId = card.dataset.addressId;
          this.selectedAddress = this.savedAddresses.find(a => a.id === addrId);
          this.populateAddressForm(this.selectedAddress);
        }
      });
    }

    // Coupon Apply Button
    const applyCouponBtn = document.getElementById("apply-coupon-btn");
    if (applyCouponBtn) {
      applyCouponBtn.addEventListener("click", async () => {
        const couponInput = document.getElementById("coupon-code-input");
        const code = couponInput?.value.trim().toUpperCase();
        if (!code) {
          showToast("Please enter a coupon code.", "warning");
          return;
        }
        await this.validateAndApplyCoupon(code);
      });
    }

    // Order Submission Form
    const checkoutForm = document.getElementById("checkout-form");
    const placeOrderBtn = document.getElementById("place-order-btn");

    if (checkoutForm) {
      checkoutForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.placeOrder(placeOrderBtn);
      });
    }
  }

  async validateAndApplyCoupon(code) {
    try {
      const q = query(collection(db, "coupons"), where("code", "==", code), where("active", "==", true));
      const qSnap = await getDocs(q);

      let couponData = null;

      if (!qSnap.empty) {
        const firstDoc = qSnap.docs[0];
        couponData = { id: firstDoc.id, ...firstDoc.data() };
      } else {
        // Fallback check in sample coupons
        const fallbackCoupons = [
          { code: "WELCOME10", discountType: "percentage", discountValue: 10, minOrder: 20 },
          { code: "SALE20", discountType: "percentage", discountValue: 20, minOrder: 50 },
          { code: "READ50", discountType: "fixed", discountValue: 5, minOrder: 30 }
        ];
        couponData = fallbackCoupons.find(c => c.code === code);
      }

      if (!couponData) {
        showToast("Invalid or expired coupon code.", "error");
        return;
      }

      if (this.subtotal < (couponData.minOrder || 0)) {
        showToast(`This coupon requires a minimum order of ${formatCurrency(couponData.minOrder)}.`, "warning");
        return;
      }

      // Calculate discount
      if (couponData.discountType === "percentage") {
        this.discountAmount = (this.subtotal * couponData.discountValue) / 100;
        if (couponData.maxDiscount && this.discountAmount > couponData.maxDiscount) {
          this.discountAmount = couponData.maxDiscount;
        }
      } else {
        this.discountAmount = couponData.discountValue;
      }

      this.appliedCoupon = couponData;
      showToast(`Coupon "${code}" applied! Discount: ${formatCurrency(this.discountAmount)}`, "success");
      this.updateTotalsUI();
    } catch (err) {
      console.error("Coupon validation error:", err);
      showToast("Unable to validate coupon.", "error");
    }
  }

  async placeOrder(submitBtn) {
    const user = auth.currentUser;
    if (!user) {
      showToast("Session expired. Please log in to complete your purchase.", "error");
      return;
    }

    const name = document.getElementById("ship-name").value.trim();
    const phone = document.getElementById("ship-phone").value.trim();
    const address = document.getElementById("ship-address").value.trim();
    const city = document.getElementById("ship-city").value.trim();
    const province = document.getElementById("ship-province").value.trim();
    const postalCode = document.getElementById("ship-postal").value.trim();

    if (!name || !phone || !address || !city || !province || !postalCode) {
      showToast("Please fill in all required shipping address fields.", "warning");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Placing Order...</span>`;
    }

    try {
      const orderId = generateOrderId();
      const totalPayable = Math.max(0, this.subtotal + this.shippingFee - this.discountAmount);

      const orderData = {
        orderId: orderId,
        customerId: user.uid,
        customerName: name,
        customerEmail: user.email,
        items: this.populatedItems,
        shippingAddress: {
          fullName: name,
          phone: phone,
          address: address,
          city: city,
          province: province,
          postalCode: postalCode,
          country: "United States"
        },
        subtotal: this.subtotal,
        shippingFee: this.shippingFee,
        discount: this.discountAmount,
        total: totalPayable,
        couponCode: this.appliedCoupon ? this.appliedCoupon.code : "",
        paymentMethod: "CASH_ON_DELIVERY",
        paymentStatus: "Pending",
        orderStatus: "Pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // 1. Create Order document in Firestore
      await setDoc(doc(db, "orders", orderId), orderData);

      // Save to local storage cache for instant local tracking access
      const recentOrders = JSON.parse(localStorage.getItem("bookmart_recent_orders") || "[]");
      recentOrders.unshift({ ...orderData, createdAt: new Date().toISOString() });
      localStorage.setItem("bookmart_recent_orders", JSON.stringify(recentOrders));

      // 2. Update stock & soldCount for each purchased book in Firestore
      for (const item of this.populatedItems) {
        try {
          const bookRef = doc(db, "books", item.bookId);
          await updateDoc(bookRef, {
            stock: increment(-item.quantity),
            soldCount: increment(item.quantity),
            updatedAt: serverTimestamp()
          });
        } catch (stockErr) {
          console.warn(`Stock update for ${item.bookId} failed (might be sample item):`, stockErr);
        }
      }

      // 3. Clear customer shopping cart
      await clearCart();

      // 4. Create user notification
      try {
        await addDoc(collection(db, "notifications"), {
          userId: user.uid,
          title: "Order Placed Successfully",
          message: `Your order #${orderId} for ${formatCurrency(totalPayable)} has been placed via Cash on Delivery.`,
          type: "order",
          isRead: false,
          createdAt: serverTimestamp()
        });
      } catch (notifErr) {
        console.warn("Notification creation error:", notifErr);
      }

      showToast(`Order #${orderId} placed successfully!`, "success");

      setTimeout(() => {
        window.location.href = `/order-details.html?id=${orderId}`;
      }, 1000);

    } catch (error) {
      console.error("Order placement error:", error);
      showToast("Order creation failed. Please check your connection and try again.", "error");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `Place Order (Cash on Delivery)`;
      }
    }
  }
}
