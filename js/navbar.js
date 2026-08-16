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
    <!-- Mobile Backdrop Overlay -->
    <div class="nav-backdrop" id="nav-backdrop"></div>

    <nav class="navbar">
      <div class="container">
        <!-- Logo -->
        <a href="/index.html" class="nav-brand">
          📚 Book<span>Mart</span>
        </a>

        <!-- Desktop & Mobile Drawer Navigation Links -->
        <ul class="nav-menu" id="nav-menu">
          <div class="mobile-drawer-header">
            <a href="/index.html" class="nav-brand">📚 Book<span>Mart</span></a>
            <button class="mobile-drawer-close" id="mobile-drawer-close-btn" aria-label="Close Menu">✕</button>
          </div>

          <li><a href="/index.html" class="nav-link ${currentPath === '/' || currentPath.endsWith('index.html') ? 'active' : ''}">🏠 Home</a></li>
          <li><a href="/books.html" class="nav-link ${currentPath.includes('books.html') ? 'active' : ''}">📖 Books Catalog</a></li>
          <li><a href="/categories.html" class="nav-link ${currentPath.includes('categories.html') ? 'active' : ''}">📂 Categories</a></li>
          <li><a href="/authors.html" class="nav-link ${currentPath.includes('authors.html') ? 'active' : ''}">✍️ Authors</a></li>
          <li><a href="/publishers.html" class="nav-link ${currentPath.includes('publishers.html') ? 'active' : ''}">🏢 Publishers</a></li>
          <li><a href="/deals.html" class="nav-link ${currentPath.includes('deals.html') ? 'active' : ''}">⚡ Special Deals</a></li>
          <li><a href="/wishlist.html" class="nav-link ${currentPath.includes('wishlist.html') ? 'active' : ''}">❤️ My Wishlist</a></li>

          <!-- Mobile Auth Actions inside Drawer -->
          <div class="mobile-drawer-auth" id="mobile-drawer-auth">
            <a href="/login.html" class="btn btn-outline style-full">Login</a>
            <a href="/register.html" class="btn btn-primary style-full">Register</a>
          </div>
        </ul>

        <!-- Action Items (Search, Wishlist, Cart, Desktop User, Hamburger) -->
        <div class="nav-actions">
          <a href="/books.html" class="nav-icon-btn" title="Search Books">
            🔍
          </a>

          <a href="/wishlist.html" class="nav-icon-btn desktop-only-icon" title="Wishlist">
            ❤️
            <span class="nav-badge" id="wishlist-badge">0</span>
          </a>

          <a href="/cart.html" class="nav-icon-btn" title="Cart">
            🛒
            <span class="nav-badge" id="cart-badge">0</span>
          </a>

          <!-- Desktop User Account / Auth Section -->
          <div id="nav-user-section" class="desktop-user-section">
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

  // Mobile Menu & Backdrop Toggle Logic
  const hamburgerToggle = document.getElementById("hamburger-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navBackdrop = document.getElementById("nav-backdrop");
  const drawerCloseBtn = document.getElementById("mobile-drawer-close-btn");

  function closeMobileMenu() {
    navMenu?.classList.remove("active");
    hamburgerToggle?.classList.remove("active");
    navBackdrop?.classList.remove("active");
    document.body.style.overflow = "";
  }

  function toggleMobileMenu() {
    const isOpen = navMenu?.classList.toggle("active");
    hamburgerToggle?.classList.toggle("active", isOpen);
    navBackdrop?.classList.toggle("active", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  if (hamburgerToggle) hamburgerToggle.addEventListener("click", toggleMobileMenu);
  if (navBackdrop) navBackdrop.addEventListener("click", closeMobileMenu);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeMobileMenu);

  // Close mobile drawer when clicking any link inside menu
  navMenu?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeMobileMenu);
  });

  // Initial Badges Render
  updateLocalBadges();

  // Update Auth User Section & Badge Counts
  onAuthChange(async (user, profile) => {
    const userSection = document.getElementById("nav-user-section");
    const mobileAuthSection = document.getElementById("mobile-drawer-auth");

    if (user && profile) {
      const isAdmin = profile.role === "ADMIN";
      const userHtml = `
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
            <button id="nav-logout-btn" class="dropdown-item nav-logout-trigger" style="width:100%;border:none;background:none;cursor:pointer;color:var(--danger-color);">🚪 Logout</button>
          </div>
        </div>
      `;

      if (userSection) userSection.innerHTML = userHtml;

      if (mobileAuthSection) {
        mobileAuthSection.innerHTML = `
          <div style="padding:1rem 0;border-top:1px solid var(--card-border);width:100%;">
            <div style="font-weight:700;margin-bottom:0.25rem;color:var(--text-main);">${profile.name}</div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;">${profile.email}</div>
            <div style="display:flex;flex-direction:column;gap:0.5rem;">
              <a href="/account.html" class="btn btn-outline btn-sm style-full">👤 My Account</a>
              <a href="/orders.html" class="btn btn-outline btn-sm style-full">📦 My Orders</a>
              ${isAdmin ? `<a href="/admin/index.html" class="btn btn-primary btn-sm style-full">⚙️ Admin Panel</a>` : ''}
              <button class="btn btn-danger btn-sm style-full nav-logout-trigger">🚪 Logout</button>
            </div>
          </div>
        `;
      }

      document.querySelectorAll(".nav-logout-trigger").forEach(btn => {
        btn.addEventListener("click", () => logoutUser());
      });

      updateNavBadges(user.uid);
    } else {
      if (userSection) {
        userSection.innerHTML = `
          <a href="/login.html" class="btn btn-sm btn-outline">Login</a>
          <a href="/register.html" class="btn btn-sm btn-primary">Register</a>
        `;
      }

      if (mobileAuthSection) {
        mobileAuthSection.innerHTML = `
          <div style="display:flex;gap:0.5rem;width:100%;margin-top:1rem;">
            <a href="/login.html" class="btn btn-outline btn-sm" style="flex:1;">Login</a>
            <a href="/register.html" class="btn btn-primary btn-sm" style="flex:1;">Register</a>
          </div>
        `;
      }

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
      cartBadge.classList.add("badge-pulse");
      setTimeout(() => cartBadge.classList.remove("badge-pulse"), 600);
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
