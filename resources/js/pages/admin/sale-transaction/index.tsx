import CustPagination from '@/components/pagination';
import TransactionBadgeStatus from '@/components/transaction-badge-status';
import TransactionStatusButtons from '@/components/transaction-status-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import formatCurrency from '@/utils/formatCurrency';
import { Head, router, usePage } from '@inertiajs/react';
import { SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SaleTransaction {
    transaction_id: number;
    date: string;
    total_amount_khr: number;
    total_amount_usd: number;
    delivery_fee: number;
    transaction_date: string;
    invoice_number: string;
    total_discount: number;
    status: 'unpaid' | 'paid' | 'partial_paid' | 'cancelled' | string;
    customer: Customer;
}
interface Customer {
    id: number;
    name: string;
}

interface SaleTransactionResource {
    data: SaleTransaction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function SaleTransaction({ saleTransactions }: { saleTransactions: SaleTransactionResource }) {
    const { flash } = usePage<PageProps>().props;
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
    }, [flash]);
    return (
        <AppLayout>
            <Head title="Sale Transaction" />
            <div className="flex justify-between p-4">
                <div className="flex items-center gap-2">
                    <Select onValueChange={(value) => router.get(route('sale-transaction.index'), { status: value }, { preserveScroll: true })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unpaid">Unpaid</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="partial_paid">Partial Paid</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input type="text" placeholder="Search Customer" value={search} onChange={(e) => setSearch(e.target.value)} />
                    <Button
                        variant="outline"
                        onClick={() => router.get(route('sale-transaction.index'), { search: search }, { preserveScroll: true })}
                    >
                        <SearchIcon className="h-4 w-4" />
                        Search
                    </Button>
                </div>
            </div>
            <div className="space-y-6 p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice Number</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Total Amount KHR</TableHead>
                            <TableHead>Total Amount USD</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {saleTransactions.data.map((saleTransaction) => (
                            <TableRow key={saleTransaction.transaction_id}>
                                <TableCell>{saleTransaction.invoice_number}</TableCell>
                                <TableCell>{saleTransaction.customer.name}</TableCell>
                                <TableCell>{saleTransaction.transaction_date}</TableCell>
                                <TableCell>{formatCurrency(saleTransaction.total_amount_khr, 'KHR')}</TableCell>
                                <TableCell>{formatCurrency(saleTransaction.total_amount_usd, 'USD')}</TableCell>
                                <TableCell>
                                    <TransactionBadgeStatus status={saleTransaction.status} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button>View</Button>
                                        <TransactionStatusButtons saleTransaction={saleTransaction} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <CustPagination
                    currentPage={saleTransactions.current_page}
                    lastPage={saleTransactions.last_page}
                    onPageChange={(page) => router.get(route('sale-transaction.index'), { page }, { preserveScroll: true })}
                />
            </div>
        </AppLayout>
    );
}
