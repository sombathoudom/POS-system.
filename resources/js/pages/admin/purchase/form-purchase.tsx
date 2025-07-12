import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { CircleX } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { toast } from 'sonner';

interface Product {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    product_code: string;
    current_stock: number;
    size: string;
    color: string;
    type: string;
    cost_price_usd: number;
    unit_price?: number;
    variant_id?: number; // Added: Optional variant_id for variant products
    variant_code?: string; // Added: Optional variant_code for both single and variant products
    images: {
        id: number;
        path: string;
        alt_text: string;
        order: number;
    }[];
    variants: {
        // Made non-optional, assuming variants is always an array (empty for single products)
        id: number;
        size: string;
        color: string;
        cost_price_usd: number;
        current_stock: number;
        variant_code: string;
    }[];
}

interface PurchaseFormData {
    supplier_id: string;
    order_date: string;
    status: string;
    total_amount: number;
    items: {
        product_id: number;
        variant_id?: number;
        product_code: string;
        variant_code: string;
        size: string;
        color: string;
        quantity: number;
        cost_price_usd: number;
        type: string;
    }[];
    [key: string]: any;
}

interface Supplier {
    supplier_id: number;
    supplier_name: string;
}

export default function FormPurchase({ suppliers }: { suppliers: Supplier[] }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const deferredSearchQuery = useDeferredValue(searchQuery);

    const { data, setData, post, errors, processing } = useForm<PurchaseFormData>({
        supplier_id: '',
        order_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        total_amount: 0,
        items: [],
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Transform products into the format expected by the backend
        const formattedItems = products.map((product) => ({
            product_id: product.id,
            variant_id: product.type === 'variant' ? product.variant_id : undefined,
            product_code: product.product_code,
            variant_code: product.variant_code || product.product_code,
            size: product.size,
            color: product.color,
            quantity: product.quantity,
            cost_price_usd: product.cost_price_usd,
            type: product.type,
        }));

        // Update the form data with formatted items
        setData('items', formattedItems);

        // Submit the form
        post(route('purchase.store'), {
            onSuccess: () => {
                toast.success('Purchase order created successfully');
                setProducts([]); // Reset products after successful submission
                setData({
                    supplier_id: '',
                    order_date: new Date().toISOString().split('T')[0],
                    status: 'pending',
                    total_amount: 0,
                    items: [],
                });
            },
            onError: (errors) => {
                toast.error('Failed to create purchase order');
                console.error('Form submission errors:', errors);
            },
        });
    };

    const handleSearch = async () => {
        try {
            const response = await axios.get(route('products.search'), {
                params: { search: deferredSearchQuery },
            });
            setSearchResults(response.data.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const isProductAlreadyAdded = (product: Product, variant?: Product['variants'][0]) => {
        return products.some((p) => {
            if (product.type === 'single') {
                return p.id === product.id;
            }
            return p.id === product.id && p.size === variant?.size && p.color === variant?.color;
        });
    };

    const addProduct = (product: Product, variant?: Product['variants'][0]) => {
        if (isProductAlreadyAdded(product, variant)) {
            toast.error(`This ${product.type === 'single' ? 'product' : `variant (${variant?.size} - ${variant?.color})`} is already added`);
            return;
        }

        const productWithVariant = {
            ...product,
            size: variant ? variant.size : product.size,
            color: variant ? variant.color : product.color,
            cost_price_usd: variant ? variant.cost_price_usd : product.cost_price_usd,
            variant_code: variant ? variant.variant_code : product.product_code,
            variant_id: variant ? variant.id : undefined, // Store variant_id for variant products
            quantity: 1,
        };

        const updatedProducts = [...products, productWithVariant];
        setProducts(updatedProducts);
        setData(
            'items',
            updatedProducts.map((p) => ({
                product_id: p.id,
                variant_id: p.type === 'variant' ? p.variant_id : undefined,
                product_code: p.product_code,
                variant_code: p.variant_code || p.product_code,
                size: p.size,
                color: p.color,
                quantity: p.quantity,
                cost_price_usd: p.cost_price_usd,
                unit_price: p.unit_price || 0,
                type: p.type,
            })),
        );
        updateTotalAmount(updatedProducts);
        setSearchQuery('');
        // setSearchResults([]);
        toast.success('Product added successfully');
    };

    const updateProductQuantity = (index: number, quantity: number) => {
        const updatedProducts = [...products];
        updatedProducts[index].quantity = quantity;
        setProducts(updatedProducts);
        setData(
            'items',
            updatedProducts.map((p) => ({
                product_id: p.id,
                variant_id: p.type === 'variant' ? p.variant_id : undefined,
                product_code: p.product_code,
                variant_code: p.variant_code || p.product_code,
                size: p.size,
                color: p.color,
                quantity: p.quantity,
                cost_price_usd: p.cost_price_usd,
                unit_price: p.unit_price || 0,
                type: p.type,
            })),
        );
        updateTotalAmount(updatedProducts);
    };

    const removeProduct = (index: number) => {
        const updatedProducts = products.filter((_, i) => i !== index);
        setProducts(updatedProducts);
        setData(
            'items',
            updatedProducts.map((p) => ({
                product_id: p.id,
                variant_id: p.type === 'variant' ? p.variant_id : undefined,
                product_code: p.product_code,
                variant_code: p.variant_code || p.product_code,
                size: p.size,
                color: p.color,
                quantity: p.quantity,
                cost_price_usd: p.cost_price_usd,
                unit_price: p.unit_price || 0,
                type: p.type,
            })),
        );
        updateTotalAmount(updatedProducts);
    };

    const updateTotalAmount = (productList: Product[]) => {
        const total = productList.reduce((sum, product) => sum + product.quantity * (product.unit_price || 0), 0);
        setData('total_amount', total);
    };

    const updateProductPrice = (index: number, price: number) => {
        const updatedProducts = [...products];
        updatedProducts[index].unit_price = price;
        setProducts(updatedProducts);
        setData(
            'items',
            updatedProducts.map((p) => ({
                product_id: p.id,
                variant_id: p.type === 'variant' ? p.variant_id : undefined,
                product_code: p.product_code,
                variant_code: p.variant_code || p.product_code,
                size: p.size,
                color: p.color,
                quantity: p.quantity,
                cost_price_usd: p.cost_price_usd, // `cost_price_usd` is sent, but sourced from unit_price
                unit_price: p.unit_price || 0,
                type: p.type,
            })),
        );
        updateTotalAmount(updatedProducts);
    };

    // Group products by product_code
    let groupedProducts: Record<string, Product[]> = {};
    if (searchResults && searchResults.length > 0) {
        groupedProducts = searchResults.reduce(
            (acc, product) => {
                if (!acc[product.product_code]) {
                    acc[product.product_code] = [];
                }
                acc[product.product_code].push(product);
                return acc;
            },
            {} as Record<string, Product[]>,
        );
    }

    return (
        <AppLayout>
            <div className="container mx-auto space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Create New Purchase</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Purchase Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="order_date">Order Date</Label>
                                        <Input
                                            type="date"
                                            id="order_date"
                                            value={data.order_date}
                                            onChange={(e) => setData('order_date', e.target.value)}
                                        />
                                        <InputError message={errors.order_date} />
                                    </div>
                                    <div>
                                        <Label htmlFor="supplier_id">Supplier Name</Label>
                                        <Select onValueChange={(value) => setData('supplier_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select supplier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {suppliers.map((supplier) => (
                                                    <SelectItem key={supplier.supplier_id} value={supplier.supplier_id.toString()}>
                                                        {supplier.supplier_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.supplier_id} />
                                    </div>
                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Select onValueChange={(value) => setData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.status} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <Label htmlFor="search">Search Product</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="text"
                                                id="search"
                                                placeholder="Search product"
                                                autoComplete="off"
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyUp={(e) => {
                                                    e.preventDefault();
                                                    handleSearch();
                                                }}
                                            />
                                        </div>
                                        {searchResults && searchResults.length > 0 && (
                                            <div className="mt-2 space-y-4">
                                                {Object.entries(groupedProducts).map(([productCode, products]) => (
                                                    <div key={productCode} className="rounded-md border p-4">
                                                        <div className="mb-2 flex items-center gap-4">
                                                            <img
                                                                src={products[0]?.images[0]?.path}
                                                                alt={products[0].product_name}
                                                                className="h-16 w-16 rounded object-cover"
                                                            />
                                                            <div>
                                                                <h3 className="font-semibold">{products[0].product_name}</h3>
                                                                <p className="text-sm text-gray-500">Product Code: {productCode}</p>
                                                            </div>
                                                        </div>
                                                        {products[0].type === 'single' ? (
                                                            <div
                                                                className="cursor-pointer rounded border p-2 hover:bg-gray-50"
                                                                onClick={() => addProduct(products[0])}
                                                            >
                                                                <div className="text-sm">
                                                                    <div className="mb-1 font-medium text-gray-900">{products[0].product_code}</div>
                                                                    <div className="text-gray-600">
                                                                        <div>Size: {products[0].size}</div>
                                                                        <div>Color: {products[0].color}</div>
                                                                        <div>Price: ${products[0].cost_price_usd}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                                                                {products[0].variants.map((variant) => (
                                                                    <div
                                                                        key={`${variant.id}-${variant.size}-${variant.color}`}
                                                                        className="cursor-pointer rounded border p-2 hover:bg-gray-50"
                                                                        onClick={() => addProduct(products[0], variant)}
                                                                    >
                                                                        <div className="text-sm">
                                                                            <div className="mb-1 font-medium text-gray-900">
                                                                                {variant.variant_code}
                                                                            </div>
                                                                            <div className="text-gray-600">
                                                                                <div>Size: {variant?.size}</div>
                                                                                <div>Color: {variant?.color}</div>
                                                                                <div>Price: ${variant.cost_price_usd}</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead className="text-yellow-500">Current Stock</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead>Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {products.map((product, index) => (
                                                <TableRow
                                                    key={`${product.id}-${product.type === 'single' ? product.product_code : product.variant_id}-${index}`}
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={product?.images[0]?.path}
                                                                alt={product.product_name}
                                                                className="h-10 w-10 rounded object-cover"
                                                            />
                                                            <div>
                                                                <div className="font-medium">{product.product_name}</div>
                                                                <div className="text-sm text-gray-500">
                                                                    {product.type === 'single' ? product.product_code : product.variant_code}
                                                                    <br />
                                                                    <div className="flex gap-2">
                                                                        <Badge>{product?.size?.toUpperCase()}</Badge> |
                                                                        <Badge variant="outline">{product?.color?.toUpperCase()}</Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-yellow-500">
                                                        {product.type === 'single'
                                                            ? product.current_stock
                                                            : product.variants.find((v) => v.id === product.variant_id)?.current_stock}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={product.quantity || 1}
                                                            onChange={(e) => updateProductQuantity(index, parseInt(e.target.value))}
                                                            className="w-20"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={product.unit_price}
                                                            onChange={(e) => updateProductPrice(index, parseFloat(e.target.value))}
                                                            className="w-20"
                                                        />
                                                    </TableCell>
                                                    <TableCell>${(product.quantity * (product.unit_price || 0)).toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <Button type="button" variant="destructive" onClick={() => removeProduct(index)}>
                                                            <CircleX />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <div className="text-xl font-bold">Total Amount: ${data.total_amount.toFixed(2)}</div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Processing...' : 'Create Purchase'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
