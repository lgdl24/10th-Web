import { useEffect, useRef } from "react";

interface Options {
  /** false 이면 Observer를 등록하지 않음 — hasNextPage && !isFetchingNextPage 로 제어 */
  enabled?: boolean;
  threshold?: number;
}

/**
 * sentinel 요소가 뷰포트에 진입하면 onIntersect 를 호출하는 훅.
 *
 * [안정성]
 * onIntersect 를 callbackRef 로 감싸서 deps 에서 제외합니다.
 * → enabled / threshold 가 바뀔 때만 Observer 가 재생성되고,
 *   콜백이 바뀌어도 Observer 는 유지됩니다.
 */
export function useIntersectionObserver(
  onIntersect: () => void,
  { enabled = true, threshold = 0.1 }: Options = {},
) {
  const ref = useRef<HTMLDivElement>(null);

  // 콜백을 ref 로 안정화 — Observer deps 에서 제외하기 위함
  const callbackRef = useRef(onIntersect);
  useEffect(() => {
    callbackRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callbackRef.current();
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, threshold]); // onIntersect 제외 → Observer 재생성 최소화

  return ref;
}
