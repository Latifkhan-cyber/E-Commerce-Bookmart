// ==========================================================================
// BookMart - Reusable Footer Component (js/footer.js)
// ==========================================================================

import { collection, addDoc, serverTimestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { showToast } from "./utils.js";

export function renderFooter() {
  let footerContainer = document.getElementById("footer-container");
  if (!footerContainer) {
    footerContainer = document.createElement("footer");
    footerContainer.id = "footer-container";
    document.body.appendChild(footerContainer);
  }

  footerContainer.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <!-- Col 1: Brand Info -->
          <div class="footer-col">
            <a href="/index.html" style="font-family:var(--font-heading);font-size:1.6rem;font-weight:800;color:#FFFFFF;display:inline-block;margin-bottom:1rem;">
              📚 Book<span style="color:var(--secondary-color);">Mart</span>
            </a>
            <p>Your premier online bookstore for programming, literature, science, and academic masterpieces. Curated for readers, developers, and thinkers worldwide.</p>
            
            <!-- Newsletter Subscription Form -->
            <div style="margin-top:1.5rem;">
              <h5 style="color:#FFFFFF;margin-bottom:0.65rem;font-size:0.95rem;">Subscribe to our Newsletter</h5>
              <form id="newsletter-form" style="display:flex;gap:0.5rem;">
                <input type="email" id="newsletter-email" placeholder="Enter your email" required class="form-input" style="padding:0.6rem 0.85rem;font-size:0.85rem;background:#1E293B;border-color:#334155;color:#FFF;">
                <button type="submit" class="btn btn-sm btn-accent">Subscribe</button>
              </form>
            </div>
          </div>

          <!-- Col 2: Quick Links -->
          <div class="footer-col">
            <h4>Quick Links</h4>
            <ul class="footer-links">
              <li><a href="/index.html">Home</a></li>
              <li><a href="/books.html">All Books</a></li>
              <li><a href="/categories.html">Categories</a></li>
              <li><a href="/authors.html">Popular Authors</a></li>
              <li><a href="/publishers.html">Publishers</a></li>
              <li><a href="/deals.html">Special Deals</a></li>
            </ul>
          </div>

          <!-- Col 3: Customer Support -->
          <div class="footer-col">
            <h4>Customer Care</h4>
            <ul class="footer-links">
              <li><a href="/account.html">My Account</a></li>
              <li><a href="/orders.html">Track Orders</a></li>
              <li><a href="/wishlist.html">My Wishlist</a></li>
              <li><a href="/cart.html">View Cart</a></li>
              <li><a href="/privacy-policy.html">Privacy Policy</a></li>
              <li><a href="/terms.html">Terms & Conditions</a></li>
            </ul>
          </div>

          <!-- Col 4: Contact Info -->
          <div class="footer-col">
            <h4>Contact Us</h4>
            <p style="margin-bottom:0.5rem;">📍 100 Bookstore Avenue, Library Plaza, Suite 400</p>
            <p style="margin-bottom:0.5rem;">📞 +1 (800) 555-BOOK</p>
            <p style="margin-bottom:0.5rem;">✉️ support@bookmart.com</p>
            <p style="margin-top:1rem;font-size:0.85rem;color:#94A3B8;">⏰ Mon - Sat: 9:00 AM - 8:00 PM</p>
          </div>
        </div>

        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <div>© ${new Date().getFullYear()} BookMart Inc. All rights reserved. Built with Vanilla JS & Firebase.</div>
          <div style="display:flex;gap:1rem;">
            <span>Secure Cash on Delivery</span>
            <span>256-bit SSL Encryption</span>
          </div>
        </div>
      </div>
    </footer>
  `;

  // Attach Newsletter Handler
  const newsletterForm = document.getElementById("newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("newsletter-email");
      const email = emailInput?.value.trim().toLowerCase();

      if (!email) return;

      try {
        // Check duplicate email
        const q = query(collection(db, "newsletterSubscriptions"), where("email", "==", email));
        const snap = await getDocs(q);

        if (!snap.empty) {
          showToast("You are already subscribed to our newsletter!", "info");
          return;
        }

        await addDoc(collection(db, "newsletterSubscriptions"), {
          email: email,
          status: "active",
          subscribedAt: serverTimestamp()
        });

        showToast("Subscribed successfully! Thank you for joining BookMart.", "success");
        emailInput.value = "";
      } catch (err) {
        console.error("Newsletter error:", err);
        showToast("Unable to subscribe. Please try again.", "error");
      }
    });
  }
}

// Auto render footer when DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderFooter);
} else {
  renderFooter();
}
