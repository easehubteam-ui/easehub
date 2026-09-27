import React, { useState } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onRowClick?: (item: T) => void;
  pageSize?: number;
}

export function DataTable<T extends { id?: string | number; [key: string]: any }>({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  title,
  subtitle,
  actions,
  onRowClick,
  pageSize = 10,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    return Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-white rounded-2xl border border-[#E5E1D6] shadow-sm overflow-hidden">
      {/* Header bar */}
      {(title || searchPlaceholder || actions) && (
        <div className="p-4 sm:p-6 border-b border-[#E5E1D6] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            {title && <h3 className="text-lg font-bold text-[#171A18]">{title}</h3>}
            {subtitle && <p className="text-xs text-[#6B6B63] mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3">
            {searchPlaceholder && (
              <div className="relative flex-1 sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#E5E1D6] text-xs text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#225944]"
                />
              </div>
            )}
            {actions}
          </div>
        </div>
      )}

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#EDEEEB] border-b border-[#E5E1D6] text-[11px] font-bold text-[#6B6B63] uppercase tracking-wider">
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-3.5">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E1D6] text-xs text-[#171A18]">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-[#6B6B63]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[36px] text-slate-300">search_off</span>
                    <p className="font-semibold">No records found matching your search</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-amber-50/40 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-[#E5E1D6] flex items-center justify-between text-xs text-[#6B6B63] bg-slate-50/50">
        <div>
          Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-[#E5E1D6] bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>
          <span className="font-bold text-[#171A18] px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-[#E5E1D6] bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
