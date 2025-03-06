import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const VMPagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange
}) => {
  return (
    <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Hiển thị {Math.min(totalItems, (currentPage - 1) * pageSize + 1)} - {Math.min(currentPage * pageSize, totalItems)} trên {totalItems} máy ảo
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Page Size Selector */}
        <div className="flex items-center">
          <span className="mr-2 text-sm font-medium">Hiển thị:</span>
          <select 
            value={pageSize} 
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border rounded p-1.5 bg-white shadow-sm"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        
        {/* Pagination Buttons */}
        <div className="flex items-center space-x-1">
          <PaginationButton 
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="Trang đầu"
            icon={<ChevronsLeft className="h-5 w-5" />}
          />
          
          <PaginationButton 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Trang trước"
            icon={<ChevronLeft className="h-5 w-5" />}
          />
          
          <span className="px-4 py-1.5 bg-white border rounded shadow-sm font-medium">
            {currentPage} / {totalPages}
          </span>
          
          <PaginationButton 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Trang sau"
            icon={<ChevronRight className="h-5 w-5" />}
          />
          
          <PaginationButton 
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Trang cuối"
            icon={<ChevronsRight className="h-5 w-5" />}
          />
        </div>
      </div>
    </div>
  );
};

const PaginationButton = ({ onClick, disabled, title, icon }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`p-1.5 rounded ${
      disabled ? 'text-gray-300 cursor-default' : 'text-blue-600 hover:bg-blue-100'
    }`}
    title={title}
  >
    {icon}
  </button>
);

export default VMPagination;
