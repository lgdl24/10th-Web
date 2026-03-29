import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { MovieDetails } from "../types/movie";
import axios from "axios";

export default function MovieDetailPage() {
  const [movieDetails, setMovieDetails] = useState<MovieDetails>();
  const { movie_id } = useParams();
  //https://api.themoviedb.org/3/movie/{movie_id}
  console.log("렌더됨");
  useEffect(() => {
    const getMovieDetails = async (): Promise<void> => {
      const { data } = await axios.get(
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
    };
    console.log("이규동");
    getMovieDetails();
  }, [movie_id]);
  return (
    <div>
      <h1>{movieDetails?.title}</h1>
    </div>
  );
}
