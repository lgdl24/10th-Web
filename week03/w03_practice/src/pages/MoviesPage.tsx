import { useEffect, useState } from "react";
import type { Movie, MovieResponse } from "../types/movie";
import axios from "axios";

const MoviesPage = () => {
  const [movies, setMovies] = useState<Movie[]>([]);

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
    <ul>
      {movies?.map((movie) => (
        <li key={movie.id}>
          <h2>{movie.title}</h2>
          <p>{movie.release_date}</p>
        </li>
      ))}
    </ul>
  );
};

export default MoviesPage;
