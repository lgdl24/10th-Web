import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchLp, postLp } from "../apis/lp";

// 파일을 Base64 텍스트로 변환해주는 헬퍼 함수
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

interface InitialValues {
  title: string;
  content: string;
  tags: string[];
  thumbnail?: string;
}

type WriteModalProps = {
  onClose: () => void;
  /** 수정 모드일 때 LP id */
  lpId?: number;
  /** 수정 모드일 때 기존 값 */
  initialValues?: InitialValues;
};

const WriteModal = ({ onClose, lpId, initialValues }: WriteModalProps) => {
  const isEditMode = lpId !== undefined && initialValues !== undefined;

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  // 수정 모드: 기존 썸네일을 초기 미리보기로 사용
  const [preview, setPreview] = useState<string | null>(
    initialValues?.thumbnail ?? null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  const handleTag = () => {
    if (!tagInput.trim()) return;
    setTags((prev) => [...prev, tagInput.trim()]);
    setTagInput("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDeleteTag = (targetTag: string) => {
    setTags((prev) => prev.filter((tag) => tag !== targetTag));
  };

  // ── 등록 / 수정 useMutation
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      // 새 파일이 선택됐으면 base64 변환, 아니면 기존 thumbnail 그대로
      let thumbnail: string | undefined = initialValues?.thumbnail;
      if (imageFile) {
        thumbnail = await fileToBase64(imageFile);
      }

      if (isEditMode) {
        return patchLp(lpId, title, content, tags, thumbnail);
      } else {
        return postLp(title, content, tags, thumbnail);
      }
    },
    onSuccess: () => {
      if (isEditMode) {
        // 수정: 해당 LP 상세 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ["lp", lpId] });
      } else {
        // 등록: 목록 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ["lps"] });
      }
      onClose();
    },
    onError: (error: any) => {
      console.error("서버 에러 상세:", error.response?.data);
      alert(isEditMode ? "LP 수정 중 오류가 발생했습니다." : "LP 등록 중 오류가 발생했습니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 등록 모드에서만 이미지 필수, 수정 모드에서는 기존 이미지 유지 가능
    if (!isEditMode && !imageFile) return alert("이미지를 선택해주세요.");
    if (!title.trim()) return alert("제목을 입력해주세요.");
    if (!content.trim()) return alert("내용을 입력해주세요.");
    mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-[90%] max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6">
        <h2 className="text-white font-semibold text-lg mb-4">
          {isEditMode ? "LP 수정" : "LP 등록"}
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* 이미지 업로드 영역 */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square bg-zinc-800 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center text-zinc-400 hover:bg-zinc-700 transition relative group"
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <span className="text-white text-sm">이미지 변경</span>
                </div>
              </>
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
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-zinc-700 text-white font-medium hover:bg-zinc-500 transition disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition disabled:opacity-50"
            >
              {isPending ? "저장 중..." : isEditMode ? "수정" : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriteModal;
