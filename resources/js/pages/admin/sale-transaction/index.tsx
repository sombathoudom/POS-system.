import CustPagination from '@/components/pagination';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import formatCurrency from '@/utils/formatCurrency';
import { router } from '@inertiajs/react';

interface SaleTransaction {
    transaction_id: number;
    date: string;
    total_amount_khr: number;
    total_amount_usd: number;
    delivery_fee: number;
    transaction_date: string;
    invoice_number: string;
    total_discount: number;
    status: string;
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
    console.log(saleTransactions);
    return (
        <AppLayout>
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
                                    {saleTransaction.status === 'unpaid' ? (
                                        <Badge variant="outline" className="bg-yellow-500 text-white">
                                            {saleTransaction.status}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-green-500 text-white">
                                            {saleTransaction.status}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button>View</Button>
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
