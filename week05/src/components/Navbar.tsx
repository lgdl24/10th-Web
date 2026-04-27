import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="flex items-center  h-16 px-4 bg-gray-100">
      <Link to="/" className="text-xl font-bold text-gray-700">
        Home
      </Link>
      <div className="ml-auto flex gap-2">
        <Link
          to="/login"
          className="border border-gray-300 rounded px-3 py-2 bg-blue-500 text-white hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          로그인
        </Link>
        <Link
          to="/signup"
          className="border border-gray-300 rounded px-3 py-2 bg-blue-500 text-white hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
