interface WarningModalProps {
  message: string;
  confirmText?: string;
  onConfirm: () => void;
}

/**
 * 경고 모달 — 비인증 접근, 삭제 확인 등 범용 사용
 * 배경 클릭은 의도적으로 막습니다 (사용자가 반드시 버튼으로 결정하도록).
 */
const WarningModal = ({
  message,
  confirmText = "확인",
  onConfirm,
}: WarningModalProps) => {
  return (
    /* 딤 배경 */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* 모달 패널 */}
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-8 flex flex-col items-center gap-6">
        {/* 아이콘 */}
        <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center text-3xl">
          ⚠️
        </div>

        {/* 메시지 */}
        <p className="text-gray-700 text-center text-base leading-relaxed whitespace-pre-line">
          {message}
        </p>

        {/* 확인 버튼 */}
        <button
          onClick={onConfirm}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
};

export default WarningModal;
