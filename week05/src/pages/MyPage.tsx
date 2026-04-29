import { useEffect, useState } from "react";
import { getMyInfo } from "../apis/auth";
import type { ResponseMyInfoDto } from "../types/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">
        {/* 프로필 이미지 */}
        <div className="flex justify-center mb-4">
          <img
            src={data?.data?.avatar || "/images/gora.jpeg"}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border"
          />
        </div>
        <h1 className="text-xl font-semibold">
          {data?.data?.name || "이름 없음"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">{data?.data?.email}</p>
        <button
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-500"
          disabled={true}
        >
          정보 수정
        </button>
      </div>
    </div>
  );
};

export default MyPage;
