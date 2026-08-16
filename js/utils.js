// ==========================================================================
// BookMart - Core Utility Functions (js/utils.js)
// ==========================================================================

/**
 * Display toast notification
 * @param {string} message 
 * @param {'success'|'error'|'warning'|'info'} type 
 * @param {number} duration 
 */
export function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.6rem;">
      <span style="font-weight:bold;font-size:1.1rem;">${iconMap[type] || 'ℹ'}</span>
      <span>${message}</span>
    </div>
    <button style="background:none;border:none;cursor:pointer;font-size:1rem;color:currentColor;opacity:0.7;" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Format currency amount
 * @param {number} amount 
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount || 0);
}

/**
 * Render star ratings SVG/HTML
 * @param {number} rating 
 * @returns {string}
 */
export function renderStarRating(rating = 0) {
  const rounded = Math.round(rating * 2) / 2;
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      starsHtml += '<span style="color:#F59E0B;">★</span>';
    } else if (i - 0.5 === rounded) {
      starsHtml += '<span style="color:#F59E0B;">★</span>';
    } else {
      starsHtml += '<span style="color:#CBD5E1;">★</span>';
    }
  }
  return starsHtml;
}

/**
 * Debounce helper for input search
 * @param {Function} func 
 * @param {number} delay 
 */
export function debounce(func, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Format timestamp to readable date string
 * @param {any} timestamp 
 * @returns {string}
 */
export function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Generate unique Order ID (e.g. BK-10842)
 * @returns {string}
 */
export function generateOrderId() {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `BK-${randomNum}`;
}
