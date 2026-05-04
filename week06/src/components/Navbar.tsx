import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { accessToken, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex items-center h-16 px-4 bg-gray-100">
      <Link to="/" className="text-xl font-bold text-gray-700">
        Home
      </Link>

      {!accessToken ? (
        <div className="ml-auto flex gap-2">
          <Link
            to="/login"
            className="bg-blue-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            로그인
          </Link>
          <Link
            to="/signup"
            className="bg-blue-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            회원가입
          </Link>
        </div>
      ) : (
        <button
          className="ml-auto bg-blue-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          onClick={handleLogout}
        >
          로그아웃
        </button>
      )}
    </div>
  );
};

export default Navbar;

// w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition
