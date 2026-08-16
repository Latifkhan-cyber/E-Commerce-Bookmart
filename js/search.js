// ==========================================================================
// BookMart - Catalog Search & Multi-Filter Engine (js/search.js)
// ==========================================================================

import { fetchAllBooks, createBookCardHtml } from "./books.js";
import { debounce } from "./utils.js";

export class BookSearchEngine {
  constructor(gridContainerId, paginationContainerId, resultsCountId) {
    this.gridContainer = document.getElementById(gridContainerId);
    this.paginationContainer = document.getElementById(paginationContainerId);
    this.resultsCountEl = document.getElementById(resultsCountId);

    this.allBooks = [];
    this.filteredBooks = [];
    this.currentPage = 1;
    this.itemsPerPage = 8;

    this.filters = {
      query: "",
      category: "all",
      author: "all",
      publisher: "all",
      maxPrice: 150,
      minRating: 0,
      inStockOnly: false,
      sortBy: "newest"
    };
  }

  async init() {
    this.allBooks = await fetchAllBooks();
    this.filteredBooks = [...this.allBooks];
    this.applyFilters();
    this.setupListeners();
  }

  setupListeners() {
    // Search input with debounce
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", debounce((e) => {
        this.filters.query = e.target.value.trim().toLowerCase();
        this.currentPage = 1;
        this.applyFilters();
      }, 250));
    }

    // Category filter dropdown
    const categorySelect = document.getElementById("filter-category");
    if (categorySelect) {
      categorySelect.addEventListener("change", (e) => {
        this.filters.category = e.target.value;
        this.currentPage = 1;
        this.applyFilters();
      });
    }

    // Author filter dropdown
    const authorSelect = document.getElementById("filter-author");
    if (authorSelect) {
      authorSelect.addEventListener("change", (e) => {
        this.filters.author = e.target.value;
        this.currentPage = 1;
        this.applyFilters();
      });
    }

    // Publisher filter dropdown
    const publisherSelect = document.getElementById("filter-publisher");
    if (publisherSelect) {
      publisherSelect.addEventListener("change", (e) => {
        this.filters.publisher = e.target.value;
        this.currentPage = 1;
        this.applyFilters();
      });
    }

    // Price Range Slider
    const priceRange = document.getElementById("filter-price-range");
    const priceDisplay = document.getElementById("filter-price-display");
    if (priceRange) {
      priceRange.addEventListener("input", (e) => {
        this.filters.maxPrice = parseFloat(e.target.value);
        if (priceDisplay) priceDisplay.textContent = `$${this.filters.maxPrice}`;
        this.currentPage = 1;
        this.applyFilters();
      });
    }

    // Sort Dropdown
    const sortSelect = document.getElementById("filter-sort");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.filters.sortBy = e.target.value;
        this.applyFilters();
      });
    }

    // Reset Filters Button
    const resetBtn = document.getElementById("reset-filters-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.resetFilters();
      });
    }
  }

  resetFilters() {
    this.filters = {
      query: "",
      category: "all",
      author: "all",
      publisher: "all",
      maxPrice: 150,
      minRating: 0,
      inStockOnly: false,
      sortBy: "newest"
    };

    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.value = "";

    const categorySelect = document.getElementById("filter-category");
    if (categorySelect) categorySelect.value = "all";

    const authorSelect = document.getElementById("filter-author");
    if (authorSelect) authorSelect.value = "all";

    const publisherSelect = document.getElementById("filter-publisher");
    if (publisherSelect) publisherSelect.value = "all";

    const priceRange = document.getElementById("filter-price-range");
    if (priceRange) priceRange.value = 150;

    const priceDisplay = document.getElementById("filter-price-display");
    if (priceDisplay) priceDisplay.textContent = "$150";

    const sortSelect = document.getElementById("filter-sort");
    if (sortSelect) sortSelect.value = "newest";

    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters() {
    let result = this.allBooks.filter(book => {
      // Search query (Title, Author, ISBN, Publisher, Category)
      if (this.filters.query) {
        const q = this.filters.query;
        const matchesTitle = book.title.toLowerCase().includes(q);
        const matchesAuthor = book.authorName ? book.authorName.toLowerCase().includes(q) : false;
        const matchesIsbn = book.isbn ? book.isbn.toLowerCase().includes(q) : false;
        const matchesPublisher = book.publisherName ? book.publisherName.toLowerCase().includes(q) : false;
        const matchesCategory = book.categoryName ? book.categoryName.toLowerCase().includes(q) : false;

        if (!matchesTitle && !matchesAuthor && !matchesIsbn && !matchesPublisher && !matchesCategory) {
          return false;
        }
      }

      // Category filter
      if (this.filters.category !== "all") {
        if (book.categoryId !== this.filters.category && book.categoryName !== this.filters.category) {
          return false;
        }
      }

      // Author filter
      if (this.filters.author !== "all") {
        if (book.authorId !== this.filters.author && book.authorName !== this.filters.author) {
          return false;
        }
      }

      // Publisher filter
      if (this.filters.publisher !== "all") {
        if (book.publisherId !== this.filters.publisher && book.publisherName !== this.filters.publisher) {
          return false;
        }
      }

      // Price filter
      const effectivePrice = book.discountPrice || book.price;
      if (effectivePrice > this.filters.maxPrice) {
        return false;
      }

      return true;
    });

    // Sort Results
    switch (this.filters.sortBy) {
      case "price-low":
        result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case "price-high":
        result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case "popular":
        result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "oldest":
        result.sort((a, b) => (a.publicationYear || 0) - (b.publicationYear || 0));
        break;
      case "newest":
      default:
        result.sort((a, b) => (b.publicationYear || 0) - (a.publicationYear || 0));
        break;
    }

    this.filteredBooks = result;
    this.render();
  }

  render() {
    if (this.resultsCountEl) {
      this.resultsCountEl.textContent = `Showing ${this.filteredBooks.length} Books`;
    }

    if (!this.gridContainer) return;

    if (this.filteredBooks.length === 0) {
      this.gridContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🔍</div>
          <h3>No Books Match Your Criteria</h3>
          <p>Try adjusting your search terms or clearing your filter selections.</p>
          <button class="btn btn-outline" onclick="document.getElementById('reset-filters-btn')?.click()">Clear Filters</button>
        </div>
      `;
      if (this.paginationContainer) this.paginationContainer.innerHTML = '';
      return;
    }

    // Pagination Slicing
    const totalPages = Math.ceil(this.filteredBooks.length / this.itemsPerPage);
    if (this.currentPage > totalPages) this.currentPage = 1;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const paginatedBooks = this.filteredBooks.slice(startIndex, startIndex + this.itemsPerPage);

    this.gridContainer.innerHTML = paginatedBooks.map(b => createBookCardHtml(b)).join('');
    this.renderPagination(totalPages);
  }

  renderPagination(totalPages) {
    if (!this.paginationContainer || totalPages <= 1) {
      if (this.paginationContainer) this.paginationContainer.innerHTML = '';
      return;
    }

    let pagesHtml = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 2rem;">
        <button class="btn btn-sm btn-outline" ${this.currentPage === 1 ? 'disabled' : ''} id="prev-page-btn">← Prev</button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      pagesHtml += `
        <button class="btn btn-sm ${i === this.currentPage ? 'btn-primary' : 'btn-outline'}" data-page="${i}">${i}</button>
      `;
    }

    pagesHtml += `
        <button class="btn btn-sm btn-outline" ${this.currentPage === totalPages ? 'disabled' : ''} id="next-page-btn">Next →</button>
      </div>
    `;

    this.paginationContainer.innerHTML = pagesHtml;

    // Attach Pagination Click Handlers
    this.paginationContainer.querySelectorAll("button[data-page]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.currentPage = parseInt(e.target.dataset.page);
        this.render();
        window.scrollTo({ top: 300, behavior: 'smooth' });
      });
    });

    document.getElementById("prev-page-btn")?.addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.render();
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }
    });

    document.getElementById("next-page-btn")?.addEventListener("click", () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.render();
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }
    });
  }
}
