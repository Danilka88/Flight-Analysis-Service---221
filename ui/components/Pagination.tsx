import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  const maxPagesToShow = 5;
  
  if (totalPages <= maxPagesToShow + 2) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    pageNumbers.push(1);
    if (currentPage > maxPagesToShow - 1) {
      pageNumbers.push('...');
    }

    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);

    if (currentPage <= maxPagesToShow - 2) {
        startPage = 2;
        endPage = maxPagesToShow-1;
    }
    
    if (currentPage > totalPages - (maxPagesToShow-1)) {
        startPage = totalPages - (maxPagesToShow-2);
        endPage = totalPages-1
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (currentPage < totalPages - (maxPagesToShow-2)) {
      pageNumbers.push('...');
    }
    pageNumbers.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-between mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm font-medium text-gray-300 bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
      >
        Назад
      </button>
      <div className="flex items-center space-x-1">
        {pageNumbers.map((number, index) =>
          typeof number === 'number' ? (
            <button
              key={index}
              onClick={() => onPageChange(number)}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                currentPage === number
                  ? 'bg-sky-600 text-white'
                  : 'text-gray-300 bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {number}
            </button>
          ) : (
            <span key={index} className="px-3 py-1 text-sm text-gray-400">
              {number}
            </span>
          )
        )}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm font-medium text-gray-300 bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
      >
        Вперед
      </button>
    </nav>
  );
};

export default Pagination;
