import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatCurrencyKHR } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeftIcon, CircleX, MinusIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { type Customer, type SaleTransactionDetail, type SaleTransactionResource } from './detail';

interface ProductResource {
    id: number;
    product_name: string;
    product_code: string;
    category: {
        id: number;
        name: string;
    };
    type: string;
    current_stock: number;
    cost_price_usd: number;
    sell_price_usd: number;
    cost_price_khr: number;
    sell_price_khr: number;
    variant_count: number;
    size: string;
    color: string;
    images: {
        id: number;
        path: string;
        alt_text: string;
        order: number;
    }[];
    variants: {
        id: number;
        size: string;
        color: string;
        current_stock: number;
        variant_code: string;
        sell_price_usd: number;
        images: {
            id: number;
            path: string;
            alt_text: string;
            order: number;
        }[];
    }[];
}

interface SelectedProduct {
    variant_id: number;
    product_id: number | null;
    name: string;
    size: string;
    color: string;
    stock_remaining: number;
    unit_price: number;
    images: {
        id: number;
        path: string;
        alt_text: string;
        order: number;
    }[];
    type: string;
}
export default function EditSaleTransaction({ saleTransaction, customers }: { saleTransaction: SaleTransactionResource; customers: Customer[] }) {
    const { data } = saleTransaction;
    const [productQuery, setProductQuery] = useState('');
    const [productSuggestions, setProductSuggestions] = useState<ProductResource[]>([]);
    const [discount, setDiscount] = useState(data.discount);
    const [shippingFee, setShippingFee] = useState(data.delivery_fee);
    const [totalKhr, setTotalKhr] = useState(data.total_amount_khr);
    const [totalUsd, setTotalUsd] = useState(data.total_amount_usd);
    const [paymentStatus, setPaymentStatus] = useState(data.status);
    const [orderDate, setOrderDate] = useState(new Date(data.transaction_date).toISOString().split('T')[0]);
    const [customer, setCustomer] = useState(data.customer);
    // const [subTotal, setSubTotal] = useState(0);
    // const [subTotalKhr, setSubTotalKhr] = useState(0);
    const [total, setTotal] = useState(0);

    const [details, setDetails] = useState<SaleTransactionDetail[]>(
        data.sale_transaction_details.map((item) => ({
            ...item,
            subtotal: item.unit_price * item.quantity,
        })),
    );
    const onSearchProduct = async (q: string) => {
        setProductQuery(q);
        const response = await axios.get(route('sale-transaction.search-products-edit'), {
            params: { search: q },
        });
        setProductSuggestions(response.data.data);
    };

    const updateQuantity = (idx: number, qty: number) => {
        const subtotal = details[idx].unit_price * details[idx].quantity;
        setTotalKhr(totalKhr - (subtotal - details[idx].unit_price * qty) * 4100);
        setTotalUsd(totalUsd - (subtotal - details[idx].unit_price * qty));
        setTotal(total - (subtotal - details[idx].unit_price * qty));
        setDetails((prev) =>
            prev.map((d, i) =>
                i === idx
                    ? {
                          ...d,
                          quantity: qty,
                          subtotal: Number(d.unit_price) * qty,
                      }
                    : d,
            ),
        );
    };

    const updateUnitPrice = (idx: number, price: number) => {
        setTotalKhr(totalKhr - (details[idx].subtotal - price * details[idx].quantity) * 4100);
        setTotalUsd(totalUsd - (details[idx].subtotal - price * details[idx].quantity));
        setTotal(total - (details[idx].subtotal - price * details[idx].quantity));
        setDetails((prev) => prev.map((d, i) => (i === idx ? { ...d, unit_price: price, subtotal: price * d.quantity } : d)));
    };
    // Add new product from search
    const addProductToSale = (product: SelectedProduct) => {
        if (product.stock_remaining <= 0) return;
        if (details.some((d) => d.variant_id === product.variant_id)) return;
        const newDetail = {
            product_id: 0,
            variant_id: product.variant_id,
            name: product.name,
            size: product.size,
            color: product.color,
            unit_price: product.unit_price,
            quantity: 1,
            stock_remaining: product.stock_remaining,
            subtotal: product.unit_price * 1,
            images: product.images[0]?.path,
            type: product.type,
        };
        setDetails((prev) => [...prev, newDetail]);
        setProductQuery('');
        setProductSuggestions([]);
    };

    const deleteDetail = (index: number) => {
        setDetails((prev) => prev.filter((_, i) => i !== index));
    };

    // Payload builder
    const getDetailKey = (d: SaleTransactionDetail) => `${d.product_id}_${d.variant_id}`;
    const buildPayload = () => {
        const oldMap: Record<string, SaleTransactionDetail> = {};
        data.sale_transaction_details.forEach((d) => {
            oldMap[getDetailKey(d)] = d;
        });

        const currentMap: Record<string, SaleTransactionDetail> = {};
        details.forEach((d) => {
            currentMap[getDetailKey(d)] = d;
        });

        const allKeys = Array.from(new Set([...data.sale_transaction_details.map(getDetailKey), ...details.map(getDetailKey)]));

        const sale_transaction_details = allKeys.map((key) => {
            const old = oldMap[key];
            const curr = currentMap[key];
            return {
                product_id: old ? old.product_id : curr.product_id,
                variant_id: old ? old.variant_id : curr.variant_id,
                old_quantity: old ? old.quantity : 0,
                new_quantity: curr ? curr.quantity : 0,
                unit_price: curr ? Number(curr.unit_price) : old ? Number(old.unit_price) : 0,
                subtotal: curr ? Number(curr.unit_price) * curr.quantity : 0,
            };
        });
        return sale_transaction_details;
    };
    const handleUpdate = () => {
        const payload = {
            // add other fields as needed
            sale_transaction_details: buildPayload(),
        };
        console.log('Payload:', payload);
    };

    // const calculateTotal = () => {
    //     const total = details.reduce((acc, curr) => acc + curr.subtotal, 0);
    //     setTotal(total);
    //     setTotalKhr(total * 4100);
    //     setTotalUsd(total);
    // };

    const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDiscount(Number(e.target.value));
        setTotalKhr(totalKhr - Number(e.target.value) * 4100);
        setTotalUsd(totalUsd - Number(e.target.value));
        setTotal(total - Number(e.target.value));
    };

    const handleShippingFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShippingFee(Number(e.target.value));
        setTotalKhr(totalKhr - Number(e.target.value) * 4100);
        setTotalUsd(totalUsd - Number(e.target.value));
        setTotal(total + Number(e.target.value));
    };
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
                {/* <Input type="text" placeholder="Search Product" /> */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product List</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto p-0">
                        <div className="grid grid-cols-3 gap-4 p-4">
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
                            <div className="space-y-2">
                                <Label>Payment Status</Label>
                                <Select defaultValue={data.status}>
                                    <SelectTrigger>
                                        <SelectValue defaultValue={data.status} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="unpaid">Unpaid</SelectItem>
                                        <SelectItem value="partial_paid">Partial Paid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex w-full flex-col items-center gap-2 border-b p-4">
                            <div className="relative w-full">
                                <Input
                                    type="text"
                                    placeholder="Search Product"
                                    value={productQuery}
                                    onChange={(e) => onSearchProduct(e.target.value)}
                                    className="w-full"
                                />
                                <CircleX
                                    className="text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer"
                                    onClick={() => {
                                        setProductQuery('');
                                        setProductSuggestions([]);
                                    }}
                                />
                            </div>
                            {productSuggestions.length > 0 && (
                                <div className="w-full rounded border bg-white shadow">
                                    {productSuggestions.map((p) =>
                                        p.type === 'single' ? (
                                            <div key={p.id} className="flex cursor-pointer items-center gap-2 p-2 hover:bg-gray-100">
                                                <Avatar>
                                                    <AvatarImage src={p.images[0]?.path} alt={p.product_name} />
                                                    <AvatarFallback>{p.product_name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span>
                                                    {p.product_name} - {p.size.toUpperCase()}
                                                </span>
                                                <Badge variant="outline" className="text-muted-foreground text-xs">
                                                    {p.current_stock} Pcs
                                                </Badge>
                                            </div>
                                        ) : (
                                            p.variants.map((v) => (
                                                <div
                                                    key={v.id}
                                                    className="flex cursor-pointer items-center gap-2 p-2 hover:bg-gray-100"
                                                    onClick={() =>
                                                        addProductToSale({
                                                            variant_id: v.id,
                                                            product_id: p.id,
                                                            name: p.product_name,
                                                            size: v.size,
                                                            color: v.color,
                                                            stock_remaining: v.current_stock,
                                                            unit_price: v.sell_price_usd,
                                                            images: v.images,
                                                            type: 'variant',
                                                        })
                                                    }
                                                >
                                                    <Avatar>
                                                        <AvatarImage src={v.images[0]?.path} alt={v.variant_code} />
                                                        <AvatarFallback>{p.product_name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span>
                                                        {v.variant_code} | {v.size.toUpperCase()}
                                                    </span>
                                                    <Badge variant="outline" className="text-muted-foreground text-xs">
                                                        {v.current_stock} Pcs
                                                    </Badge>
                                                </div>
                                            ))
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
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
                                {details.map((detail, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={detail.images} alt={detail.name} />
                                                <AvatarFallback>{detail.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell>{detail.name}</TableCell>
                                        <TableCell>{detail.size}</TableCell>
                                        <TableCell>{detail.color}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{detail.stock_remaining} Pcs</Badge>
                                        </TableCell>
                                        <TableCell className="justify-items-center">
                                            <div className="flex w-48 items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    disabled={detail.quantity <= 1}
                                                    onClick={() => updateQuantity(index, Math.max(1, detail.quantity - 1))}
                                                >
                                                    <MinusIcon className="h-4 w-4" />
                                                </Button>
                                                <Input
                                                    type="number"
                                                    className="w-16 text-center"
                                                    min={1}
                                                    max={detail.stock_remaining}
                                                    value={detail.quantity}
                                                    onChange={(e) => {
                                                        let value = Math.max(1, Math.min(detail.stock_remaining, parseInt(e.target.value) || 1));
                                                        updateQuantity(index, value);
                                                    }}
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    disabled={detail.quantity >= detail.stock_remaining}
                                                    onClick={() => updateQuantity(index, Math.min(detail.stock_remaining, detail.quantity + 1))}
                                                >
                                                    <PlusIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="w-24"
                                                value={detail.unit_price}
                                                onChange={(e) => updateUnitPrice(index, Number(e.target.value))}
                                            />
                                        </TableCell>
                                        <TableCell>{formatCurrency(detail.subtotal)}</TableCell>
                                        <TableCell>
                                            <Button variant="destructive" size="icon" onClick={() => deleteDetail(index)}>
                                                <TrashIcon className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={9} className="text-right">
                                        Sub Total: {formatCurrency(totalUsd)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={9} className="text-right">
                                        Sub Total {formatCurrencyKHR(totalKhr)}
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                        <div className="grid grid-cols-3 gap-2 p-4">
                            <div className="flex flex-col gap-2">
                                <Label>Discount($)</Label>
                                <Input type="number" placeholder="Discount" value={Number(discount)} onChange={handleDiscountChange} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Shipping Fee</Label>
                                <Input type="number" placeholder="Shipping Fee" value={Number(shippingFee)} onChange={handleShippingFeeChange} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Total KHR</Label>
                                <Input
                                    type="number"
                                    placeholder="Total KHR"
                                    value={Number(totalKhr)}
                                    onChange={(e) => setTotalKhr(Number(e.target.value))}
                                />
                            </div>
                            {/* <div className="flex flex-col gap-2">
                                <Label>Total USD</Label>
                                <Input type="number" placeholder="Total USD" value={Number(totalUsd)} />
                            </div> */}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button onClick={handleUpdate}>Update</Button>
                        <Button variant="outline">Cancel</Button>
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}
