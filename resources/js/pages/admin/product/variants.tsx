import DeleteDialog from '@/components/delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Variant {
    id: number;
    size: string;
    color: string;
    variant_code: string;
    cost_price_usd: number;
    sell_price_usd: number;
    cost_price_khr: number;
    sell_price_khr: number;
    images: {
        id: number;
        path: string;
        alt_text: string;
    }[];
}

interface Product {
    data: {
        id: number;
        product_name: string;
        category: {
            id: number;
            name: string;
        };
        variants: Variant[];
    };
}

export default function Variants({ product }: { product: Product }) {
    const handleDelete = (variantId: number) => {
        router.delete(route('products.destroyVariant', variantId), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {},
        });
    };
    return (
        <AppLayout>
            <div className="container mx-auto space-y-6 p-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Link href={route('products.index')}>
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h2 className="text-3xl font-bold tracking-tight">{product.data?.product_name}</h2>
                        </div>
                        <p className="text-muted-foreground">
                            Category: <Badge variant="outline">{product.data?.category?.name}</Badge>
                        </p>
                    </div>
                    <Link href={route('products.edit', product.data?.id)}>
                        <Button>Edit Product</Button>
                    </Link>
                </div>

                {/* Variants Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product Variants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {product.data?.variants.length === 0 ? (
                            <p className="text-muted-foreground text-center">No variants found for this product.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Thumbnail</TableHead>
                                        <TableHead>Variant Code</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Color</TableHead>
                                        <TableHead>Pricing (USD)</TableHead>
                                        <TableHead>Pricing (KHR)</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {product.data?.variants.map((variant) => (
                                        <TableRow key={variant.id}>
                                            <TableCell>
                                                {variant.images && variant.images.length > 0 ? (
                                                    <div className="flex -space-x-2">
                                                        {variant.images.slice(0, 3).map((image) => (
                                                            <img
                                                                key={image.id}
                                                                src={image.path}
                                                                alt={image.alt_text || variant.variant_code}
                                                                className="border-background h-12 w-12 rounded-full border-2 object-cover"
                                                            />
                                                        ))}
                                                        {variant.images.length > 3 && (
                                                            <div className="border-background bg-muted flex h-12 w-12 items-center justify-center rounded-full border-2 text-xs font-medium">
                                                                +{variant.images.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">No images</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{variant.variant_code}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{variant.size}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{variant.color}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="text-sm">Cost: {formatCurrency(variant.cost_price_usd)}</p>
                                                    <p className="text-sm">Sell: {formatCurrency(variant.sell_price_usd)}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="text-sm">Cost: {variant.cost_price_khr.toLocaleString()}</p>
                                                    <p className="text-sm">Sell: {variant.sell_price_khr.toLocaleString()}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <DeleteDialog onDelete={() => handleDelete(variant.id)} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
