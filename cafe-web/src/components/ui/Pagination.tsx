import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight, faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPrevNext?: boolean
  maxVisible?: number
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisible = 5
}: PaginationProps) => {
  const [inputPage, setInputPage] = useState('')
  const [isEllipsisHovered, setIsEllipsisHovered] = useState<Map<number, boolean>>(new Map());

  function addItem(key: number, value: boolean) {
    setIsEllipsisHovered(prev => {
      const newMap = new Map(prev);
      newMap.set(key, value);
      return newMap;
    });
  }

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = []

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const halfVisible = Math.floor(maxVisible / 2)
      let start = Math.max(1, currentPage - halfVisible)
      let end = Math.min(totalPages, currentPage + halfVisible)

      if (end - start + 1 < maxVisible) {
        if (start === 1) {
          end = start + maxVisible - 1
        } else if (end === totalPages) {
          start = end - maxVisible + 1
        }
      }

      if (start > 1) {
        pages.push(1)
        if (start > 2) {
          pages.push('ellipsis')
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('ellipsis')
        }
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const page = parseInt(inputPage)
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
    setInputPage('')
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-center gap-1 p-4">
      {showFirstLast && currentPage > 1 && (
        <button
          onClick={() => onPageChange(1)}
          className="rounded-lg w-8 h-8 bg-green-500 text-white hover:bg-green-600 hover:scale-105 transition-all duration-300"
          title="İlk sayfa"
        >
          <FontAwesomeIcon icon={faAngleDoubleLeft} />
        </button>
      )}

      {showPrevNext && currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-lg w-8 h-8 bg-green-500 text-white hover:bg-green-600 hover:scale-105 transition-all duration-300"
          title="Önceki sayfa"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
      )}

      {visiblePages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <div key={`ellipsis-${index}`} className="pagination-ellipsis">
              <span onMouseEnter={() => addItem(index, true)}>...</span>
              <div className={`${isEllipsisHovered.get(index) ? "block" : ""} ellipsis-dropdown`}>
                <form onSubmit={handleInputSubmit} onMouseLeave={() => addItem(index, false)} className="p-2">
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={inputPage}
                    onChange={(e) => setInputPage(e.target.value)}
                    placeholder="Sayfa"
                    className="w-16 px-2 py-1 text-sm border rounded"
                  />
                  <button type="submit" className="ml-1 px-2 py-1 text-xs bg-violet-500 text-white rounded">
                    Git
                  </button>
                </form>
              </div>
            </div>
          )
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`
              rounded-lg w-8 h-8 bg-cyan-50/80 backdrop-blur-lg border-2 border-gray-200 shadow-lg hover:scale-105 transition-all duration-300
              ${currentPage === page ? 'pagination-active' : ''}
            `}
          >
            {page}
          </button>
        )
      })}

      {showPrevNext && currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-lg w-8 h-8 bg-green-500 text-white hover:bg-green-600 hover:scale-105 transition-all duration-300"
          title="Sonraki sayfa"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      )}

      {showFirstLast && currentPage < totalPages && (
        <button
          onClick={() => onPageChange(totalPages)}
          className="bg-green-500 rounded-lg w-8 h-8 text-white hover:bg-green-600 hover:scale-105 transition-all duration-300"
          title="Son sayfa"
        >
          <FontAwesomeIcon icon={faAngleDoubleRight} />
        </button>
      )}

      <div className="ml-[3px] lg:ml-4 text-sm text-gray-600 whitespace-nowrap">
        Sayfa {currentPage} / {totalPages}
      </div>
    </div>
  )
}