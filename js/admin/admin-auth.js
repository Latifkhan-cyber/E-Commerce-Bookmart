// ==========================================================================
// BookMart - Admin Auth Guard (js/admin/admin-auth.js)
// Protects admin dashboard & admin management pages
// ==========================================================================

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, db } from "../firebase-config.js";
import { showToast } from "../utils.js";

/**
 * Strictly enforce ADMIN authorization for admin panel pages
 */
export function requireAdminAuth(onSuccessCallback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      showToast("Admin access required. Please log in.", "error");
      setTimeout(() => {
        window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
      }, 500);
      return;
    }

    try {
      const userDocSnap = await getDoc(doc(db, "users", user.uid));
      if (!userDocSnap.exists() || userDocSnap.data().role !== "ADMIN") {
        showToast("Access Denied: Admin authorization required.", "error");
        setTimeout(() => {
          window.location.href = "/index.html";
        }, 1000);
        return;
      }

      // User is verified ADMIN
      if (onSuccessCallback) {
        onSuccessCallback(userDocSnap.data());
      }
    } catch (error) {
      console.error("Admin verification error:", error);
      showToast("Authorization verification failed.", "error");
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 1000);
    }
  });
}

// Auto execute for admin subfolder pages
if (window.location.pathname.includes("/admin/")) {
  requireAdminAuth();
}
