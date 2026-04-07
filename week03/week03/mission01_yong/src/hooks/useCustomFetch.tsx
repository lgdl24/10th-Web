import { useEffect, useState } from "react";
import axios, { type AxiosRequestConfig } from "axios";

type UseCustomFetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: boolean;
};

export function useCustomFetch<T>(
  url: string,
  config?: AxiosRequestConfig,
): UseCustomFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return;

    const fetchData = async (): Promise<void> => {
      setLoading(true);
      setError(false);

      try {
        const response = await axios.get<T>(url, config);
        setData(response.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, JSON.stringify(config)]);

  return { data, loading, error };
}
