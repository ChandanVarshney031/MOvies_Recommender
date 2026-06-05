// Admin Dashboard Scripts

// DOM Elements
const uploadBtn = document.getElementById('uploadBtn');
const csvFileInput = document.getElementById('csvFileInput');
const uploadStatus = document.getElementById('uploadStatus');
const statsContainer = document.getElementById('statsContainer');
const totalMoviesStat = document.getElementById('totalMoviesStat');
const clearDataBtn = document.getElementById('clearDataBtn');

// Storage Key
const STORAGE_KEY = 'cinematch_movies';

// Initialize
function init() {
    updateStats();
}

// ------ CSV Handling ------

uploadBtn.addEventListener('click', () => {
    csvFileInput.click();
});

csvFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    uploadStatus.textContent = "Parsing CSV...";
    uploadStatus.style.color = "var(--text-secondary)";

    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function (results) {
            processCSVData(results.data);

            // Re-render stats based on new data
            updateStats();
        },
        error: function (error) {
            uploadStatus.textContent = "Error parsing file: " + error.message;
            uploadStatus.style.color = "#ef4444"; // red
        }
    });

    // Reset file input so same file can be uploaded again if needed
    csvFileInput.value = '';
});

function processCSVData(data) {
    const newMovies = [];

    data.forEach(row => {
        // Basic validation
        if (!row.title || !row.poster_path) return;

        // Parse Genres (Handle Python-style list string from CSV)
        let genres = [];
        if (typeof row.genres === 'string') {
            try {
                // Regex to extract names from string like "[{'id': 16, 'name': 'Animation'}, ...]"
                const matches = row.genres.matchAll(/'name':\s*'([^']+)'/g);
                for (const match of matches) {
                    genres.push(match[1]);
                }
            } catch (e) {
                console.warn("Genre parse error", e);
            }
        }

        const movie = {
            id: row.id,
            title: row.title,
            genre: genres,
            rating: row.vote_average || 0,
            type: "Movie",
            year: row.release_date ? String(row.release_date).substring(0, 4) : "Unknown",
            description: row.overview || "",
            image: `https://image.tmdb.org/t/p/w500${row.poster_path}`
        };

        newMovies.push(movie);
    });

    if (newMovies.length > 0) {
        // Save to localStorage
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newMovies));
            uploadStatus.textContent = `Successfully loaded and saved ${newMovies.length} movies!`;
            uploadStatus.style.color = "#10b981"; // green
            console.log("Updated movies database in localStorage:", newMovies.length);
        } catch (e) {
            console.error("Error saving to localStorage", e);
            if (e.name === 'QuotaExceededError') {
                uploadStatus.textContent = "Error: LocalStorage quota exceeded. The dataset is too large.";
            } else {
                uploadStatus.textContent = "Error saving data.";
            }
            uploadStatus.style.color = "#ef4444"; // red
        }
    } else {
        uploadStatus.textContent = "No valid movie entries found in CSV.";
        uploadStatus.style.color = "#ef4444"; // red
    }
}

// ------ Database Management ------

function updateStats() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        try {
            const movies = JSON.parse(savedData);
            statsContainer.style.display = 'block';
            totalMoviesStat.textContent = movies.length;
        } catch (e) {
            console.error("Error reading localStorage", e);
            statsContainer.style.display = 'none';
        }
    } else {
        statsContainer.style.display = 'none';
    }
}

clearDataBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear the custom database? This will revert the User Dashboard to the default movie set.")) {
        localStorage.removeItem(STORAGE_KEY);
        updateStats();
        uploadStatus.textContent = "Database cleared.";
        uploadStatus.style.color = "var(--text-secondary)";
    }
});

// Start
init();
