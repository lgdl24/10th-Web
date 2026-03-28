import { useEffect, useState } from "react";
import axios from "axios";

export default function MoviePage() {
  // 영화 담는 상태
  const [movies, setMovies] = useState([]);
  useEffect(() => {
    const fetchMovies = async (): Promise<void> => {
      const { data } = await axios(
        `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_KEY}`,
          },
        },
      );

      setMovies(data.results);
    };
    fetchMovies();
  }, []);

  console.log(movies);
  return <div>MoviePage</div>;
}
