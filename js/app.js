// Konfigurasi API
const API_BASE = 'https://www.sankavollerei.com/comic/bacakomik';
const API_ENDPOINTS = {
    latest: `${API_BASE}/latest`,
    search: (query) => `${API_BASE}/search/${encodeURIComponent(query)}`,
    detail: (slug) => `${API_BASE}/detail/${slug}`,
    chapter: (slug) => `${API_BASE}/chapter/${slug}`
};

// State aplikasi
let currentPage = 'home';
let currentSlug = null;
let searchQuery = '';

// Elemen DOM
const mainContent = document.getElementById('main-content');
const loadingElement = document.getElementById('loading');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');
const navLinks = document.querySelectorAll('.nav-link');

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    initRouter();
    initEventListeners();
    loadPage('home');
});

// Router SPA (Single Page Application)
function initRouter() {
    window.addEventListener('popstate', (e) => {
        const page = window.location.hash.replace('#', '') || 'home';
        loadPage(page);
    });
}

function navigateTo(page, slug = null) {
    currentPage = page;
    currentSlug = slug;
    window.history.pushState({}, '', slug ? `#${page}/${slug}` : `#${page}`);
    loadPage(page, slug);
}

// Event Listeners
function initEventListeners() {
    // Navigasi
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            navigateTo(page);
        });
    });

    // Pencarian
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    searchInput.addEventListener('input', () => {
        searchQuery = searchInput.value.trim();
        if (searchQuery.length > 2) {
            debouncedSearch();
        } else {
            searchResults.style.display = 'none';
        }
    });

    // Tutup hasil pencarian saat klik di luar
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchResults.style.display = 'none';
        }
    });
}

// Debounced Search
let searchTimeout;
function debouncedSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        performSearch(true);
    }, 300);
}

// Fungsi Pencarian
async function performSearch(showResults = false) {
    searchQuery = searchInput.value.trim();
    if (!searchQuery) return;
    
    if (showResults) {
        await showSearchResults();
    } else {
        navigateTo('search', searchQuery);
        searchResults.style.display = 'none';
        searchInput.value = '';
    }
}

// Load Halaman
async function loadPage(page, slug = null) {
    showLoading();
    
    try {
        // Hapus konten sebelumnya
        while (mainContent.firstChild) {
            mainContent.removeChild(mainContent.firstChild);
        }
        
        // Load modul halaman
        let module;
        switch (page) {
            case 'home':
            case 'latest':
            case 'popular':
                module = await import('./home.js');
                await module.loadHomeContent(page);
                break;
            case 'search':
                module = await import('./search.js');
                await module.loadSearchContent(slug);
                break;
            case 'detail':
                module = await import('./detail.js');
                await module.loadDetailContent(slug);
                break;
            case 'reader':
                module = await import('./reader.js');
                await module.loadChapterContent(slug);
                break;
            default:
                module = await import('./home.js');
                await module.loadHomeContent('home');
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error loading page:', error);
        showError('Gagal memuat halaman. Silakan coba lagi.');
    }
}

// Utility Functions
function showLoading() {
    loadingElement.style.display = 'block';
}

function hideLoading() {
    loadingElement.style.display = 'none';
}

function showError(message) {
    mainContent.innerHTML = `
        <div class="error-container">
            <i class="fas fa-exclamation-triangle"></i>
            <h2>Terjadi Kesalahan</h2>
            <p>${message}</p>
            <button onclick="loadPage('home')" class="btn-primary">
                <i class="fas fa-home"></i> Kembali ke Beranda
            </button>
        </div>
    `;
}

// API Helper
async function fetchAPI(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('API returned unsuccessful');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Search Results Display
async function showSearchResults() {
    if (!searchQuery) return;
    
    try {
        const data = await fetchAPI(API_ENDPOINTS.search(searchQuery));
        displaySearchResults(data.komikList);
    } catch (error) {
        searchResults.innerHTML = '<div class="search-result-item">Gagal memuat hasil pencarian</div>';
    }
}

function displaySearchResults(comics) {
    if (!comics || comics.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">Tidak ada hasil ditemukan</div>';
        searchResults.style.display = 'block';
        return;
    }
    
    searchResults.innerHTML = comics.map(comic => `
        <div class="search-result-item" data-slug="${comic.slug}">
            <img src="${comic.cover}" alt="${comic.title}" 
                 onerror="this.src='https://via.placeholder.com/146x208/1a1a2e/6c63ff?text=No+Cover'">
            <div class="search-result-info">
                <h4>${comic.title}</h4>
                <div class="search-meta">
                    <span class="type-badge ${comic.type}">${comic.type}</span>
                    <span class="rating"><i class="fas fa-star"></i> ${comic.rating || 'N/A'}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    searchResults.style.display = 'block';
    
    // Tambahkan event listeners untuk hasil pencarian
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const slug = item.dataset.slug;
            navigateTo('detail', slug);
            searchResults.style.display = 'none';
            searchInput.value = '';
        });
    });
}

// Export untuk modul lain
export { API_ENDPOINTS, fetchAPI, navigateTo, showLoading, hideLoading };
