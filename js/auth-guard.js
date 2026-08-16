// ==========================================================================
// BookMart - Customer Auth Guard (js/auth-guard.js)
// Protects customer pages requiring authentication
// ==========================================================================

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import { showToast } from "./utils.js";

/**
 * Protect customer-facing route requiring login
 */
export function requireCustomerAuth() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      showToast("Please log in to access this page.", "warning");
      const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
      setTimeout(() => {
        window.location.href = `/login.html?redirect=${currentPath}`;
      }, 400);
      return;
    }

    // Verify user is not blocked in Firestore
    try {
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (userSnap.exists() && userSnap.data().isBlocked) {
        showToast("Your account has been suspended.", "error");
        setTimeout(() => {
          window.location.href = "/index.html";
        }, 1000);
      }
    } catch (err) {
      console.error("Auth guard error:", err);
    }
  });
}

// Automatically enforce auth if script loaded on protected page
const protectedPages = ["checkout.html", "account.html", "orders.html", "order-details.html", "wishlist.html"];
const currentFileName = window.location.pathname.split("/").pop();

if (protectedPages.includes(currentFileName)) {
  requireCustomerAuth();
}
