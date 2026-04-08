import { useNavigate } from "react-router-dom";
import useForm from "../hooks/useForm";
import { validateSignin, type UserSigninInformation } from "../utils/validate";

export default function LoginPage() {
  // 그러니까 email, 비밀번호 validate 할거임, 그리고 됐을때 로그인버튼 활성화
  const { values, error, touched, getInputProps } =
    useForm<UserSigninInformation>({
      initialValue: {
        email: "",
        password: "",
      },
      validate: validateSignin,
    });

  const handleSubmit = () => {
    console.log(values);
  };

  const isDisabled =
    Object.values(error || {}).some((error: string) => error.length > 0) ||
    Object.values(values).some((value) => value === "");

  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-dvh">
      <div className="flex flex-col gap-4 border border-gray-300 rounded-xl p-10 w-96">
        <div className="relative flex items-center justify-center">
          <button
            className="absolute left-0 font-bold text-2xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => navigate(-1)}
          >
            {"<"}
          </button>
          <h1 className="font-bold text-4xl text-gray-500">Login</h1>
        </div>
        <input
          {...getInputProps("email")}
          name="email"
          className={`border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error.email && touched.email
              ? "border-red-500 bg-red-200"
              : "border-gray-300"
          }`}
          type="email"
          placeholder="이메일"
        />
        {error.email && touched.email && (
          <div className="text-red-500 text-sm">{error.email}</div>
        )}
        <input
          {...getInputProps("password")}
          className={`border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error.password && touched.password
              ? "border-red-500 bg-red-200"
              : "border-gray-300"
          }`}
          type="password"
          placeholder="비밀번호"
        />
        {error.password && touched.password && (
          <div className="text-red-500 text-sm">{error.password}</div>
        )}
        <button
          type="button"
          disabled={isDisabled}
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          로그인
        </button>
      </div>
    </div>
  );
}
