import z from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSignup } from "../apis/auth";
import { useNavigate } from "react-router-dom";

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

const inputBase =
  "border w-[300px] p-[10px] rounded-sm bg-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-[#807bff]";

const SignupPage = () => {
  const navigate = useNavigate();

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
    const { ...rest } = data;

    try {
      await postSignup(rest);
      navigate("/signup/complete");
    } catch (error) {
      console.log("회원가입 요청 오류", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <input
          {...register("email")}
          name="email"
          className={`${inputBase} ${
            errors.email ? "border-red-500 bg-red-950" : "border-zinc-600"
          }`}
          type="email"
          placeholder="이메일"
        />
        {errors.email && (
          <div className="text-red-400 text-sm">{errors.email.message}</div>
        )}

        <input
          {...register("password")}
          className={`${inputBase} ${
            errors.password ? "border-red-500 bg-red-950" : "border-zinc-600"
          }`}
          type="password"
          placeholder="비밀번호"
        />
        {errors.password && (
          <div className="text-red-400 text-sm">{errors.password.message}</div>
        )}

        <input
          {...register("passwordCheck")}
          className={`${inputBase} ${
            errors.passwordCheck
              ? "border-red-500 bg-red-950"
              : "border-zinc-600"
          }`}
          type="password"
          placeholder="비밀번호 확인"
        />
        {errors.passwordCheck && (
          <div className="text-red-400 text-sm">
            {errors.passwordCheck.message}
          </div>
        )}

        <input
          {...register("name")}
          className={`${inputBase} ${
            errors.name ? "border-red-500 bg-red-950" : "border-zinc-600"
          }`}
          type="text"
          placeholder="이름"
        />
        {errors.name && (
          <div className="text-red-400 text-sm">{errors.name.message}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded-md text-lg font-medium hover:bg-blue-500 transition-colors cursor-pointer disabled:bg-zinc-700 disabled:text-zinc-500"
        >
          회원가입
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
