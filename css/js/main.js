// GII MOVIES MAIN JAVASCRIPT

console.log("Welcome to GII MOVIES!");

function searchMovies() {
    const input = document.getElementById("searchInput");
    const filter = input.value.toLowerCase();

    const movies = document.querySelectorAll(".movie-card");

    movies.forEach(movie => {
        const title = movie.querySelector("h3").textContent.toLowerCase();

        movie.style.display = title.includes(filter) ? "block" : "none";
    });
}
