import { use } from "react";
import "./App.css";
import { getTrendingMovies, updateSearchCount } from "./appwrite";
import MovieCard from "./components/MovieCard";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";

const App = () => {
  const [searchItem, setSearchItem] = useState("");
  const [debouncedSearchItem, setDebouncedSearchItem] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_BASE_URL = "https://api.themoviedb.org/3";
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const API_OPTIONS = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  };

  const [errorMsg, setErrorMsg] = useState("");
  const [moviesList, setMoviesList] = useState([]);
  const [isLoading, setisLoading] = useState(false);

  // Debounce the searchitem to prevent too many API calls
  // by waiting for the user to stop typing for 500ms
  useDebounce(() => setDebouncedSearchItem(searchItem), 800, [searchItem]);

  const fetchMovies = async (query = "", page = 1) => {
    setisLoading(true);
    setErrorMsg("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${query}&page=${page}`
        : `${API_BASE_URL}/discover/movie?include_video=false&language=en-US&page=${page}&sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMsg(data.Error || "Error fetching movies");
        setMoviesList([]);
        return;
      }

      setMoviesList(data.results || []);
      setTotalPages(data.total_pages || 1);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error: ${error}`);
      setErrorMsg("Error fetching movies. Please try again later.");
    } finally {
      setisLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchItem, currentPage);
  }, [debouncedSearchItem, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchItem]);

  const [trendingMovies, setTrendingMovies] = useState([]);

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  };

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="hero.png" alt="heroimg" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without The Hassle
          </h1>

          <Search searchItem={searchItem} setSearchItem={setSearchItem} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="all-movies">
          <h2>All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMsg ? (
            <p>{errorMsg}</p>
          ) : (
            <ul>
              {moviesList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </div>

        {!isLoading && !errorMsg && moviesList.length > 0 && (
          <div className="flex justify-end">
            <div className="flex items-center justify-center gap-3 mt-8  text-light-200 p-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <img
                  src="angle.png"
                  alt="prev"
                  className="w-6 h-6 opacity-70"
                />
              </button>
              <div className="px-4 py-2 bg-dark-100 rounded-md">
                {currentPage}
              </div>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage >= totalPages}
                className="cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <img
                  src="angle.png"
                  alt="prev"
                  className="w-6 h-6 opacity-70 rotate-180"
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default App;
