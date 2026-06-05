import React from "react";

export function Pagination({ currentPage, totalPages, handlePageChange }) {
  if (totalPages < 2) return null;
  return (
    <nav className="inline-flex items-center space-x-1">
      <button
        className="px-2 py-1 rounded text-xs bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-60 cursor-pointer"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Précédent"
      >
        &lt;
      </button>
      {Array.from({ length: totalPages }).map((_, idx) => (
        <button
          key={idx + 1}
          className={` cursor-pointer px-2 py-1 rounded text-xs border ${currentPage === idx + 1
            ? 'bg-slate-700 text-white border-slate-700'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          onClick={() => handlePageChange(idx + 1)}
        >
          {idx + 1}
        </button>
      ))}
      <button
        className="px-2 py-1 rounded text-xs bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-60 cursor-pointer"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Suivant"
      >
        &gt;
      </button>
    </nav>
  );
}
