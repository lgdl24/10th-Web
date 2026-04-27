import { useEffect, useState, type ChangeEvent } from "react";

interface UseFormProps<T> {
  initailValue: T; // {email:"", password:""}
  //값이 올바른지 검증하는 함수
  validate: (values: T) => Record<keyof T, string>;
}

function useForm<T>({ initailValue, validate }: UseFormProps<T>) {
  const [values, setValues] = useState(initailValue);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string>>({});

  const handleChange = (name: keyof T, text: string) => {
    setValues({
      ...values, //불변성 유지
      [name]: text,
    });
  };

  const handleBlur = (name: keyof T) => {
    setTouched({
      ...touched,
      [name]: true,
    });
  };

  const getInputProps = (name: keyof T) => {
    const value = values[name];
    const onChange = (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      handleChange(name, e.target.value);
    };

    const onBlur = () => handleBlur(name);

    return {
      value,
      onChange,
      onBlur,
    };
  };

  // values가 변경될 때 마다 에러 검증 로직 실행
  useEffect(() => {
    const newErrors = validate(values);
    setError(newErrors);
  }, [validate, values]);

  return { values, error, touched, getInputProps };
}

export default useForm;
