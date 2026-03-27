import { useEffect, useState } from "react";
import type { Movie, MovieResponse } from "../types/movie";
import axios from "axios";

const MoviesPage = () => {
  const [movies, setMovies] = useState<Movie[]>([]);

  console.log(movies);

  useEffect(() => {
    const fetchMovies = async () => {
      const { data } = await axios.get<MovieResponse>(
        "https://api.themoviedb.org/3/movie/popular?language=ko-KR&page=1",
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2MzA4NjMyNTk1NWY2YmQ2NzZmMWY5OWVhNjIzOThmNSIsIm5iZiI6MTc3NDQyNjU4OS45Njk5OTk4LCJzdWIiOiI2OWMzOTlkZGZiMDA4Mjk3MmNiNjBjOTUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.XuHF0R4kyu_MWj73R6otSfoJQJ2XV_SA1Anhy91sLxI`,
          },
        },
      );
      setMovies(data.results);
    };
    fetchMovies();
  }, []);

  return (
    <>
      <ul className="grid grid-cols-6 gap-4 list-none p-0">
        {movies.map((movie) => (
          <li
            key={movie.id}
            className="relative group w-full aspect-[2/3] overflow-hidden"
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-full object-cover rounded-lg transition group-hover:blur-sm"
            />

            <div className="absolute inset-0 flex flex-col justify-center items-center text-white opacity-0 group-hover:opacity-100 transition p-2 bg-black/50">
              <h2 className="text-sm font-bold text-center">{movie.title}</h2>
              <p className="text-xs mt-1 line-clamp-3">{movie.overview}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default MoviesPage;
