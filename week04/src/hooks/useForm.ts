import { useEffect, useState } from "react";

interface UseFormProps<T> {
  initialValue: T; // {email:"", password:""}
  //값이 올바른지 검증하는 함수
  validate: (values: T) => Record<keyof T, string>;
}

function useForm<T>({ initialValue, validate }: UseFormProps<T>) {
  const [values, setValues] = useState(initialValue);
  const [error, setError] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (name: keyof T, text: string) => {
    setValues({
      ...values,
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
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(name, e.target.value);
    };
    const onBlur = () => handleBlur(name);

    return {
      value,
      onChange,
      onBlur,
    };
  };

  useEffect(() => {
    const newErrors = validate(values);
    setError(newErrors);
  }, [values, validate]);

  return { values, error, touched, getInputProps };
}

export default useForm;
