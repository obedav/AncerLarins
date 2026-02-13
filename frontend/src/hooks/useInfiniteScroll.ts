import { useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll(
  onLoadMore: () => void,
  options: { hasMore: boolean; loading: boolean; threshold?: number }
) {
  const { hasMore, loading, threshold = 200 } = options;
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loading) {
            onLoadMore();
          }
        },
        { rootMargin: `${threshold}px` }
      );

      if (node) observerRef.current.observe(node);
    },
    [onLoadMore, hasMore, loading, threshold]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  return sentinelRef;
}
