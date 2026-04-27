import useForm from "../hooks/useForm";
import { validateSignin, type UserSigininInformation } from "../utils/validate";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { login, accessToken } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (accessToken) {
      navigate("/");
    }
  });

  //const { setItem } = useLocalStorage(LOCAL_STORAGE_KEY.accessToken);
  const { values, error, touched, getInputProps } =
    useForm<UserSigininInformation>({
      initailValue: {
        email: "",
        password: "",
      },
      validate: validateSignin,
    });

  const handleSubmit = async () => {
    try {
      await login(values);
    } catch (error) {}
  };

  const isDisabled =
    Object.values(error || {}).some((error: string) => error.length > 0) ||
    Object.values(values).some((value) => value === "");

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="flex flex-col gap-3">
        <input
          {...getInputProps("email")}
          name="email"
          className={`border border-[#ccc] w-[300px] p-[10px] focus:border-[#807bff] rounded-sm ${
            error.email && touched.email
              ? "border-red-500 bg-red-200"
              : "border-gray-300"
          }`}
          type={"email"}
          placeholder={"이메일"}
        />
        {error.email && touched.email && (
          <div className="text-red-500 text-sm">{error.email}</div>
        )}
        <input
          {...getInputProps("password")}
          className={`border border-[#ccc] w-[300px] p-[10px] focus:border-[#807bff] rounded-sm ${
            error.password && touched.password
              ? "border-red-500 bg-red-200"
              : "border-gray-300"
          }`}
          type={"password"}
          placeholder={"비밀번호"}
        />
        {error.password && touched.password && (
          <div className="text-red-500 text-sm">{error.password}</div>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          className="w-full bg-blue-600 text-white py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:bg-gray-400"
        >
          로그인
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
