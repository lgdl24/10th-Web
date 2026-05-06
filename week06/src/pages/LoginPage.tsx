import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useForm from "../hooks/useForm";
import { validateSignin, type UserSigininInformation } from "../utils/validate";
import { useAuth } from "../context/AuthContext";

interface LocationState {
  from?: string; // ProtectedLayout이 저장한 원래 경로
}

const inputBase =
  "border w-full p-[10px] rounded-sm bg-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-[#807bff]";

const LoginPage = () => {
  const { login, accessToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // accessToken이 생기면 (이미 로그인 상태 or 방금 로그인 성공)
  // → from 경로가 있으면 복원, 없으면 홈으로 이동
  useEffect(() => {
    if (accessToken) {
      const state = location.state as LocationState;
      navigate(state?.from ?? "/", { replace: true });
    }
  }, [accessToken, navigate, location.state]);

  const { values, error, touched, getInputProps } =
    useForm<UserSigininInformation>({
      initailValue: { email: "", password: "" },
      validate: validateSignin,
    });

  const handleSubmit = async () => {
    const success = await login(values);

    // 성공 시 navigate는 useEffect(accessToken 변화 감지)가 처리함
    // — 여기서 직접 navigate하면 useEffect와 레이스 컨디션이 발생해 "/" 로 덮어씌워짐
    if (!success) {
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      import.meta.env.VITE_SERVER_API_URL + "v1/auth/google/login";
  };

  const isDisabled =
    Object.values(error || {}).some((e: string) => e.length > 0) ||
    Object.values(values).some((v) => v === "");

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="flex flex-col gap-3 w-[300px]">
        <input
          {...getInputProps("email")}
          name="email"
          type="email"
          placeholder="이메일"
          className={`${inputBase} ${
            error.email && touched.email
              ? "border-red-500 bg-red-950"
              : "border-zinc-600"
          }`}
        />
        {error.email && touched.email && (
          <p className="text-red-400 text-sm">{error.email}</p>
        )}

        <input
          {...getInputProps("password")}
          type="password"
          placeholder="비밀번호"
          className={`${inputBase} ${
            error.password && touched.password
              ? "border-red-500 bg-red-950"
              : "border-zinc-600"
          }`}
        />
        {error.password && touched.password && (
          <p className="text-red-400 text-sm">{error.password}</p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          className="w-full bg-blue-600 text-white py-3 rounded-md text-lg font-medium hover:bg-blue-500 transition-colors cursor-pointer disabled:bg-zinc-700 disabled:text-zinc-500"
        >
          로그인
        </button>

        {/* Google 버튼은 흰 배경 유지 (브랜드 가이드라인) */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 border border-zinc-600 py-3 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition"
        >
          <img src="/images/googleRoundLogo2x.png" className="w-5 h-5" />
          <span>Google로 시작하기</span>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
