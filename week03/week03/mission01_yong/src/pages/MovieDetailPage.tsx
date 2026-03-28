import { useEffect } from "react";
import { useParams } from "react-router-dom";
import type { MovieDetails } from "../types/movie";
import axios from "axios";

export default function MovieDetailPage() {
  const [movieDetails, setMovieDetails] = useState<MovieDetails>();
  const params = useParams();
  //https://api.themoviedb.org/3/movie/{movie_id}

  useEffect(() => {
    const getMovieDetails = async (): Promise<void> => {
      const data = await axios.get(
        `https://api.themoviedb.org/3/movie/{movie_id}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_KEY}`,
          },
        },
      );
      //console.log(data.data);
      setMovieDetails(data);
      console.log(movieDetails);
    };
  });
  return <div></div>;
}
