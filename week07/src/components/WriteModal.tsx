import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // ✅ React Query 임포트 추가
import { postLp } from "../apis/lp";

type WriteModalProps = {
  onClose: () => void;
};

const WriteModal = ({ onClose }: WriteModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | undefined>();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // QueryClient 인스턴스 가져오기
  const queryClient = useQueryClient();

  const handleTag = () => {
    if (!tagInput.trim()) return;
    setTags((prev) => [...prev, tagInput.trim()]);
    setTagInput("");
  };

  const handleClickImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  const handleDeleteTag = (targetTag: string) => {
    setTags((prev) => prev.filter((tag) => tag !== targetTag));
  };

  // useMutation 
  const { mutate, isPending } = useMutation({
    // 주의: preview는 'blob:http://...' 형태의 임시 URL입니다.
    // 백엔드에 실제 파일을 보내야 한다면 preview 대신 imageFile을 보내도록 api를 수정해야 할 수 있습니다.
    mutationFn: () => postLp(title, content, tags, preview ?? undefined),

    onSuccess: () => {
      //1. 성공 시 메인 페이지의 LP 목록 새로고침 (queryKey 'lps'는 실제 사용하는 키로 맞춰주세요)
      queryClient.invalidateQueries({ queryKey: ["lps"] });

      //2. 모달 닫기
      onClose();
    },
    onError: (error: any) => {
      console.log(error.response?.data);
      alert("LP 등록 중 오류가 발생했습니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 직접 API를 호출하지 않고 mutate 함수 실행
    mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-[90%] max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* 이미지 업로드 영역 */}
          <div
            onClick={handleClickImage}
            className="w-full aspect-square bg-zinc-800 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center text-zinc-400 hover:bg-zinc-700 transition"
          >
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>이미지 선택</span>
            )}
          </div>

          {/* 숨겨진 file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {/* 제목 */}
          <input
            type="text"
            placeholder="LP name"
            className="p-3 rounded-lg bg-zinc-800 text-white outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* 내용 */}
          <input
            type="text"
            placeholder="LP Content"
            className="p-3 rounded-lg bg-zinc-800 text-white outline-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* 태그 */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="LP Tag"
              className="flex-1 p-3 rounded-lg bg-zinc-800 text-white outline-none"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleTag();
                }
              }}
            />
            <button
              type="button"
              onClick={handleTag}
              className="px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition"
            >
              Add
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {tags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1 px-2 py-1 bg-zinc-700 rounded text-sm text-white"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteTag(tag)}
                  className="text-zinc-300 hover:text-red-400 transition"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending} // ✅ 로딩 중 비활성화
              className="px-4 py-2 rounded-lg bg-zinc-700 text-white font-medium hover:bg-zinc-500 transition disabled:opacity-50"
            >
              취소
            </button>

            <button
              type="submit"
              disabled={isPending} // ✅ 로딩 중 비활성화
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition disabled:opacity-50"
            >
              {isPending ? "저장 중..." : "저장"} {/* ✅ 로딩 텍스트 피드백 */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriteModal;
