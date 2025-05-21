import ButtonLink from '@/components/button-link';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import { EyeIcon, PlusIcon } from 'lucide-react';
export interface PurchaseOrder {
    id: number;
    supplier: string;
    order_date: string;
    status: string;
    total_amount: number;
}

interface PurchaseOrderResource {
    data: PurchaseOrder[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function PurchaseOrder({ purchaseOrders }: { purchaseOrders: PurchaseOrderResource }) {
    return (
        <AppLayout>
            <div className="space-y-6 p-4">
                <ButtonLink icon={<PlusIcon />} href={'purchase.create'} title="Purchase" buttonText="Add Purchase" />
            </div>
            <div className="space-y-6 p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Order Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {purchaseOrders.data.map((purchaseOrder) => (
                            <TableRow key={purchaseOrder.id}>
                                <TableCell>{purchaseOrder.supplier}</TableCell>
                                <TableCell>{purchaseOrder.order_date}</TableCell>
                                <TableCell>
                                    <Badge variant={purchaseOrder.status === 'pending' ? 'secondary' : 'default'}>{purchaseOrder.status}</Badge>
                                </TableCell>
                                <TableCell>{purchaseOrder.total_amount}</TableCell>
                                <TableCell>
                                    <ButtonLink icon={<EyeIcon />} href={'purchase.show'} params={purchaseOrder.id} buttonText="View" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Pagination
                    currentPage={purchaseOrders.meta.current_page}
                    lastPage={purchaseOrders.meta.last_page}
                    onPageChange={(page) => router.get(route('purchase.index'), { page }, { preserveScroll: true })}
                />
            </div>
        </AppLayout>
    );
}
