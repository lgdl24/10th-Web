import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { MovieDetails, CreditsResponse } from "../types/movie";
import axios from "axios";

export default function MovieDetailPage() {
  const [movieDetails, setMovieDetails] = useState<MovieDetails>();
  const [credits, setCredits] = useState<CreditsResponse>();
  const { movie_id } = useParams();
  //https://api.themoviedb.org/3/movie/{movie_id}
  useEffect(() => {
    const getMovieDetails = async (): Promise<void> => {
      const { data } = await axios.get<MovieDetails>(
        `https://api.themoviedb.org/3/movie/${movie_id}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_KEY}`,
          },
        },
      );
      //console.log(data.data);
      setMovieDetails(data);
      console.log(data);

      const { data: creditData } = await axios.get<CreditsResponse>(
        `https://api.themoviedb.org/3/movie/${movie_id}/credits`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_KEY}`,
          },
        },
      );
      setCredits(creditData);
      console.log(creditData);
    };
    getMovieDetails();
  }, []);
  return (
    <>
      <div>
        <img
          src={`https://image.tmdb.org/t/p/original${movieDetails?.backdrop_path}`}
          alt={`${movieDetails?.title} 영화의 이미지`}
          className=""
        />
        <h1>{movieDetails?.title}</h1>
        <p>{movieDetails?.vote_average}</p>
        <p>{movieDetails?.release_date}</p>
        <p>{movieDetails?.runtime}</p>
        <p>{movieDetails?.overview}</p>
      </div>
      <h2>출연진</h2>
      <div className="p-10 gap-4 grid grid-cols-6">
        {credits?.cast.map((actor) => (
          <div key={actor.id}>
            <img
              src={
                actor.profile_path
                  ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                  : "/default-profile.png"
              }
              className="w-40 h-40 object-cover rounded-full"
            />
            <div>{actor.name}</div>
          </div>
        ))}
      </div>
      <h1>제작진</h1>
      <div className="p-10 gap-4 grid grid-cols-6">
        {credits?.crew.map((producer) => (
          <div key={producer.id}>
            <img
              src={
                producer.profile_path
                  ? `https://image.tmdb.org/t/p/w200${producer.profile_path}`
                  : "/default-profile.png"
              }
              className="w-40 h-40 object-cover rounded-full"
            />
            <div>{producer.name}</div>
          </div>
        ))}
      </div>
    </>
  );
}
