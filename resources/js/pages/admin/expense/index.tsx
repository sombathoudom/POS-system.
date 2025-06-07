import ButtonLink from '@/components/button-link';
import CustPagination from '@/components/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageProps } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { PencilIcon, PlusIcon } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export interface Expense {
    id: number;
    expense_date: string;
    name: string;
    amount: number;
    description: string;
    expense_category_id: number;
    expense_category: {
        id: number;
        name: string;
    };
}

interface PaginatedExpenses {
    data: Expense[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
export default function Expense({ expenses }: { expenses: PaginatedExpenses }) {
    const { flash } = usePage<PageProps>().props;
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash?.success);
        }
    }, [flash.success]);

    return (
        <AppLayout>
            <div className="space-y-6 p-4">
                <ButtonLink icon={<PlusIcon />} href={'expsense.create'} title="Expense" buttonText="Add Expense" />
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Expense Category</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.data.map((expense) => (
                            <TableRow key={expense.id}>
                                <TableCell>{formatDate(expense.expense_date)}</TableCell>
                                <TableCell>{expense.name}</TableCell>
                                <TableCell>{formatCurrency(expense.amount)}</TableCell>
                                <TableCell>{expense.expense_category.name}</TableCell>
                                <TableCell>{expense.description}</TableCell>
                                <TableCell>
                                    <ButtonLink icon={<PencilIcon />} href={'expsense.edit'} params={{ id: expense.id }} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <CustPagination
                    currentPage={expenses.current_page}
                    lastPage={expenses.last_page}
                    onPageChange={(page) => router.get(route('expsense.index'), { page }, { preserveScroll: true })}
                />
            </div>
        </AppLayout>
    );
}
