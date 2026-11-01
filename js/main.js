
console.log("Welcome to GII MOVIES!");

const API_URL = "https://agasobanuyerwanda.loexmegh.workers.dev";

let allMovies = [];
let allCategories = [];
let selectedCategory = "all";
let favoriteMovies = new Map();

const token = localStorage.getItem("userToken");

// FAVORITES BUTTON STYLE
const style = document.createElement("style");

style.textContent = `
.favorite-btn {
    display: block;
    width: 100%;
    padding: 11px;
    margin-top: 10px;
    background: #333;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
}

.favorite-btn:hover {
    background: #e50914;
}
`;

document.head.appendChild(style);

// LOAD MOVIES
async function loadMovies() {
    const loading = document.getElementById("loadingMessage");

    try {
        const response = await fetch(API_URL + "/api/movies");
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error("Failed to load movies");
        }

        allMovies = data.movies || [];

        await loadCategories();
        await loadFavorites();

        loading.textContent = "";
        applyFilters();

    } catch (error) {
        loading.textContent = "Unable to load movies. Please try again.";
        console.error(error);
    }
}

// LOAD CATEGORIES
async function loadCategories() {
    try {
        const response = await fetch(API_URL + "/api/categories");
        const data = await response.json();

        if (!response.ok || !data.success) return;

        allCategories = data.categories || [];

        const filters = document.getElementById("categoryFilters");

        filters.innerHTML = `
            <button onclick="filterCategory('all')">All</button>
        `;

        allCategories.forEach(category => {
            const button = document.createElement("button");

            button.textContent = category.category_name;

            button.onclick = () =>
                filterCategory(category.category_id);

            filters.appendChild(button);
        });

    } catch (error) {
        console.error("Categories error:", error);
    }
}

// LOAD USER FAVORITES
async function loadFavorites() {
    favoriteMovies.clear();

    if (!token) return;

    try {
        const response = await fetch(API_URL + "/api/favorites", {
            headers: {
                "Authorization": "Bearer " + token
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
        console.error("Favorites error:", error);
    }
}

// FILTER CATEGORY
function filterCategory(categoryId) {
    selectedCategory = categoryId;
    applyFilters();
}

// SEARCH MOVIES
function searchMovies() {
    applyFilters();
}

// APPLY FILTERS
function applyFilters() {
    const input = document.getElementById("searchInput");
    const keyword = input.value.toLowerCase();

    const filtered = allMovies.filter(movie => {

        const matchesSearch =
            (movie.title || "").toLowerCase().includes(keyword);

        const matchesCategory =
            selectedCategory === "all" ||
            String(movie.category_id) === String(selectedCategory);

        return matchesSearch && matchesCategory;
    });

    displayMovies(filtered);
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
                        "Authorization": "Bearer " + token
                    }
                }
            );

        } else {
            response = await fetch(API_URL + "/api/favorites", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    movie_id: movieId
                })
            });
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Favorite action failed");
        }

        await loadFavorites();
        applyFilters();

        alert(data.message);

    } catch (error) {
        alert(error.message);
        button.disabled = false;
    }
}

// DISPLAY MOVIES
function displayMovies(movies) {
    const container = document.getElementById("moviesContainer");
    const loading = document.getElementById("loadingMessage");

    container.innerHTML = "";

    if (movies.length === 0) {
        loading.textContent = "No movies found.";
        return;
    }

    loading.textContent = "";

    movies.forEach(movie => {

        const card = document.createElement("div");
        card.className = "movie-card";

        // MOVIE DETAILS LINK
        const link = document.createElement("a");

        link.className = "movie-link";
        link.href = "details.html?id=" + movie.movie_id;

        const image = document.createElement("img");

        image.src = movie.poster_url ||
            "https://placehold.co/400x550?text=GII+MOVIES";

        image.alt = movie.title || "Movie";

        image.onerror = function () {
            this.src = "https://placehold.co/400x550?text=GII+MOVIES";
        };

        const title = document.createElement("h3");
        title.textContent = movie.title;

        const description = document.createElement("p");

        description.textContent =
            (movie.release_year || "") +
            " • " +
            (movie.description || "Enjoy this movie");

        link.append(image, title, description);

        card.appendChild(link);

        // FAVORITES BUTTON
        const favoriteButton = document.createElement("button");

        favoriteButton.className = "favorite-btn";
        favoriteButton.dataset.movieId = movie.movie_id;

        favoriteButton.textContent =
            favoriteMovies.has(String(movie.movie_id))
                ? "❤️ Remove from Favorites"
                : "🤍 Add to Favorites";

        favoriteButton.onclick = () => {
            toggleFavorite(movie.movie_id, favoriteButton);
        };

        card.appendChild(favoriteButton);

        container.appendChild(card);
    });
}

// START WEBSITE
loadMovies();
