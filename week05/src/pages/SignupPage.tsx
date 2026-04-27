import z from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSignup } from "../apis/auth";
import { axiosInstance } from "../apis/axios";

const schema = z
  .object({
    email: z.string().email({ message: "이메일 형식이 올바르지 않습니다." }),
    password: z
      .string()
      .min(8, { message: "비밀번호는 8자 이상이어야 합니다." })
      .max(20, { message: "비밀번호는 20자 이하여야 합니다." }),
    passwordCheck: z
      .string()
      .min(8, { message: "비밀번호는 8자 이상이어야 합니다." })
      .max(20, { message: "비밀번호는 20자 이하여야 합니다." }),
    name: z.string().min(1, { message: "이름은 1자 이상이어야 합니다." }),
  })
  .refine((data) => data.password === data.passwordCheck, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordCheck"],
  });

type FormFilds = z.infer<typeof schema>;

const SignupPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<FormFilds> = async (data) => {
    console.log("env:", import.meta.env.VITE_SERVER_API_URL);
    console.log("baseURL:", axiosInstance.defaults.baseURL);
    console.log(data);
    const { passwordCheck, ...rest } = data;
    const response = await postSignup(rest);

    console.log(response);
  };
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="flex flex-col gap-3">
        <input
          {...register("email")}
          name="email"
          className={`border border-[#ccc] w-[300px] p-[10px] focus:border-[#807bff] rounded-sm ${
            errors.email ? "border-red-500 bg-red-200" : "border-gray-300"
          }`}
          type={"email"}
          placeholder={"이메일"}
        />
        {errors.email && (
          <div className="text-red-500 text-sm">{errors.email.message}</div>
        )}
        <input
          {...register("password")}
          className={`border border-[#ccc] w-[300px] p-[10px] focus:border-[#807bff] rounded-sm ${
            errors.password ? "border-red-500 bg-red-200" : "border-gray-300"
          }`}
          type={"password"}
          placeholder={"비밀번호"}
        />
        {errors.password && (
          <div className="text-red-500 text-sm">{errors.password.message}</div>
        )}

        <input
          {...register("passwordCheck")}
          className={`border border-[#ccc] w-[300px] p-[10px] focus:border-[#807bff] rounded-sm ${
            errors.passwordCheck
              ? "border-red-500 bg-red-200"
              : "border-gray-300"
          }`}
          type={"password"}
          placeholder={"비밀번호 확인"}
        />
        {errors.passwordCheck && (
          <div className="text-red-500 text-sm">
            {errors.passwordCheck.message}
          </div>
        )}

        <input
          {...register("name")}
          className={`border border-[#ccc] w-[300px] p-[10px] focus:border-[#807bff] rounded-sm ${
            errors.name ? "border-red-500 bg-red-200" : "border-gray-300"
          }`}
          type={"text"}
          placeholder={"이름"}
        />
        {errors.name && (
          <div className="text-red-500 text-sm">{errors.name.message}</div>
        )}
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:bg-gray-400"
        >
          회원가입
        </button>
      </div>
    </div>
  );
};

export default SignupPage;
