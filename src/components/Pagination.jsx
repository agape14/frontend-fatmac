const Pagination = ({ currentPage, lastPage, onPageChange }) => {
  if (lastPage <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(lastPage, startPage + maxVisible - 1);
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Botón Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-purple-pastel hover:text-white border border-gray-300'
        }`}
      >
        Anterior
      </button>

      {/* Números de página */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-purple-pastel hover:text-white border border-gray-300"
          >
            1
          </button>
          {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            page === currentPage
              ? 'bg-purple-pastel text-white'
              : 'bg-white text-gray-700 hover:bg-purple-pastel hover:text-white border border-gray-300'
          }`}
        >
          {page}
        </button>
      ))}

      {endPage < lastPage && (
        <>
          {endPage < lastPage - 1 && <span className="px-2 text-gray-400">...</span>}
          <button
            onClick={() => onPageChange(lastPage)}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-purple-pastel hover:text-white border border-gray-300"
          >
            {lastPage}
          </button>
        </>
      )}

      {/* Botón Siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          currentPage === lastPage
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-purple-pastel hover:text-white border border-gray-300'
        }`}
      >
        Siguiente
      </button>
    </div>
  );
};

export default Pagination;

