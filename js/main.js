
console.log("Welcome to GII MOVIES!");

const API_URL = "https://agasobanuyerwanda.loexmegh.workers.dev";

let allMovies = [];

async function loadMovies() {
    const container = document.getElementById("moviesContainer");
    const loading = document.getElementById("loadingMessage");

    try {
        const response = await fetch(API_URL + "/api/movies");
        const data = await response.json();

        if (!data.success) {
            throw new Error("Failed to load movies");
        }

        allMovies = data.movies;

        loading.textContent = allMovies.length === 0
            ? "No movies available yet."
            : "";

        displayMovies(allMovies);
        loadCategories();

    } catch (error) {
        loading.textContent = "Unable to load movies. Please try again.";
        console.error(error);
    }
}

function displayMovies(movies) {
    const container = document.getElementById("moviesContainer");

    container.innerHTML = "";

    movies.forEach(movie => {
        const link = document.createElement("a");
        link.className = "movie-link";
        link.href = "details.html?id=" + movie.movie_id;

        const card = document.createElement("div");
        card.className = "movie-card";

        const image = document.createElement("img");
        image.src = movie.poster_url || "https://placehold.co/400x250?text=GII+MOVIES";
        image.alt = movie.title;

        const title = document.createElement("h3");
        title.textContent = movie.title;

        const description = document.createElement("p");
        description.textContent =
            (movie.release_year || "") + " • " + (movie.description || "");

        card.append(image, title, description);
        link.appendChild(card);
        container.appendChild(link);
    });
}

async function loadCategories() {
    try {
        const response = await fetch(API_URL + "/api/categories");
        const data = await response.json();

        const filters = document.getElementById("categoryFilters");

        data.categories.forEach(category => {
            const button = document.createElement("button");

            button.textContent = category.category_name;
            button.onclick = () =>
                filterCategory(category.category_name);

            filters.appendChild(button);
        });

    } catch (error) {
        console.error("Categories error:", error);
    }
}

function filterCategory(category) {
    if (category === "all") {
        displayMovies(allMovies);
        return;
    }

    const filtered = allMovies.filter(movie =>
        movie.category_name === category
    );

    displayMovies(filtered);
}

function searchMovies() {
    const input = document.getElementById("searchInput");
    const filter = input.value.toLowerCase();

    const filtered = allMovies.filter(movie =>
        movie.title.toLowerCase().includes(filter)
    );

    displayMovies(filtered);
}

loadMovies();
