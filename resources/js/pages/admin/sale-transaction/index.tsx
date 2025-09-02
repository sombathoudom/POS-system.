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
import { Head, Link, router, usePage } from '@inertiajs/react';
import { EyeIcon, PencilIcon, PrinterIcon, SearchIcon, XIcon } from 'lucide-react';
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
    const [statusFilter, setStatusFilter] = useState('');
    const [pages, setPage] = useState(1);
    const handleOpenNewTab = (url: string) => {
        window.open(url, '_blank');
    };
    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
    }, [flash]);
    const handleSearch = () => {
        router.get(route('sale-transaction.index'), { search: search, status: statusFilter }, { preserveScroll: true, preserveState: true });
    };
    const handleMarkAsPaid = (id: number) => {
        router.post(route('sale-transaction.markAsPaid', { id }), { preserveScroll: true, preserveState: true });
    };
    const handleMarkAsCancelled = (id: number) => {
        router.post(route('sale-transaction.markAsCancelled', { id }), {
            preserveScroll: true,
            preserveState: true,
        });
    };
    const handlePageChange = (page: number) => {
        setPage(page);
        router.get(route('sale-transaction.index'), { page, search, status: statusFilter }, { preserveScroll: true, preserveState: true });
    };
    return (
        <AppLayout>
            <Head title="Sale Transaction" />
            <div className="flex justify-between p-4">
                <div className="flex items-center gap-2">
                    <Select onValueChange={(value) => setStatusFilter(value)}>
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
                    <Button variant="outline" onClick={handleSearch}>
                        <SearchIcon className="h-4 w-4" />
                        Search
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            setStatusFilter('');
                            setSearch('');
                            router.get(route('sale-transaction.index'), { search: '', status: '' }, { preserveScroll: true, preserveState: true });
                        }}
                    >
                        <XIcon className="h-4 w-4" />
                        Reset Filter
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
                                        <Button asChild>
                                            <Link href={route('sale-transaction.detail', saleTransaction.transaction_id)}>
                                                <EyeIcon className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="warning" // Adjust variant based on your UI library (e.g., 'success' may not be valid)
                                            className="mr-2" // Optional: Add margin between buttons
                                            asChild
                                        >
                                            <Link href={route('sale-transaction.edit', saleTransaction.transaction_id)}>
                                                <PencilIcon className="h-4 w-4" />
                                            </Link>
                                        </Button>

                                        <Button asChild>
                                            <Link
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleOpenNewTab(route('sale-transaction.print-invoice', saleTransaction.transaction_id));
                                                }}
                                                target="_blank"
                                            >
                                                <PrinterIcon className="h-4 w-4" />
                                            </Link>
                                        </Button>

                                        <TransactionStatusButtons
                                            saleTransaction={saleTransaction}
                                            markAsPaid={handleMarkAsPaid}
                                            markAsCancelled={handleMarkAsCancelled}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <CustPagination
                    currentPage={saleTransactions.current_page}
                    lastPage={saleTransactions.last_page}
                    onPageChange={(page) => handlePageChange(page)}
                />
            </div>
        </AppLayout>
    );
}
