interface WarningModalProps {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

/**
 * 경고 모달 — 비인증 접근, 삭제 확인 등 범용 사용
 * onCancel 을 넘기면 취소 버튼이 함께 표시됩니다.
 * 배경 클릭은 의도적으로 막습니다 (사용자가 반드시 버튼으로 결정하도록).
 */
const WarningModal = ({
  message,
  confirmText = "확인",
  cancelText = "아니오",
  onConfirm,
  onCancel,
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

        {/* 버튼 영역 */}
        <div className={`w-full flex gap-3 ${onCancel ? "" : ""}`}>
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;
