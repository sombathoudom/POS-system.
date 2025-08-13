import ButtonLink from '@/components/button-link';
import CustPagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageProps } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { PencilIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { type ExpenseCategory } from './form-expense';

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
export default function Expense({ expenses, expenseCategories }: { expenses: PaginatedExpenses, expenseCategories: ExpenseCategory[] }) {
    const { flash } = usePage<PageProps>().props;
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash?.success);
        }
    }, [flash.success]);
    const [objectFilter, setObjectFilter] = useState<{
        expense_category_id: string | null;
        start_date: string | null;
        end_date: string | null;
    }>({
        expense_category_id: null,
        start_date: null,
        end_date: null,
    });
    const handleSearch = async () => {
        await router.get(route('expsense.index'), objectFilter, { preserveScroll: true,preserveState: true });
    };
    return (
        <AppLayout>
            <div className="space-y-6 p-4">
                <ButtonLink icon={<PlusIcon />} href={'expsense.create'} title="Expense" buttonText="Add Expense" />

                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Expense Category</Label>
                            <Select value={objectFilter.expense_category_id || ''} onValueChange={(value) => setObjectFilter({ ...objectFilter, expense_category_id: value })}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {expenseCategories.map((category) => (
                                        <SelectItem key={category.id} value={String(category.id)}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                            <Input
                                type="date"
                                className="w-full"
                                value={objectFilter.start_date || ''}
                                onChange={(e) => setObjectFilter({ ...objectFilter, start_date: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">End Date</Label>
                            <Input
                                type="date"
                                className="w-full"
                                value={objectFilter.end_date || ''}
                                onChange={(e) => setObjectFilter({ ...objectFilter, end_date: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">&nbsp;</Label>
                            <Button onClick={handleSearch} className="w-full">
                                <SearchIcon className="w-4 h-4 mr-2" />
                                Search
                            </Button>
                        </div>
                    </div>
                </div>

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
