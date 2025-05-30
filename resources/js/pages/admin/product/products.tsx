import ButtonLink from '@/components/button-link';
import DeleteDialog from '@/components/delete-dialog';
import CustPagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Pencil, PlusIcon, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
// TypeScript interfaces
interface Product {
    id: number;
    product_name: string;
    category: {
        id: number;
        name: string;
    };
    type: 'single' | 'variant';
    product_code: string;
    cost_price_usd: number | null;
    sell_price_usd: number | null;
    current_stock: number;
    variant_count: number;
    images: {
        id: number;
        path: string;
        alt_text: string;
        order: number;
    }[];
    variants: {
        current_stock: number;
    }[];
}

interface PaginatedProducts {
    data: Product[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function Products({ products }: { products: PaginatedProducts }) {
    const { flash } = usePage<PageProps>().props;
    const handleDelete = (productId: number) => {
        router.delete(route('products.destroy', productId), { preserveScroll: true });
    };
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash?.success);
        }
    }, [flash.success]);
    return (
        <AppLayout>
            <div className="space-y-6 p-4">
                <ButtonLink icon={<PlusIcon />} href={'products.create'} title="Product" buttonText="Add Products" />

                {products.data.length === 0 ? (
                    <p className="text-gray-500">No products found.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Thumbnail</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>ProductCode</TableHead>
                                <TableHead>Pricing (USD)</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Variants</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.map((product) => (
                                // Update the mapping to use products.data instead of products directly
                                <TableRow key={product.id}>
                                    <TableCell>
                                        {product.images && product.images.length > 0 ? (
                                            <div className="flex -space-x-2">
                                                {product.images.slice(0, 3).map((image) => (
                                                    <img
                                                        key={image.id}
                                                        src={image.path}
                                                        alt={image.alt_text || product.product_name}
                                                        className="border-background h-12 w-12 rounded-full border-2 object-cover"
                                                    />
                                                ))}
                                                {product.images.length > 3 && (
                                                    <div className="border-background bg-muted flex h-12 w-12 items-center justify-center rounded-full border-2 text-xs font-medium">
                                                        +{product.images.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">No images</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{product.product_name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{product.category.name}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge>{product.type === 'single' ? 'Single' : 'Variant'}</Badge>
                                    </TableCell>
                                    <TableCell>{product.product_code || 'N/A'}</TableCell>
                                    <TableCell>
                                        {product.type === 'single' && product.cost_price_usd && product.sell_price_usd
                                            ? `$${product.cost_price_usd.toFixed(2)} / $${product.sell_price_usd.toFixed(2)}`
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {product.type === 'single'
                                            ? product.current_stock
                                            : product.variants.reduce((acc, variant) => acc + variant.current_stock, 0)}
                                    </TableCell>
                                    <TableCell>
                                        {product.type === 'variant' ? (
                                            <Link href={route('products.variants', product.id)} className="text-blue-600 hover:underline">
                                                {product.variant_count} variant{product.variant_count !== 1 ? 's' : ''}
                                            </Link>
                                        ) : (
                                            'N/A'
                                        )}
                                    </TableCell>
                                    <TableCell className="space-x-2">
                                        <Button variant={'outline'} asChild>
                                            <Link href={route('products.edit', product.id)}>
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                        </Button>

                                        <DeleteDialog onDelete={() => handleDelete(product.id)}>
                                            <Button variant="destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </DeleteDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                <CustPagination
                    currentPage={products.meta.current_page}
                    lastPage={products.meta.last_page}
                    onPageChange={(page) => router.get(route('products.index'), { page }, { preserveScroll: true })}
                />
            </div>
        </AppLayout>
    );
}
