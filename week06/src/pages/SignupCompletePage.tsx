import { useNavigate } from "react-router-dom";

export default function SignupCompletePage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-md w-full max-w-sm text-center">
        <div className="text-4xl mb-4">🎉</div>

        <h1 className="text-xl font-semibold text-white mb-2">가입을 축하드립니다!</h1>

        <p className="text-zinc-400 text-sm mb-6">
          이제 다양한 서비스를 이용해보세요.
        </p>

        <button
          onClick={() => navigate("/")}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-500 transition"
        >
          홈으로 이동
        </button>
        <button
          onClick={() => navigate("/my")}
          className="mt-3 text-sm text-zinc-400 hover:text-white transition cursor-pointer"
        >
          마이페이지
        </button>
      </div>
    </div>
  );
}
