import { useEffect, useState } from "react";
import axios from "axios";
import { type MovieResponse, type Movie } from "../types/movie";
import MovieCard from "../components/MovieCard";
import { LoadingSpinner } from "../components/LoadingSpinner";

export default function MoviePage() {
  // 영화 담는 상태
  const [movies, setMovies] = useState<Movie[]>([]);
  // 1. 로딩 상태
  const [isPending, setIsPending] = useState(false);
  // 2. 에러 상태
  const [isError, setIsError] = useState(false);
  //3. vpdlwl
  const [page, setPage] = useState(1);
  useEffect(() => {
    const fetchMovies = async (): Promise<void> => {
      setIsPending(true);
      try {
        const { data } = await axios.get<MovieResponse>(
          `https://api.themoviedb.org/3/movie/popular?language=ko-US&page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_TMDB_KEY}`,
            },
          },
        );
        console.log(data);
        setMovies(data.results);
        setIsPending(false);
      } catch {
        setIsError(true);
      } finally {
        setIsPending(false);
      }
    };
    fetchMovies();
  }, [page]);

  if (isError) {
    return (
      <div>
        <span className="text-red-500 text-2xl">123</span>
      </div>
    );
  }
  return (
    <>
      <div className="flex items-center justify-center gap-6 mt-5">
        <button
          className="bg-[#dda5e3] text-white px-6 py-3 rounded-lg shadow-md 
          hover:bg-[#b2dab1] trasition-all duration-200 disabled:bg-gray-300
          cursor-pointer disabled:cursor-not-allowed"
          disabled={page === 1}
          onClick={(): void => setPage((prev): number => prev - 1)}
        >
          {`<`}
        </button>
        <button
          className="bg-[#dda5e3] text-white px-6 py-3 rounded-lg shadow-md 
          hover:bg-[#b2dab1] trasition-all duration-200 
          cursor-pointer "
          onClick={(): void => setPage((prev): number => prev + 1)}
        >
          {`>`}
        </button>
      </div>

      {isPending && (
        <div className="flex items-center justify-center h-dvh">
          <LoadingSpinner />
        </div>
      )}

      {!isPending && (
        <div className="p-10 gap-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {movies?.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </>
  );
}
