import { API_ENDPOINTS, fetchAPI, navigateTo } from './app.js';

let currentChapterSlug = '';
let chapterData = null;

export async function loadChapterContent(slug) {
    currentChapterSlug = slug;
    const mainContent = document.getElementById('main-content');
    showLoading();
    
    try {
        chapterData = await fetchAPI(API_ENDPOINTS.chapter(slug));
        
        mainContent.innerHTML = createReaderTemplate(chapterData);
        setupReaderControls();
        setupKeyboardNavigation();
        hideLoading();
        
        // Scroll ke atas
        window.scrollTo(0, 0);
    } catch (error) {
        mainContent.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <h2>Chapter Tidak Tersedia</h2>
                <p>Chapter yang Anda cari tidak dapat dimuat.</p>
                <button onclick="history.back()" class="btn-primary">
                    <i class="fas fa-arrow-left"></i> Kembali
                </button>
            </div>
        `;
        hideLoading();
    }
}

function createReaderTemplate(data) {
    const hasPrev = data.navigation && data.navigation.prev;
    const hasNext = data.navigation && data.navigation.next;
    
    return `
        <div class="reader-container">
            <!-- Header Reader -->
            <div class="reader-header">
                <button onclick="history.back()" class="btn-back">
                    <i class="fas fa-arrow-left"></i> Kembali
                </button>
                <h1 class="reader-title">${data.title}</h1>
                <div class="reader-controls">
                    <button class="btn-control ${!hasPrev ? 'disabled' : ''}" 
                            id="prev-chapter" ${!hasPrev ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i> Sebelumnya
                    </button>
                    <button class="btn-control ${!hasNext ? 'disabled' : ''}" 
                            id="next-chapter" ${!hasNext ? 'disabled' : ''}>
                        Selanjutnya <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
            
            <!-- Navigation Bar -->
            <div class="reader-nav">
                <button class="btn-nav ${!hasPrev ? 'disabled' : ''}" id="nav-prev" ${!hasPrev ? 'disabled' : ''}>
                    <i class="fas fa-arrow-left"></i> Chapter Sebelumnya
                </button>
                <button class="btn-nav ${!hasNext ? 'disabled' : ''}" id="nav-next" ${!hasNext ? 'disabled' : ''}>
                    Chapter Selanjutnya <i class="fas fa-arrow-right"></i>
                </button>
            </div>
            
            <!-- Images -->
            <div class="reader-images" id="reader-images">
                ${data.images.map((img, index) => `
                    <div class="image-container">
                        <img src="${img}" 
                             alt="Halaman ${index + 1}" 
                             loading="${index < 5 ? 'eager' : 'lazy'}"
                             onerror="this.src='https://via.placeholder.com/800x1200/1a1a2e/6c63ff?text=Gambar+Error'"
                             class="chapter-image"
                             data-index="${index}">
                        <div class="page-number">Halaman ${index + 1}</div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Bottom Navigation -->
            <div class="reader-bottom-nav">
                <div class="bottom-nav-controls">
                    <button class="btn-bottom-nav ${!hasPrev ? 'disabled' : ''}" id="bottom-prev" ${!hasPrev ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i> Chapter Sebelumnya
                    </button>
                    <div class="chapter-info">
                        <span>${data.title}</span>
                    </div>
                    <button class="btn-bottom-nav ${!hasNext ? 'disabled' : ''}" id="bottom-next" ${!hasNext ? 'disabled' : ''}>
                        Chapter Selanjutnya <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                
                <!-- Reading Mode Controls -->
                <div class="reading-options">
                    <button class="btn-option" id="toggle-fullscreen">
                        <i class="fas fa-expand"></i> Layar Penuh
                    </button>
                    <button class="btn-option" id="toggle-darkmode">
                        <i class="fas fa-moon"></i> Mode Gelap
                    </button>
                    <button class="btn-option" id="scroll-to-top">
                        <i class="fas fa-arrow-up"></i> Ke Atas
                    </button>
                </div>
            </div>
        </div>
    `;
}

function setupReaderControls() {
    const prevBtn = document.getElementById('prev-chapter');
    const nextBtn = document.getElementById('next-chapter');
    const navPrev = document.getElementById('nav-prev');
    const navNext = document.getElementById('nav-next');
    const bottomPrev = document.getElementById('bottom-prev');
    const bottomNext = document.getElementById('bottom-next');
    
    const prevSlug = chapterData.navigation?.prev;
    const nextSlug = chapterData.navigation?.next;
    
    // Navigation functions
    const goToPrev = () => prevSlug && navigateTo('reader', prevSlug);
    const goToNext = () => nextSlug && navigateTo('reader', nextSlug);
    
    // Attach event listeners
    [prevBtn, navPrev, bottomPrev].forEach(btn => {
        if (btn) btn.addEventListener('click', goToPrev);
    });
    
    [nextBtn, navNext, bottomNext].forEach(btn => {
        if (btn) btn.addEventListener('click', goToNext);
    });
    
    // Fullscreen toggle
    document.getElementById('toggle-fullscreen')?.addEventListener('click', toggleFullscreen);
    
    // Dark mode toggle
    document.getElementById('toggle-darkmode')?.addEventListener('click', toggleDarkMode);
    
    // Scroll to top
    document.getElementById('scroll-to-top')?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Image click navigation (tap/click on image)
    document.querySelectorAll('.chapter-image').forEach(img => {
        img.addEventListener('click', (e) => {
            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            
            if (x < rect.width / 3 && prevSlug) {
                goToPrev();
            } else if (x > (rect.width * 2) / 3 && nextSlug) {
                goToNext();
            }
            // Middle click does nothing (allows zoom on mobile)
        });
    });
}

function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (['ArrowLeft', 'PageUp'].includes(e.key)) {
            e.preventDefault();
            chapterData.navigation?.prev && navigateTo('reader', chapterData.navigation.prev);
        } else if (['ArrowRight', 'PageDown', ' '].includes(e.key)) {
            e.preventDefault();
            chapterData.navigation?.next && navigateTo('reader', chapterData.navigation.next);
        } else if (e.key === 'Escape') {
            document.exitFullscreen?.();
        } else if (e.key === 'Home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (e.key === 'End') {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    });
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('reader-dark-mode');
}

// Fullscreen change listener
document.addEventListener('fullscreenchange', () => {
    const btn = document.getElementById('toggle-fullscreen');
    if (btn) {
        const icon = btn.querySelector('i');
        if (document.fullscreenElement) {
            icon.className = 'fas fa-compress';
            btn.innerHTML = '<i class="fas fa-compress"></i> Keluar Layar Penuh';
        } else {
            icon.className = 'fas fa-expand';
            btn.innerHTML = '<i class="fas fa-expand"></i> Layar Penuh';
        }
    }
});

// Lazy load images
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            imageObserver.unobserve(img);
        }
    });
}, { rootMargin: '100px' });

// Helper untuk show/hide loading (import dari app.js)
function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
          }
