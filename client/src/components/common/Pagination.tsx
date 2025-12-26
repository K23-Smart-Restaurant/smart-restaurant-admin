import React from "react";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [6, 9, 12, 18],
}) => {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  const goToPage = (nextPage: number) => {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    onPageChange(safePage);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold text-charcoal">{start === 0 ? 0 : start}</span>
        {" "}
        - <span className="font-semibold text-charcoal">{end}</span> of {" "}
        <span className="font-semibold text-charcoal">{total}</span>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {onPageSizeChange && (
          <label className="flex items-center text-sm text-gray-700 gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-gray-200 text-black px-3 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:outline-none"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="px-3 py-2 bg-gray-200 text-charcoal border border-antiflash rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Prev
          </button>
          <div className="text-sm text-gray-700">
            Page <span className="font-semibold text-charcoal">{page}</span> of {" "}
            <span className="font-semibold text-charcoal">{totalPages}</span>
          </div>
          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-2 bg-gray-200 text-charcoal border border-antiflash rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
