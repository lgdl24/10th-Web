export type UserSigninInformation = {
  email: string;
  password: string;
};

const validate = (value: UserSigninInformation) => {
  const error = {
    email: "",
    password: "",
  };

  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value.email)) {
    error.email = "이메일 형식이 잘못되었습니다.";
  }
  if (value.password.length < 8 || value.password.length > 20) {
    error.password = "비밀번호는 8자 이상 20자 이하입니다.";
  }

  return error;
};

function validateSignin(value: UserSigninInformation) {
  return validate(value);
}

export { validateSignin };
