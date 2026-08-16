// ==========================================================================
// BookMart - Customer Profile & Account Controller (js/profile.js)
// ==========================================================================

import { doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { updatePassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { auth, db } from "./firebase-config.js";
import { fetchCustomerOrders } from "./orders.js";
import { getWishlistBookIds } from "./wishlist.js";
import { fetchUserAddresses, saveAddress, deleteAddress } from "./addresses.js";
import { showToast, formatDate } from "./utils.js";
import { requireCustomerAuth } from "./auth-guard.js";

export class AccountDashboard {
  constructor() {
    this.profile = null;
  }

  async init() {
    requireCustomerAuth();

    auth.onAuthStateChanged(async (user) => {
      if (user) {
        await this.loadProfileData(user);
        await this.loadStats(user.uid);
        await this.renderAddresses();
        this.setupForms();
      }
    });
  }

  async loadProfileData(user) {
    try {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        this.profile = docSnap.data();
      } else {
        this.profile = { name: user.displayName || "Customer", email: user.email, phone: "", role: "CUSTOMER" };
      }
      this.renderProfileSummary();
    } catch (err) {
      console.warn("Load profile error:", err);
    }
  }

  renderProfileSummary() {
    const avatarEl = document.getElementById("profile-summary-avatar");
    const nameEl = document.getElementById("profile-summary-name");
    const emailEl = document.getElementById("profile-summary-email");

    if (avatarEl) avatarEl.src = this.profile.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.profile.name)}`;
    if (nameEl) nameEl.textContent = this.profile.name;
    if (emailEl) emailEl.textContent = this.profile.email;

    // Populate Edit Form Inputs
    const nameInput = document.getElementById("acc-name");
    const phoneInput = document.getElementById("acc-phone");
    const emailInput = document.getElementById("acc-email");

    if (nameInput) nameInput.value = this.profile.name || "";
    if (phoneInput) phoneInput.value = this.profile.phone || "";
    if (emailInput) emailInput.value = this.profile.email || "";
  }

  async loadStats(userId) {
    const orders = await fetchCustomerOrders(userId);
    const wishlistIds = await getWishlistBookIds();

    const pendingCount = orders.filter(o => o.orderStatus === "Pending" || o.orderStatus === "Processing").length;
    const completedCount = orders.filter(o => o.orderStatus === "Delivered").length;

    const totalOrdersEl = document.getElementById("stat-total-orders");
    const pendingOrdersEl = document.getElementById("stat-pending-orders");
    const completedOrdersEl = document.getElementById("stat-completed-orders");
    const wishlistCountEl = document.getElementById("stat-wishlist-count");

    if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
    if (pendingOrdersEl) pendingOrdersEl.textContent = pendingCount;
    if (completedOrdersEl) completedOrdersEl.textContent = completedCount;
    if (wishlistCountEl) wishlistCountEl.textContent = wishlistIds.length;
  }

  async renderAddresses() {
    const container = document.getElementById("account-addresses-list");
    if (!container) return;

    const addresses = await fetchUserAddresses();

    if (addresses.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted);grid-column:1/-1;">No saved addresses yet.</p>`;
      return;
    }

    container.innerHTML = addresses.map(addr => `
      <div class="address-card" style="cursor:default;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div style="font-weight:700;">${addr.fullName} ${addr.isDefault ? '<span class="badge badge-success">Default</span>' : ''}</div>
            <div style="font-size:0.85rem;color:var(--text-muted);margin-top:0.2rem;">📞 ${addr.phone}</div>
            <div style="font-size:0.85rem;margin-top:0.35rem;">${addr.address}, ${addr.city}, ${addr.province} ${addr.postalCode}</div>
          </div>
          <button class="btn btn-sm btn-outline" style="color:var(--danger-color);border-color:transparent;" onclick="window.handleDeleteAddress('${addr.id}')">✕</button>
        </div>
      </div>
    `).join('');
  }

  setupForms() {
    // Update Profile Form
    const profileForm = document.getElementById("profile-edit-form");
    profileForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("acc-name").value.trim();
      const phone = document.getElementById("acc-phone").value.trim();

      const user = auth.currentUser;
      if (!user) return;

      try {
        await updateProfile(user, { displayName: name });
        await updateDoc(doc(db, "users", user.uid), {
          name: name,
          phone: phone,
          updatedAt: serverTimestamp()
        });
        showToast("Profile updated successfully!", "success");
        this.profile.name = name;
        this.profile.phone = phone;
        this.renderProfileSummary();
      } catch (err) {
        console.error("Profile update error:", err);
        showToast("Failed to update profile.", "error");
      }
    });

    // Change Password Form
    const pwdForm = document.getElementById("change-password-form");
    pwdForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newPwd = document.getElementById("new-acc-pwd").value;
      const confirmPwd = document.getElementById("confirm-acc-pwd").value;

      if (newPwd !== confirmPwd) {
        showToast("Passwords do not match!", "warning");
        return;
      }

      if (newPwd.length < 6) {
        showToast("Password must be at least 6 characters.", "warning");
        return;
      }

      const user = auth.currentUser;
      if (!user) return;

      try {
        await updatePassword(user, newPwd);
        showToast("Password updated successfully!", "success");
        pwdForm.reset();
      } catch (err) {
        console.error("Password update error:", err);
        showToast("Failed to update password. You may need to re-login.", "error");
      }
    });

    // Add New Address Form
    const addrForm = document.getElementById("add-address-form");
    addrForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const addrData = {
        fullName: document.getElementById("addr-name").value,
        phone: document.getElementById("addr-phone").value,
        address: document.getElementById("addr-street").value,
        city: document.getElementById("addr-city").value,
        province: document.getElementById("addr-province").value,
        postalCode: document.getElementById("addr-postal").value,
        isDefault: document.getElementById("addr-default").checked
      };

      const success = await saveAddress(addrData);
      if (success) {
        addrForm.reset();
        await this.renderAddresses();
      }
    });
  }
}

window.handleDeleteAddress = async (id) => {
  const success = await deleteAddress(id);
  if (success && window.accountDashboard) {
    window.accountDashboard.renderAddresses();
  }
};
