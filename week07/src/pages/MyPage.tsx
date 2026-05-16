import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyInfo, patchMyInfo } from "../apis/auth";
import type { RequestPatchMyInfoDto } from "../types/auth";

/**
 * canvas로 이미지를 리사이즈 + 압축한 뒤 base64로 변환합니다.
 * 원본 파일을 그대로 base64로 바꾸면 수 MB가 되어 서버 body 제한(1MB)을 초과합니다.
 * 최대 400×400, JPEG 품질 0.75로 압축하면 대부분 100KB 이하가 됩니다.
 */
const compressImage = (file: File, maxSize = 400, quality = 0.75): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      // 비율 유지하며 maxSize 이내로 축소
      let { width, height } = img;
      if (width > height) {
        if (width > maxSize) { height = Math.round((height * maxSize) / width); width = maxSize; }
      } else {
        if (height > maxSize) { width = Math.round((width * maxSize) / height); height = maxSize; }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);

      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = reject;
    img.src = objectUrl;
  });
};

interface EditForm {
  name: string;
  bio: string;
}

const MyPage = () => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState<EditForm>({ name: "", bio: "" });

  // 선택한 파일 + 미리보기 URL (objectURL)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // ── 내 정보 조회
  const { data } = useQuery({
    queryKey: ["myInfo"],
    queryFn: getMyInfo,
  });

  const myInfo = data?.data;

  // ── 수정 모달 열기 — 현재 값으로 폼 초기화
  const handleOpenEdit = () => {
    setForm({
      name: myInfo?.name ?? "",
      bio: myInfo?.bio ?? "",
    });
    setImageFile(null);
    setPreview(null);
    setIsEditOpen(true);
  };

  // ── 파일 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file)); // 즉시 미리보기
  };

  // ── 내 정보 수정 useMutation
  const patchMutation = useMutation({
    mutationFn: async (body: RequestPatchMyInfoDto) => patchMyInfo(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myInfo"] });
      setIsEditOpen(false);
    },
    onError: (error) => {
      console.error("프로필 수정 실패:", error);
      alert("프로필 수정에 실패했습니다. 다시 시도해주세요.");
    },
  });

  // ── 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    // 파일이 선택됐으면 리사이즈+압축 후 base64 변환, 아니면 undefined (서버에 변경 없음)
    const avatarBase64 = imageFile ? await compressImage(imageFile) : undefined;

    const body: RequestPatchMyInfoDto = {
      name: form.name.trim(),
      ...(form.bio.trim() && { bio: form.bio.trim() }),
      ...(avatarBase64 && { avatar: avatarBase64 }),
    };

    patchMutation.mutate(body);
  };

  // 현재 보여줄 아바타: 새로 선택한 파일 미리보기 > 기존 서버 값 > 기본 이미지
  // ?? 대신 || 사용 — 빈 문자열("")도 기본 이미지로 fallback
  const currentAvatar = preview || myInfo?.avatar || "/images/gora.jpeg";

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      {/* ── 프로필 카드 */}
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-md w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <img
            src={myInfo?.avatar || "/images/gora.jpeg"}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border border-zinc-700"
          />
        </div>
        <h1 className="text-xl font-semibold text-white">
          {myInfo?.name || "이름 없음"}
        </h1>
        <p className="text-zinc-400 text-sm mt-1">{myInfo?.email}</p>
        {myInfo?.bio && (
          <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
            {myInfo.bio}
          </p>
        )}
        <button
          onClick={handleOpenEdit}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-500 transition"
        >
          정보 수정
        </button>
      </div>

      {/* ── 수정 모달 */}
      {isEditOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditOpen(false);
          }}
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-white mb-5">
              프로필 수정
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 프로필 사진 — 클릭해서 파일 선택 */}
              <div className="flex flex-col items-center gap-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
                >
                  <img
                    src={currentAvatar}
                    alt="미리보기"
                    className="w-full h-full object-cover"
                  />
                  {/* 호버 오버레이 */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <span className="text-white text-xs font-medium">
                      변경
                    </span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500">
                  사진을 클릭하면 변경할 수 있어요
                </p>
                {/* 숨겨진 파일 input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* 이름 — 필수 */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  이름 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="이름을 입력하세요"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Bio — 옵션 */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Bio{" "}
                  <span className="text-zinc-500 font-normal">(선택)</span>
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="자기소개를 입력하세요"
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition resize-none"
                />
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={patchMutation.isPending}
                  className="flex-1 border border-zinc-700 text-zinc-300 py-2.5 rounded-lg font-medium hover:bg-zinc-800 transition disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!form.name.trim() || patchMutation.isPending}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-500 transition disabled:bg-zinc-700 disabled:text-zinc-500"
                >
                  {patchMutation.isPending ? "저장 중..." : "저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;
