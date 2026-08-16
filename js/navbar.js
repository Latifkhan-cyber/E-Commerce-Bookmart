// ==========================================================================
// BookMart - Reusable Navbar Component (js/navbar.js)
// ==========================================================================

import { onAuthChange, logoutUser } from "./auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { getCartItems, addToCart } from "./cart.js";
import { getWishlistBookIds, addToWishlist } from "./wishlist.js";

/**
 * Render Navbar into target element or #navbar-container
 */
export function renderNavbar() {
  let navContainer = document.getElementById("navbar-container");
  if (!navContainer) {
    navContainer = document.createElement("header");
    navContainer.id = "navbar-container";
    document.body.prepend(navContainer);
  }

  const currentPath = window.location.pathname;

  navContainer.innerHTML = `
    <nav class="navbar">
      <div class="container">
        <!-- Logo -->
        <a href="/index.html" class="nav-brand">
          📚 Book<span>Mart</span>
        </a>

        <!-- Desktop Navigation Links -->
        <ul class="nav-menu" id="nav-menu">
          <li><a href="/index.html" class="nav-link ${currentPath === '/' || currentPath.endsWith('index.html') ? 'active' : ''}">Home</a></li>
          <li><a href="/books.html" class="nav-link ${currentPath.includes('books.html') ? 'active' : ''}">Books</a></li>
          <li><a href="/categories.html" class="nav-link ${currentPath.includes('categories.html') ? 'active' : ''}">Categories</a></li>
          <li><a href="/authors.html" class="nav-link ${currentPath.includes('authors.html') ? 'active' : ''}">Authors</a></li>
          <li><a href="/publishers.html" class="nav-link ${currentPath.includes('publishers.html') ? 'active' : ''}">Publishers</a></li>
          <li><a href="/deals.html" class="nav-link ${currentPath.includes('deals.html') ? 'active' : ''}">Deals</a></li>
        </ul>

        <!-- Action Items (Search, Wishlist, Cart, Auth User) -->
        <div class="nav-actions">
          <a href="/books.html" class="nav-icon-btn" title="Search Books">
            🔍
          </a>

          <a href="/wishlist.html" class="nav-icon-btn" title="Wishlist">
            ❤️
            <span class="nav-badge" id="wishlist-badge">0</span>
          </a>

          <a href="/cart.html" class="nav-icon-btn" title="Cart">
            🛒
            <span class="nav-badge" id="cart-badge">0</span>
          </a>

          <!-- Dynamic User Account / Auth Section -->
          <div id="nav-user-section">
            <a href="/login.html" class="btn btn-sm btn-outline">Login</a>
            <a href="/register.html" class="btn btn-sm btn-primary">Register</a>
          </div>

          <!-- Mobile Hamburger Toggle -->
          <button class="hamburger" id="hamburger-toggle" aria-label="Toggle Navigation">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  `;

  // Hamburger Toggle Event
  const hamburgerToggle = document.getElementById("hamburger-toggle");
  const navMenu = document.getElementById("nav-menu");
  if (hamburgerToggle && navMenu) {
    hamburgerToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // Initial Badges Render
  updateLocalBadges();

  // Update Auth User Section & Badge Counts
  onAuthChange(async (user, profile) => {
    const userSection = document.getElementById("nav-user-section");
    if (!userSection) return;

    if (user && profile) {
      const isAdmin = profile.role === "ADMIN";
      userSection.innerHTML = `
        <div class="user-dropdown">
          <button class="nav-icon-btn" style="width:auto;gap:0.5rem;padding:0 0.5rem;" id="user-dropdown-btn">
            <img src="${profile.profileImage || 'https://ui-avatars.com/api/?name=User'}" alt="${profile.name}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
            <span style="font-size:0.9rem;font-weight:600;display:none;@media(min-width:768px){display:inline;}">${profile.name.split(' ')[0]}</span>
          </button>
          <div class="dropdown-menu">
            <div style="padding:0.75rem 1.25rem;border-bottom:1px solid var(--card-border);">
              <div style="font-weight:700;font-size:0.95rem;">${profile.name}</div>
              <div style="font-size:0.8rem;color:var(--text-muted);">${profile.email}</div>
            </div>
            <a href="/account.html" class="dropdown-item">👤 My Account</a>
            <a href="/orders.html" class="dropdown-item">📦 My Orders</a>
            <a href="/wishlist.html" class="dropdown-item">❤️ My Wishlist</a>
            ${isAdmin ? `<a href="/admin/index.html" class="dropdown-item" style="color:var(--secondary-color);font-weight:700;">⚙️ Admin Dashboard</a>` : ''}
            <div class="dropdown-divider"></div>
            <button id="nav-logout-btn" class="dropdown-item" style="width:100%;border:none;background:none;cursor:pointer;color:var(--danger-color);">🚪 Logout</button>
          </div>
        </div>
      `;

      document.getElementById("nav-logout-btn")?.addEventListener("click", () => {
        logoutUser();
      });

      updateNavBadges(user.uid);
    } else {
      userSection.innerHTML = `
        <a href="/login.html" class="btn btn-sm btn-outline">Login</a>
        <a href="/register.html" class="btn btn-sm btn-primary">Register</a>
      `;
      updateLocalBadges();
    }
  });
}

/**
 * Update Cart & Wishlist badges for authenticated user
 * @param {string} userId 
 */
async function updateNavBadges(userId) {
  try {
    const items = await getCartItems();
    const cartBadge = document.getElementById("cart-badge");
    if (cartBadge) {
      const totalQty = (items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
      cartBadge.textContent = totalQty;
    }

    const wishlistIds = await getWishlistBookIds();
    const wishlistBadge = document.getElementById("wishlist-badge");
    if (wishlistBadge) {
      wishlistBadge.textContent = wishlistIds.length;
    }
  } catch (err) {
    console.warn("Badge update error:", err);
  }
}

/**
 * Update badges from local storage for guest
 */
function updateLocalBadges() {
  const localCart = JSON.parse(localStorage.getItem("bookmart_cart") || "[]");
  const cartBadge = document.getElementById("cart-badge");
  if (cartBadge) {
    const totalQty = localCart.reduce((acc, item) => acc + (item.quantity || 1), 0);
    cartBadge.textContent = totalQty;
  }

  const localWishlist = JSON.parse(localStorage.getItem("bookmart_wishlist") || "[]");
  const wishlistBadge = document.getElementById("wishlist-badge");
  if (wishlistBadge) {
    wishlistBadge.textContent = localWishlist.length;
  }
}

// Auto render navbar when DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderNavbar);
} else {
  renderNavbar();
}
