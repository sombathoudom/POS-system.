import { cn } from '@/lib/utils';
import { PaginatedResponse } from '@/types';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from './ui/pagination';

type InertiaPaginationProps<T> = {
    paginateItems: PaginatedResponse<T>;
    onPageChange?: (page: number) => void;
};
const CustPagination = <T,>({ paginateItems, onPageChange }: InertiaPaginationProps<T>) => {
    console.log(paginateItems);

    const { links, prev_page_url, next_page_url, current_page, last_page } = paginateItems;
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const maxPagesToShow = 5;
        const delta = 2;

        if (last_page <= maxPagesToShow) {
            for (let i = 1; i <= last_page; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (current_page > delta + 2) {
                pages.push('ellipsis');
            }
            const start = Math.max(2, current_page - delta);
            const end = Math.min(last_page - 1, current_page + delta);
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            if (current_page < last_page - delta - 1) {
                pages.push('ellipsis');
            }
            if (last_page > 1) {
                pages.push(last_page);
            }
        }
        return pages;
    };
    return (
        <Pagination className="mt-6">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href={prev_page_url || '#'}
                        className={cn('gap-1 pl-2.5', !prev_page_url && 'pointer-events-none opacity-50')}
                        aria-disabled={!prev_page_url}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Previous</span>
                    </PaginationPrevious>
                </PaginationItem>

                {getPageNumbers().map((page, index) =>
                    page === 'ellipsis' ? (
                        <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis>
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More pages</span>
                            </PaginationEllipsis>
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={page}>
                            <PaginationLink
                                href={links.find((link) => parseInt(link.label) === page)?.url || '#'}
                                isActive={current_page === page}
                                className={cn(current_page === page && 'bg-muted')}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onPageChange?.(page);
                                }}
                            >
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    ),
                )}

                <PaginationItem>
                    <PaginationNext
                        href={next_page_url || '#'}
                        className={cn('gap-1 pr-2.5', !next_page_url && 'pointer-events-none opacity-50')}
                        aria-disabled={!next_page_url}
                    >
                        <span>Next</span>
                        <ChevronRight className="h-4 w-4" />
                    </PaginationNext>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};

export default CustPagination;
