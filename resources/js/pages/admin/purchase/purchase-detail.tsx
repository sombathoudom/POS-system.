import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
interface PurchaseOrderItem {
    id: number;
    purchase_order_id: number;
    product: string;
    product_id: number;
    variant: string | null;
    variant_id: number | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
}

interface PurchaseOrder {
    id: number;
    items: PurchaseOrderItem[];
    order_date: string;
    status: 'pending' | 'paid'; // Using union type since these are the only possible values
    supplier: string;
    total_amount: string;
}

interface PurchaseOrderResource {
    data: PurchaseOrder;
}

export default function PurchaseDetail({ purchaseOrder }: { purchaseOrder: PurchaseOrderResource }) {
    console.log(purchaseOrder);
    return (
        <AppLayout>
            <div className="space-y-6 p-4">
                <div className="flex justify-between">
                    <h1 className="text-2xl font-bold">Purchase Order Details</h1>
                    <div className="flex gap-2">
                        <Button>Edit</Button>
                        <Button variant="secondary" asChild>
                            <Link href={route('purchase.index')} className="text-red-500">
                                Cancel
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500">Supplier</p>
                        <p className="font-bold">{purchaseOrder.data.supplier}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500">Order Date</p>
                        <p className="font-bold">{purchaseOrder.data.order_date}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-bold">{purchaseOrder.data.status}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-bold">{purchaseOrder.data.total_amount}</p>
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Subtotal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {purchaseOrder.data.items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    {item.product} {item.variant ? <span className="text-sm text-gray-500">({item.variant})</span> : ''}
                                </TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.unit_price}</TableCell>
                                <TableCell>{item.subtotal}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
