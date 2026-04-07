import { useMemo } from "react";
import { useParams } from "react-router-dom";
import type { MovieDetails, CreditsResponse } from "../types/movie";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useCustomFetch } from "../hooks/useCustomFetch";

export default function MovieDetailPage() {
  const { movie_id } = useParams();

  const requestConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_KEY}`,
      },
    }),
    [],
  );

  const {
    data: movieDetails,
    loading: movieLoading,
    error: movieError,
  } = useCustomFetch<MovieDetails>(
    movie_id
      ? `https://api.themoviedb.org/3/movie/${movie_id}?language=ko-US`
      : "",
    requestConfig,
  );

  const {
    data: credits,
    loading: creditsLoading,
    error: creditsError,
  } = useCustomFetch<CreditsResponse>(
    movie_id
      ? `https://api.themoviedb.org/3/movie/${movie_id}/credits?language=ko-US`
      : "",
    requestConfig,
  );

  const isPending = movieLoading || creditsLoading;
  const isError = movieError || creditsError;

  const uniqueCrew = credits?.crew.filter(
    (person, index, self) =>
      index === self.findIndex((p) => p.id === person.id),
  );

  if (isError) {
    return (
      <div>
        <span className="text-red-500 text-2xl">요청에 실패하였습니다.</span>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-dvh bg-black/95">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-black/95">
      <div className="relative mb-4">
        <img
          src={`https://image.tmdb.org/t/p/original${movieDetails?.backdrop_path}`}
          alt={`${movieDetails?.title} 영화의 이미지`}
          className="w-full h-[600px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />

        <div className="absolute inset-0 p-6 text-white">
          <h1 className="mb-2 text-3xl font-bold">{movieDetails?.title}</h1>

          <p>⭐ {movieDetails?.vote_average}점</p>
          <p>개봉일 : {movieDetails?.release_date}</p>
          <p className="mb-3">상영시간 : {movieDetails?.runtime}분</p>

          <h2 className="mb-3 text-xl font-semibold italic">
            {movieDetails?.tagline}
          </h2>

          <p className="max-w-[500px] overflow-hidden">
            {movieDetails?.overview}
          </p>
        </div>
      </div>

      <h2 className="text-5xl font-bold text-white px-10 mt-10">출연진</h2>
      <div className="p-10 gap-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {credits?.cast.map((actor) => (
          <div
            key={actor.id}
            className="flex flex-col items-center justify-center text-center transition duration-300 hover:-translate-y-1"
          >
            <img
              src={
                actor.profile_path
                  ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                  : "/default-profile.png"
              }
              className="mb-2 w-40 h-40 object-cover rounded-full border-2 border-white transition duration-300 hover:scale-110 hover:shadow-lg hover:border-blue-400 hover:border-[4px]"
            />
            <div className="text-white">{actor.name}</div>
            <div className="text-gray-600">{actor.original_name}</div>
          </div>
        ))}
      </div>

      <h2 className="text-5xl font-bold text-white px-10 mt-10">제작진</h2>
      <div className="p-10 gap-4 grid grid-cols-6">
        {uniqueCrew?.map((producer) => (
          <div
            key={producer.id}
            className="flex flex-col items-center justify-center text-center transition duration-300 hover:-translate-y-1"
          >
            <img
              src={
                producer.profile_path
                  ? `https://image.tmdb.org/t/p/w200${producer.profile_path}`
                  : "/default-profile.png"
              }
              className="mb-2 w-40 h-40 object-cover rounded-full border-2 border-white transition duration-300 hover:scale-110 hover:shadow-lg hover:border-blue-400 hover:border-[4px]"
            />
            <div className="text-white">{producer.name}</div>
            <div className="text-gray-600">{producer.original_name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
