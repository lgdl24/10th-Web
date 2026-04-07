import { useState } from "react";
import { type MovieResponse } from "../types/movie";
import MovieCard from "../components/MovieCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useParams } from "react-router-dom";
import { useCustomFetch } from "../hooks/useCustomFetch";

export default function MoviePage() {
  const [page, setPage] = useState(1);

  const { category } = useParams<{
    category: string;
  }>();

  const { data, loading, error } = useCustomFetch<MovieResponse>(
    `https://api.themoviedb.org/3/movie/${category}?language=ko-US&page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_KEY}`,
      },
    },
  );

  if (error) {
    return (
      <div>
        <span className="text-red-500 text-2xl">Error</span>
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
          cursor-pointer"
          onClick={(): void => setPage((prev): number => prev + 1)}
        >
          {`>`}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-dvh">
          <LoadingSpinner />
        </div>
      )}

      {!loading && (
        <div className="p-10 gap-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {data?.results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </>
  );
}
