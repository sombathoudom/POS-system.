import ButtonLink from '@/components/button-link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Link, Pencil, PlusIcon, Trash2 } from 'lucide-react';

// TypeScript interfaces
interface Product {
    id: number;
    product_name: string;
    category: {
        id: number;
        name: string;
    };

    type: 'single' | 'variant';
    barcode: string | null;
    cost_price_usd: number | null;
    sell_price_usd: number | null;
    cost_price_khr: number | null;
    sell_price_khr: number | null;
    variant_count: number;
    thumbnail: string | null;
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    // Add other pagination fields if needed
    per_page: number;
    total: number;
}

export default function Products({ products }: { products: PaginatedProducts }) {
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
                                <TableHead>Barcode</TableHead>
                                <TableHead>Pricing (USD)</TableHead>
                                <TableHead>Pricing (KHR)</TableHead>
                                <TableHead>Variants</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.map((product) => (
                                // Update the mapping to use products.data instead of products directly
                                <TableRow key={product.id}>
                                    <TableCell>
                                        {product.thumbnail ? (
                                            <img src={product.thumbnail} alt={product.product_name} className="h-12 w-12 rounded object-cover" />
                                        ) : (
                                            <span className="text-gray-500">No image</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{product.product_name}</TableCell>
                                    <TableCell>{product.category.name}</TableCell>
                                    <TableCell>{product.type === 'single' ? 'Single' : 'Variant'}</TableCell>
                                    <TableCell>{product.barcode || 'N/A'}</TableCell>
                                    <TableCell>
                                        {product.type === 'single' && product.cost_price_usd && product.sell_price_usd
                                            ? `$${product.cost_price_usd.toFixed(2)} / $${product.sell_price_usd.toFixed(2)}`
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {product.type === 'single' && product.cost_price_khr && product.sell_price_khr
                                            ? `${product.cost_price_khr.toLocaleString()} / ${product.sell_price_khr.toLocaleString()}`
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {/* {product.type === 'variant' ? (
                                            <Link href={route('products.variants', product.id)} className="text-blue-600 hover:underline">
                                                {product.variant_count} variant{product.variant_count !== 1 ? 's' : ''}
                                            </Link>
                                        ) : (
                                            'N/A'
                                        )} */}
                                    </TableCell>
                                    <TableCell className="space-x-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={route('products.edit', product.id)}>
                                                <Pencil className="mr-1 h-4 w-4" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this product?')) {
                                                    // Add delete logic here
                                                }
                                            }}
                                        >
                                            <Trash2 className="mr-1 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                {/* <Pagination
                    currentPage={1}
                    lastPage={products.last_page}
                    onPageChange={(page) => router.get(route('products.index'), { page }, { preserveScroll: true })}
                /> */}
            </div>
        </AppLayout>
    );
}
