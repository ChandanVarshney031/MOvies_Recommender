// DOM Elements
const genreContainer = document.getElementById('genreContainer');
const recommendationsSection = document.getElementById('recommendationsSection');
const moviesGrid = document.getElementById('moviesGrid');
const resetBtn = document.getElementById('resetBtn');
const interestSection = document.getElementById('interestSection');
const loadMoreBtn = document.getElementById('loadMoreBtn');

// State
let allMovies = [...moviesData];
let filteredMovies = [];
let selectedGenres = [];
let currentDisplayCount = 0;
const MOVIES_PER_PAGE = 50;

// Initialize
function init() {
    renderGenres();
}

// ------ Core Logic ------


// Render Genre Tags
function renderGenres() {
    genreContainer.innerHTML = '';

    // Calculate dynamic genres from current allMovies
    const uniqueGenres = [...new Set(allMovies.flatMap(movie => movie.genre))].sort();

    uniqueGenres.forEach(genre => {
        const tag = document.createElement('div');
        tag.classList.add('genre-tag');
        tag.textContent = genre;
        if (selectedGenres.includes(genre)) {
            tag.classList.add('active');
        }
        tag.addEventListener('click', () => toggleGenre(genre, tag));
        genreContainer.appendChild(tag);
    });
}

// Handle Genre Selection
function toggleGenre(genre, tagElement) {
    if (selectedGenres.includes(genre)) {
        selectedGenres = selectedGenres.filter(g => g !== genre);
        tagElement.classList.remove('active');
    } else {
        selectedGenres.push(genre);
        tagElement.classList.add('active');
    }

    if (selectedGenres.length > 0) {
        showRecommendations();
    } else {
        // Keep recommendations visible but maybe filter logic handles empty
        showRecommendations();
    }
}

// Filter and Render Movies
function showRecommendations() {
    // 1. Filter
    if (selectedGenres.length === 0) {
        recommendationsSection.style.display = 'none';
        return;
    }

    filteredMovies = allMovies.filter(movie => {
        return selectedGenres.some(genre => movie.genre.includes(genre));
    });

    // 2. Sort by Rating (Descending)
    filteredMovies.sort((a, b) => b.rating - a.rating);

    // 3. Reset Pagination
    currentDisplayCount = 0;
    moviesGrid.innerHTML = '';

    // 4. Render First Page
    renderNextPage();

    // Show section
    recommendationsSection.style.display = 'block';
}

function renderNextPage() {
    const nextBatch = filteredMovies.slice(currentDisplayCount, currentDisplayCount + MOVIES_PER_PAGE);

    if (nextBatch.length === 0 && currentDisplayCount === 0) {
        moviesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No matches found. Try combining different genres!</p>';
        loadMoreBtn.style.display = 'none';
        return;
    }

    renderMovies(nextBatch);
    currentDisplayCount += nextBatch.length;

    // Toggle Load More Button
    if (currentDisplayCount < filteredMovies.length) {
        loadMoreBtn.style.display = 'inline-block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

loadMoreBtn.addEventListener('click', () => {
    renderNextPage();
});

// Render Movie Cards (Appends to grid)
function renderMovies(movies) {
    movies.forEach(movie => {
        const card = document.createElement('div');
        card.classList.add('movie-card');

        const starHTML = '★';

        card.innerHTML = `
            <img src="${movie.image}" alt="${movie.title}" class="movie-poster" loading="lazy" onerror="this.onerror=null; this.src='https://placehold.co/500x750/1a1a2e/e94560?text=No+Poster';">
            <div class="movie-info">
                <div class="movie-header">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-rating"><span>${starHTML}</span> ${movie.rating}</div>
                </div>
                <div class="movie-meta">
                    <span class="movie-year">${movie.year}</span>
                    <span class="movie-type">${movie.type}</span>
                </div>
                <p class="movie-desc">${movie.description}</p>
                <div class="tags-container">
                    ${movie.genre.slice(0, 3).map(g => `<span class="tag-pill">${g}</span>`).join('')}
                </div>
            </div>
        `;

        moviesGrid.appendChild(card);
    });
}

// Reset Handler
resetBtn.addEventListener('click', () => {
    selectedGenres = [];
    document.querySelectorAll('.genre-tag').forEach(t => t.classList.remove('active'));
    recommendationsSection.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Start
init();
