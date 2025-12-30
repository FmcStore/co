import { API_ENDPOINTS, fetchAPI, navigateTo } from './app.js';

export async function loadDetailContent(slug) {
    const mainContent = document.getElementById('main-content');
    showLoading();
    
    try {
        const data = await fetchAPI(API_ENDPOINTS.detail(slug));
        const detail = data.detail;
        
        mainContent.innerHTML = createDetailTemplate(detail);
        setupChapterListeners();
        setupGenreListeners();
        hideLoading();
    } catch (error) {
        mainContent.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <h2>Komik Tidak Ditemukan</h2>
                <p>Komik yang Anda cari tidak tersedia atau telah dihapus.</p>
                <button onclick="navigateTo('home')" class="btn-primary">
                    <i class="fas fa-arrow-left"></i> Kembali
                </button>
            </div>
        `;
        hideLoading();
    }
}

function createDetailTemplate(detail) {
    return `
        <div class="detail-container">
            <!-- Header Detail -->
            <div class="detail-header">
                <button onclick="navigateTo('home')" class="btn-back">
                    <i class="fas fa-arrow-left"></i> Kembali
                </button>
                <h1 class="detail-title">${detail.title}</h1>
            </div>
            
            <!-- Informasi Utama -->
            <div class="detail-main">
                <div class="detail-cover">
                    <img src="${detail.cover}" alt="${detail.title}"
                         onerror="this.src='https://via.placeholder.com/214x315/1a1a2e/6c63ff?text=No+Cover'">
                    <div class="detail-rating">
                        <i class="fas fa-star"></i>
                        <span>${detail.rating || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="detail-info">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Judul Lain:</span>
                            <span class="info-value">${detail.otherTitle || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Status:</span>
                            <span class="info-value status-${detail.status.toLowerCase()}">${detail.status}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Tipe:</span>
                            <span class="type-badge ${detail.type.toLowerCase()}">${detail.type}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Penulis:</span>
                            <span class="info-value">${detail.author || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Ilustrator:</span>
                            <span class="info-value">${detail.artist || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Rilis:</span>
                            <span class="info-value">${detail.release || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Pembaca:</span>
                            <span class="info-value">${detail.reader || '-'}</span>
                        </div>
                    </div>
                    
                    <!-- Genre -->
                    <div class="detail-genres">
                        <h3><i class="fas fa-tags"></i> Genre:</h3>
                        <div class="genres-list">
                            ${detail.genres.map(genre => `
                                <span class="genre-tag" data-slug="${genre.slug}">${genre.title}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Sinopsis -->
                    <div class="detail-synopsis">
                        <h3><i class="fas fa-book-open"></i> Sinopsis:</h3>
                        <p>${detail.synopsis || 'Tidak ada sinopsis tersedia.'}</p>
                    </div>
                </div>
            </div>
            
            <!-- Daftar Chapter -->
            <div class="detail-chapters">
                <div class="chapters-header">
                    <h2><i class="fas fa-list"></i> Daftar Chapter</h2>
                    <span class="chapters-count">${detail.chapters.length} Chapter</span>
                </div>
                
                <div class="chapters-list">
                    ${detail.chapters.map((chapter, index) => `
                        <div class="chapter-item" data-slug="${chapter.slug}">
                            <div class="chapter-info">
                                <span class="chapter-number">${detail.chapters.length - index}</span>
                                <div>
                                    <span class="chapter-title">${chapter.title || `Chapter ${detail.chapters.length - index}`}</span>
                                    <span class="chapter-date">${chapter.date || ''}</span>
                                </div>
                            </div>
                            <button class="btn-read" data-slug="${chapter.slug}">
                                <i class="fas fa-play"></i> Baca
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function setupChapterListeners() {
    document.querySelectorAll('.chapter-item, .btn-read').forEach(element => {
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            const slug = element.dataset.slug || element.closest('.chapter-item').dataset.slug;
            navigateTo('reader', slug);
        });
    });
}

function setupGenreListeners() {
    // Genre tags bisa diklik untuk pencarian berdasarkan genre
    document.querySelectorAll('.genre-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const genre = tag.textContent;
            // Untuk demo, redirect ke pencarian dengan genre
            navigateTo('search', genre);
        });
    });
}
