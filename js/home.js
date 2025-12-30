import { API_ENDPOINTS, fetchAPI, navigateTo } from './app.js';

export async function loadHomeContent(section = 'home') {
    const mainContent = document.getElementById('main-content');
    
    try {
        let data;
        let title = 'Komik Terbaru';
        
        if (section === 'home' || section === 'latest') {
            data = await fetchAPI(API_ENDPOINTS.latest);
            title = 'Komik Terbaru';
        } else if (section === 'popular') {
            // Untuk demo, gunakan API latest
            data = await fetchAPI(API_ENDPOINTS.latest);
            title = 'Komik Populer';
        }
        
        mainContent.innerHTML = createHomeTemplate(title, data.komikList);
        setupComicEventListeners();
        setupTypeFilters();
    } catch (error) {
        mainContent.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <h2>Gagal Memuat Data</h2>
                <p>Silakan coba lagi nanti</p>
            </div>
        `;
    }
}

function createHomeTemplate(title, comics) {
    return `
        <div class="home-container">
            <div class="section-header">
                <h1 class="section-title">${title}</h1>
                <div class="type-filters" id="type-filters">
                    <button class="type-filter active" data-type="all">Semua</button>
                    <button class="type-filter" data-type="manga">Manga</button>
                    <button class="type-filter" data-type="manhwa">Manhwa</button>
                    <button class="type-filter" data-type="manhua">Manhua</button>
                </div>
            </div>
            
            <div class="comics-grid" id="comics-grid">
                ${comics.map(comic => createComicCard(comic)).join('')}
            </div>
            
            <div class="load-more-container">
                <button class="btn-load-more" id="load-more">
                    <i class="fas fa-sync-alt"></i> Muat Lebih Banyak
                </button>
            </div>
        </div>
    `;
}

function createComicCard(comic) {
    const typeClass = comic.type.toLowerCase();
    const dateText = comic.date || '';
    const chapterText = comic.chapter || '';
    
    return `
        <div class="comic-card" data-type="${typeClass}" data-slug="${comic.slug}">
            <div class="comic-cover">
                <img src="${comic.cover}" alt="${comic.title}"
                     onerror="this.src='https://via.placeholder.com/146x208/1a1a2e/6c63ff?text=No+Cover'">
                <div class="comic-badges">
                    <span class="type-badge ${typeClass}">${comic.type}</span>
                    ${comic.rating ? `<span class="rating-badge"><i class="fas fa-star"></i> ${comic.rating}</span>` : ''}
                </div>
            </div>
            <div class="comic-info">
                <h3 class="comic-title">${comic.title}</h3>
                ${chapterText ? `<p class="comic-chapter"><i class="fas fa-bookmark"></i> ${chapterText}</p>` : ''}
                ${dateText ? `<p class="comic-date"><i class="far fa-clock"></i> ${dateText}</p>` : ''}
            </div>
        </div>
    `;
}

function setupComicEventListeners() {
    document.querySelectorAll('.comic-card').forEach(card => {
        card.addEventListener('click', () => {
            const slug = card.dataset.slug;
            navigateTo('detail', slug);
        });
    });
}

function setupTypeFilters() {
    const filters = document.querySelectorAll('.type-filter');
    const comicCards = document.querySelectorAll('.comic-card');
    
    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Update active filter
            filters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            
            const selectedType = filter.dataset.type;
            
            // Filter comics
            comicCards.forEach(card => {
                if (selectedType === 'all' || card.dataset.type === selectedType) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}
