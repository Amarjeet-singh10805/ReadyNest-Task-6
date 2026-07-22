import { useState, useCallback, useRef } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebouncedValue(value), delay);
  }, [value, delay])();

  return debouncedValue;
}

export function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const reset = () => setPage(1);
  return { page, setPage, limit, reset };
}
