import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BurgerIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="4"
      d="M7.95 11.95h32m-32 12h32m-32 12h32"
    />
  </svg>
);

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { accessToken, name, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="flex items-center h-16 px-4 bg-zinc-900 shrink-0 border-b border-zinc-800">
      <button onClick={onMenuClick} className="mr-3 text-zinc-300 hover:text-white transition-colors">
        <BurgerIcon />
      </button>

      <Link to="/" className="text-xl font-bold text-white">
        Home
      </Link>

      <div className="ml-auto flex items-center gap-3">
        {!accessToken ? (
          <>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-500 transition"
            >
              로그인
            </Link>
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-500 transition"
            >
              회원가입
            </Link>
          </>
        ) : (
          <>
            <span className="text-zinc-300 font-medium hidden sm:inline">
              {name}님 반갑습니다.
            </span>
            <button
              className="bg-blue-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-500 transition"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
