export type UserSigininInformation = {
  email: string;
  password: string;
};

function validateUser(values: UserSigininInformation) {
  const errors = {
    email: "",
    password: "",
  };

  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = "이메일 형식이 올바르지 않습니다.";
  }
  if (values.password.length < 8 || values.password.length > 20) {
    errors.password = "비밀번호는 8자 이상 20자 이하여야 합니다.";
  }
  return errors;
}

function validateSignin(values: UserSigininInformation) {
  return validateUser(values);
}

export { validateSignin };
