import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import WriteModal from "./WriteModal";
import WarningModal from "./WarningModal";

import { AuthContext } from "../context/AuthContext";

const FloatingButton = () => {
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);

  const { accessToken } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleOpen = () => {
    // 비로그인 상태
    if (!accessToken) {
      setIsWarningOpen(true);
      return;
    }

    // 로그인 상태
    setIsWriteOpen(true);
  };

  const handleMoveLogin = () => {
    setIsWarningOpen(false);
    navigate("/login");
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={handleOpen}
        className="fixed bottom-28 right-6 w-14 h-14 bg-blue-600 text-white rounded-full text-3xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center z-30"
      >
        +
      </button>

      {/* 작성 모달 */}
      {isWriteOpen && <WriteModal onClose={() => setIsWriteOpen(false)} />}

      {/* 경고 모달 */}
      {isWarningOpen && (
        <WarningModal
          message={"로그인이 필요한 기능입니다.\n로그인 페이지로 이동할까요?"}
          confirmText="로그인"
          onConfirm={handleMoveLogin}
        />
      )}
    </>
  );
};

export default FloatingButton;
