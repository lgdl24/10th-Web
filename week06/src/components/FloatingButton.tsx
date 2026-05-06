import { useNavigate } from "react-router-dom";

const FloatingButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/write")} // 원하는 경로로 변경
      className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full text-3xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center z-30"
    >
      +
    </button>
  );
};

export default FloatingButton;
