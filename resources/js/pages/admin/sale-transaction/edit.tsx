import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, MinusIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { type Customer, type SaleTransactionResource } from './detail';
export default function EditSaleTransaction({ saleTransaction, customers }: { saleTransaction: SaleTransactionResource; customers: Customer[] }) {
    const { data } = saleTransaction;

    return (
        <AppLayout>
            <Head title="Edit Sale Transaction" />
            <div className="flex justify-between p-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href={route('sale-transaction.index')}>
                            <ArrowLeftIcon className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
            <div className="space-y-6 p-4">
                <Input type="text" placeholder="Search Product" />
                <Card>
                    <CardHeader>
                        <CardTitle>Product List</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto p-0">
                        <div className="grid grid-cols-2 gap-4 p-4">
                            <div className="space-y-2">
                                <Label>Order Date</Label>
                                <Input type="date" placeholder="Order Date" value={new Date(data.transaction_date).toISOString().split('T')[0]} />
                            </div>
                            <div className="space-y-2">
                                <Label>Customer</Label>
                                <Select defaultValue={data.customer.id.toString()}>
                                    <SelectTrigger>
                                        <SelectValue defaultValue={data.customer.id.toString()} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map((customer) => (
                                            <SelectItem key={customer.id} value={customer.id.toString()}>
                                                {customer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Color</TableHead>
                                    <TableHead>Stock Remaining</TableHead>
                                    <TableHead className="text-center">Quantity</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.sale_transaction_details.map((detail, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{detail.name}</TableCell>
                                        <TableCell>{detail.size}</TableCell>
                                        <TableCell>{detail.color}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{detail.stock_remaining} Pcs</Badge>
                                        </TableCell>
                                        <TableCell className="justify-items-center">
                                            <div className="flex w-48 items-center gap-2">
                                                <Button>
                                                    <MinusIcon className="h-8 w-8" />
                                                </Button>
                                                <Input type="number" value={detail.quantity} min={0} max={detail.stock_remaining} />
                                                <Button>
                                                    <PlusIcon className="h-8 w-8" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatCurrency(detail.unit_price)}</TableCell>
                                        <TableCell>{formatCurrency(detail.subtotal)}</TableCell>
                                        <TableCell>
                                            <Button variant="destructive" size="icon">
                                                <TrashIcon className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
