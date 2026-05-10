import { useEffect, useState } from "react";
import { getMyInfo } from "../apis/auth";
import type { ResponseMyInfoDto } from "../types/auth";

const MyPage = () => {
  const [data, setData] = useState<ResponseMyInfoDto | null>(null);
  useEffect(() => {
    const getData = async () => {
      const response = await getMyInfo();
      console.log(response);
      setData(response);
    };

    getData();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-md w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <img
            src={data?.data?.avatar || "/images/gora.jpeg"}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border border-zinc-700"
          />
        </div>
        <h1 className="text-xl font-semibold text-white">
          {data?.data?.name || "이름 없음"}
        </h1>
        <p className="text-zinc-400 text-sm mt-1">{data?.data?.email}</p>
        <button
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-500 transition disabled:bg-zinc-700 disabled:text-zinc-500"
          disabled={true}
        >
          정보 수정
        </button>
      </div>
    </div>
  );
};

export default MyPage;
