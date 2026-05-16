import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IoSearchOutline,
  IoPersonOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { deleteUser } from "../apis/auth";
import { useAuth } from "../context/AuthContext";
import WarningModal from "./WarningModal";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const { clearAuth } = useAuth();
  const navigate = useNavigate();

  // ── 회원 탈퇴 useMutation
  const withdrawMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      clearAuth();             // 로컬 토큰 · 상태 초기화
      setShowWithdrawModal(false);
      onClose();
      navigate("/login", { replace: true });
    },
    onError: () => {
      alert("탈퇴 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    },
  });

  return (
    <>
      {/* 딤처리 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-10" onClick={onClose} />
      )}

      {/* 사이드바 본체 */}
      <aside
        className={`
          fixed top-0 left-0 h-full
          w-64 bg-black text-white z-20
          flex flex-col gap-6 p-6
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* 닫기 버튼 */}
        <button onClick={onClose} className="self-end">
          <IoCloseOutline size={28} />
        </button>

        <nav className="flex flex-col gap-6">
          <Link
            to="/search"
            onClick={onClose}
            className="flex items-center gap-3 text-white"
          >
            <IoSearchOutline size={24} />
            <span>찾기</span>
          </Link>

          <Link
            to="/my"
            onClick={onClose}
            className="flex items-center gap-3 text-white"
          >
            <IoPersonOutline size={24} />
            <span>마이페이지</span>
          </Link>
        </nav>

        {/* 탈퇴하기 — 사이드바 하단 */}
        <div className="mt-auto">
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={withdrawMutation.isPending}
            className="w-full text-sm text-zinc-500 hover:text-red-400 transition disabled:opacity-50"
          >
            탈퇴하기
          </button>
        </div>
      </aside>

      {/* 탈퇴 확인 모달 */}
      {showWithdrawModal && (
        <WarningModal
          message={"정말로 탈퇴하시겠습니까?\n탈퇴 후에는 되돌릴 수 없습니다."}
          confirmText="예, 탈퇴할게요"
          cancelText="아니오"
          onConfirm={() => withdrawMutation.mutate()}
          onCancel={() => setShowWithdrawModal(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
