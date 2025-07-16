import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatCurrencyKHR, formatDate } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowLeftIcon, PrinterIcon } from 'lucide-react';

interface SaleTransactionDetail {
    type: string;
    product_id: number;
    variant_id: number;
    name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    images: string;
    size: string;
    stock_remaining: number;
    color: string;
}

interface SaleTransaction {
    transaction_id: number;
    invoice_number: string;
    total_amount_khr: number;
    total_amount_usd: number;
    delivery_fee: number;
    transaction_date: string;
    status: string;
    sale_transaction_details: SaleTransactionDetail[];
    customer: Customer;
}

export interface Customer {
    id: number;
    name: string;
    phone: string;
    address: string;
}

export interface SaleTransactionResource {
    data: SaleTransaction;
    customers?: Customer[];
}

export default function DetailSaleTransaction({ saleTransaction }: { saleTransaction: SaleTransactionResource }) {
    const { data } = saleTransaction;
    return (
        <AppLayout>
            <div className="space-y-6 p-4">
                <h1 className="text-2xl font-bold">Detail Sale Transaction</h1>
                <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('sale-transaction.index')}>
                                <ArrowLeftIcon className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline">
                            <PrinterIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-4">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500">Invoice Number</p>
                        <p className="font-bold">{data.invoice_number}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-bold">{data.customer.name}</p>
                        <p className="text-sm text-gray-500">Phone: {data.customer.phone}</p>
                        <p className="text-sm text-gray-500">Address: {data.customer.address}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-bold">{data.status}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500">Total Amount KHR</p>
                        <p className="font-bold">{formatCurrencyKHR(data.total_amount_khr)}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500">Total Amount USD</p>
                        <p className="font-bold">{formatCurrency(data.total_amount_usd)}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500">Delivery Fee</p>
                        <p className="font-bold">{formatCurrency(data.delivery_fee)}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500">Transaction Date</p>
                        <p className="font-bold">{formatDate(data.transaction_date)}</p>
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Subtotal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.sale_transaction_details.map((detail, index) => (
                            <TableRow key={index}>
                                <TableCell>{detail.name}</TableCell>
                                <TableCell>{detail.size}</TableCell>
                                <TableCell>{detail.color}</TableCell>
                                <TableCell>{detail.quantity}</TableCell>
                                <TableCell>{formatCurrency(detail.unit_price)}</TableCell>
                                <TableCell>{formatCurrency(detail.subtotal)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
