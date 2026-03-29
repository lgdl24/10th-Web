import "./App.css";
import MoviePage from "./pages/MoviePage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import MovieDetailPage from "./pages/MovieDetailPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />, // 여기서 자식을 내려줄 때 outlet 처리를 해줘야함
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "movies/:category",
        element: <MoviePage />,
      },
      {
        path: "movies/:movieId",
        element: <MovieDetailPage />,
      },
    ],
  },
]);

// movie/upcoming
// movie/popular
// movie/now_playing
// movie/top_rated

// movie?category=upcoming
//movie?category=~~~
// movie/catergory/{movie_id}

function App() {
  return <RouterProvider router={router} />;
}

export default App;
