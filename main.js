
const API_URL = "https://agasobanuyerwanda.loexmegh.workers.dev";

let allMovies = [];
let selectedCategory = "all";
let favoriteMovies = new Map();

const token = localStorage.getItem("userToken");

// FAVORITE BUTTON STYLES
const style = document.createElement("style");

style.textContent = `
    .favorite-btn {
        display: block;
        width: calc(100% - 24px);
        margin: 10px 12px;
        padding: 11px;
        border: 1px solid #444;
        border-radius: 5px;
        background: #292929;
        color: white;
        cursor: pointer;
        font-weight: bold;
    }

    .favorite-btn:hover {
        background: #e50914;
    }

    .favorite-btn:disabled {
        opacity: 0.5;
        cursor: wait;
    }

    .movie-card .btn {
        display: block;
        margin: 10px 12px 15px;
        text-align: center;
    }

    .movie-card img {
        width: 100%;
        height: 280px;
        object-fit: cover;
    }

    .movie-card {
        overflow: hidden;
    }
`;

document.head.appendChild(style);


// LOAD MOVIES AND CATEGORIES
async function loadMovies() {
    const message = document.getElementById("loadingMessage");
    const container = document.getElementById("moviesContainer");

    message.textContent = "Loading movies...";
    container.innerHTML = "";

    try {
        const [movieResponse, categoryResponse] = await Promise.all([
            fetch(API_URL + "/api/movies"),
            fetch(API_URL + "/api/categories")
        ]);

        const movieData = await movieResponse.json();
        const categoryData = await categoryResponse.json();

        if (!movieResponse.ok || !movieData.success) {
            throw new Error("Failed to load movies.");
        }

        allMovies = movieData.movies || [];

        if (categoryResponse.ok && categoryData.success) {
            displayCategories(categoryData.categories || []);
        }

        await loadFavorites();

        message.textContent = "";
        applyFilters();

    } catch (error) {
        message.textContent =
            "Unable to load movies. Please try again.";

        console.error("Loading error:", error);
    }
}


// LOAD USER FAVORITES
async function loadFavorites() {
    favoriteMovies.clear();

    if (!token) return;

    try {
        const response = await fetch(API_URL + "/api/favorites", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            (data.favorites || []).forEach(movie => {
                favoriteMovies.set(
                    String(movie.movie_id),
                    movie.favorite_id
                );
            });
        }

    } catch (error) {
        console.error("Favorites loading error:", error);
    }
}


// DISPLAY CATEGORY BUTTONS
function displayCategories(categories) {
    const container = document.getElementById("categoryFilters");

    container.innerHTML = "";

    const allButton = document.createElement("button");
    allButton.textContent = "All Movies";
    allButton.onclick = () => filterCategory("all");

    container.appendChild(allButton);

    categories.forEach(category => {
        const button = document.createElement("button");

        button.textContent =
            category.category_name ||
            category.name ||
            "Category";

        button.onclick = () => {
            filterCategory(category.category_id);
        };

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
        .value.trim()
        .toLowerCase();

    const filteredMovies = allMovies.filter(movie => {

        const matchesSearch =
            (movie.title || "").toLowerCase().includes(keyword) ||
            (movie.description || "").toLowerCase().includes(keyword);

        const matchesCategory =
            selectedCategory === "all" ||
            String(movie.category_id) === String(selectedCategory);

        return matchesSearch && matchesCategory;
    });

    displayMovies(filteredMovies);
}


// ADD OR REMOVE FAVORITE
async function toggleFavorite(movieId, button) {

    if (!token) {
        alert("Please login to add movies to favorites.");
        window.location.href = "login.html";
        return;
    }

    button.disabled = true;

    const favoriteId = favoriteMovies.get(String(movieId));

    try {
        let response;

        if (favoriteId) {
            response = await fetch(
                API_URL + "/api/favorites/" + favoriteId,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

        } else {
            response = await fetch(API_URL + "/api/favorites", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    movie_id: movieId
                })
            });
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Favorite action failed."
            );
        }

        await loadFavorites();
        refreshFavoriteButtons();

    } catch (error) {
        alert(error.message);

    } finally {
        button.disabled = false;
    }
}


// UPDATE FAVORITE BUTTONS
function refreshFavoriteButtons() {
    document.querySelectorAll(".favorite-btn").forEach(button => {

        const movieId = button.dataset.movieId;
        const isFavorite = favoriteMovies.has(String(movieId));

        button.textContent = isFavorite
            ? "❤️ Remove from Favorites"
            : "🤍 Add to Favorites";
    });
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

        // MOVIE POSTER
        const image = document.createElement("img");

        image.src = movie.poster_url ||
            "https://placehold.co/400x550?text=GII+MOVIES";

        image.alt = movie.title || "GII MOVIES poster";
        image.loading = "lazy";

        image.onerror = function () {
            this.onerror = null;
            this.src =
                "https://placehold.co/400x550?text=GII+MOVIES";
        };

        // MOVIE TITLE
        const title = document.createElement("h3");
        title.textContent = movie.title || "Untitled Movie";

        // MOVIE DETAILS
        const details = document.createElement("p");

        details.textContent =
            (movie.release_year || "Unknown year") +
            " • " +
            (movie.description || "Enjoy this movie");

        card.append(image, title, details);

        // FAVORITE BUTTON
        const favoriteButton = document.createElement("button");

        favoriteButton.className = "favorite-btn";
        favoriteButton.dataset.movieId = movie.movie_id;

        favoriteButton.textContent = favoriteMovies.has(
            String(movie.movie_id)
        )
            ? "❤️ Remove from Favorites"
            : "🤍 Add to Favorites";

        favoriteButton.onclick = () => {
            toggleFavorite(movie.movie_id, favoriteButton);
        };

        card.appendChild(favoriteButton);

        // WATCH MOVIE BUTTON
        if (movie.video_url) {
            const watch = document.createElement("a");

            watch.href = movie.video_url;
            watch.target = "_blank";
            watch.rel = "noopener noreferrer";
            watch.className = "btn";
            watch.textContent = "▶ WATCH MOVIE";

            card.appendChild(watch);
        }

        container.appendChild(card);
    });
}


// START WEBSITE
loadMovies();
