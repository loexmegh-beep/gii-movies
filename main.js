
const API_URL = "https://agasobanuyerwanda.loexmegh.workers.dev";

let allMovies = [];
let selectedCategory = "all";

// LOAD MOVIES AND CATEGORIES
async function loadMovies() {
    const message = document.getElementById("loadingMessage");

    try {
        const [movieResponse, categoryResponse] = await Promise.all([
            fetch(API_URL + "/api/movies"),
            fetch(API_URL + "/api/categories")
        ]);

        const movieData = await movieResponse.json();
        const categoryData = await categoryResponse.json();

        if (!movieResponse.ok || !movieData.success) {
            throw new Error("Failed to load movies");
        }

        allMovies = movieData.movies || [];

        if (categoryResponse.ok && categoryData.success) {
            displayCategories(categoryData.categories || []);
        }

        message.textContent = "";
        displayMovies(allMovies);

    } catch (error) {
        message.textContent = "Unable to load movies. Please try again.";
        console.error(error);
    }
}

// DISPLAY CATEGORY BUTTONS
function displayCategories(categories) {
    const container = document.getElementById("categoryFilters");

    container.innerHTML = `
        <button onclick="filterCategory('all')">All</button>
    `;

    categories.forEach(category => {
        const button = document.createElement("button");

        const categoryId = category.category_id;
        const categoryName =
            category.category_name ||
            category.name ||
            category.title ||
            "Category";

        button.textContent = categoryName;

        button.onclick = () => filterCategory(categoryId);

        container.appendChild(button);
    });
}

// FILTER BY CATEGORY
function filterCategory(categoryId) {
    selectedCategory = categoryId;
    applyFilters();
}

// SEARCH MOVIES
function searchMovies() {
    applyFilters();
}

// APPLY SEARCH AND CATEGORY FILTERS
function applyFilters() {
    const keyword = document
        .getElementById("searchInput")
        .value.toLowerCase();

    const filteredMovies = allMovies.filter(movie => {
        const matchesSearch =
            (movie.title || "").toLowerCase().includes(keyword);

        const matchesCategory =
            selectedCategory === "all" ||
            String(movie.category_id) === String(selectedCategory);

        return matchesSearch && matchesCategory;
    });

    displayMovies(filteredMovies);
}

// DISPLAY MOVIE CARDS
function displayMovies(movies) {
    const container = document.getElementById("moviesContainer");
    const message = document.getElementById("loadingMessage");

    container.innerHTML = "";

    const activeMovies = movies.filter(movie =>
        movie.status === "active"
    );

    if (activeMovies.length === 0) {
        message.textContent = "No movies found.";
        return;
    }

    message.textContent = "";

    activeMovies.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";

        const image = document.createElement("img");
        image.src = movie.poster_url ||
            "https://placehold.co/400x550?text=GII+MOVIES";
        image.alt = movie.title;

        image.onerror = function () {
            this.src = "https://placehold.co/400x550?text=GII+MOVIES";
        };

        const title = document.createElement("h3");
        title.textContent = movie.title;

        const details = document.createElement("p");
        details.textContent =
            (movie.release_year || "Unknown year") +
            " • " +
            (movie.description || "Enjoy this movie");

        card.append(image, title, details);

        if (movie.video_url) {
            const watch = document.createElement("a");

            watch.href = movie.video_url;
            watch.target = "_blank";
            watch.rel = "noopener noreferrer";
            watch.className = "btn";
            watch.textContent = "WATCH MOVIE";

            card.appendChild(watch);
        }

        container.appendChild(card);
    });
}

// START
loadMovies();
