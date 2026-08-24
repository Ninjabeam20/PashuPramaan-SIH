export const LAB_PAGE_SIZE = 15;

export type PageSlice<T> = {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
};

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number = LAB_PAGE_SIZE,
): PageSlice<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  const sliced = items.slice(start, start + pageSize);
  return {
    items: sliced,
    page: current,
    totalPages,
    total,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
  };
}
