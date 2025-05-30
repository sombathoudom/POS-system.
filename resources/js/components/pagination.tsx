// components/Pagination.tsx
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
interface PaginationProps {
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export default function CustPagination({ currentPage, lastPage, onPageChange, className }: PaginationProps) {
    // Generate page numbers (show up to 5 pages, with ellipsis for large ranges)
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxPagesToShow = 5;
        const sidePages = Math.floor(maxPagesToShow / 2);

        let startPage = Math.max(1, currentPage - sidePages);
        let endPage = Math.min(lastPage, currentPage + sidePages);

        // Adjust start/end if near the edges
        if (currentPage <= sidePages) {
            endPage = Math.min(lastPage, maxPagesToShow);
        } else if (currentPage + sidePages >= lastPage) {
            startPage = Math.max(1, lastPage - maxPagesToShow + 1);
        }

        // Add first page and ellipsis
        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) pages.push('...');
        }

        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Add last page and ellipsis
        if (endPage < lastPage) {
            if (endPage < lastPage - 1) pages.push('...');
            pages.push(lastPage);
        }

        return pages;
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= lastPage && page !== currentPage) {
            onPageChange(page);
        }
    };

    // Don't render if only one page
    if (lastPage <= 1) return null;

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                </PaginationItem>
                <PaginationItem>
                    {getPageNumbers().map((page, index) => (
                        <PaginationLink
                            key={`${page}-${index}`}
                            onClick={() => typeof page === 'number' && handlePageChange(page)}
                            isActive={page === currentPage}
                        >
                            {page}
                        </PaginationLink>
                    ))}
                </PaginationItem>
                <PaginationItem>
                    <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
        // <div className={cn('mt-4 flex items-center justify-center gap-2', className)}>
        //     {/* Previous Button */}
        //     <Button
        //         variant="outline"
        //         size="sm"
        //         onClick={() => handlePageChange(currentPage - 1)}
        //         disabled={currentPage === 1}
        //         className="flex items-center gap-1"
        //     >
        //         <ChevronLeft className="h-4 w-4" />
        //         <span>Previous</span>
        //     </Button>

        //     {/* Page Numbers */}
        //     {getPageNumbers().map((page, index) => (
        //         <Button
        //             key={`${page}-${index}`}
        //             variant={page === currentPage ? 'default' : 'outline'}
        //             size="sm"
        //             onClick={() => typeof page === 'number' && handlePageChange(page)}
        //             disabled={typeof page !== 'number'}
        //             className={cn(
        //                 page === currentPage ? 'bg-primary hover:bg-primary/90 text-white' : 'text-primary',
        //                 typeof page !== 'number' && 'cursor-default',
        //             )}
        //         >
        //             {page}
        //         </Button>
        //     ))}

        //     {/* Next Button */}
        //     <Button
        //         variant="outline"
        //         size="sm"
        //         onClick={() => handlePageChange(currentPage + 1)}
        //         disabled={currentPage === lastPage}
        //         className="flex items-center gap-1"
        //     >
        //         <span>Next</span>
        //         <ChevronRight className="h-4 w-4" />
        //     </Button>
        // </div>
    );
}
