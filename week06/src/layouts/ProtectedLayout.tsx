import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import WarningModal from "../components/WarningModal";

const ProtectedLayout = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 비인증 상태: 모달을 띄우고, 확인 클릭 시 현재 경로를 state에 담아 /login으로 이동
  if (!accessToken) {
    return (
      <WarningModal
        message={"이 페이지를 보려면 로그인이 필요합니다."}
        confirmText="로그인하러 가기"
        onConfirm={() =>
          navigate("/login", { state: { from: location.pathname } })
        }
      />
    );
  }

  return <Outlet />;
};

export default ProtectedLayout;
