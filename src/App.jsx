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

	const fetchMovies = async (query = "") => {
		setisLoading(true);
		setErrorMsg("");

		try {
			const endpoint = query
				? `${API_BASE_URL}/search/movie?query=${query}`
				: `${API_BASE_URL}/discover/movie?include_video=false&language=en-US&page=1&sort_by=popularity.desc`;
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
		fetchMovies(debouncedSearchItem);
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

				{
					trendingMovies.length > 0 && (
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
					)
				}

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
			</div>
		</main>
	);
};

export default App;
