import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { HelpCircle, Plus, Upload, X } from 'lucide-react';
// TypeScript interfaces

interface Image {
    file: File;
    alt_text: string;
    path?: string;
    [key: string]: string | File | undefined;
}

interface Variant {
    size: string;
    color: string;
    variant_code: string;
    cost_price_usd: string;
    sell_price_usd: string;
    cost_price_khr: string;
    sell_price_khr: string;
    image?: Image | null;
    [key: string]: string | Image | null | undefined;
}

interface FormData {
    product_name: string;
    category_id: string;
    type: 'single' | 'variant';
    product_code: string;
    size: string;
    color: string;
    cost_price_usd: string;
    sell_price_usd: string;
    cost_price_khr: string;
    sell_price_khr: string;
    image?: Image | null;
    variants: Variant[];
    [key: string]: string | Image | Variant[] | 'single' | 'variant' | null | undefined;
}

interface Product {
    data: {
        id: number;
        product_name: string;
        category: {
            id: number;
            name: string;
        };
        type: 'single' | 'variant';
        product_code: string;
        size: string;
        color: string;
        cost_price_usd: string;
        sell_price_usd: string;
        cost_price_khr: string;
        sell_price_khr: string;
        image: Image;
        variants: Variant[];
    };
}

export default function FormProducts({ product }: { product: Product }) {
    const { categories, flash } = usePage<PageProps>().props;
    // Initialize form with useForm
    const form = useForm<FormData>({
        product_name: product?.data?.product_name || '',
        category_id: product?.data?.category?.id ? String(product.data.category.id) : '',
        type: product?.data?.type || 'single',
        product_code: product?.data?.product_code || '',
        size: product?.data?.size || '',
        color: product?.data?.color || '',
        cost_price_usd: product?.data?.cost_price_usd?.toString() || '',
        sell_price_usd: product?.data?.sell_price_usd?.toString() || '',
        cost_price_khr: product?.data?.cost_price_khr?.toString() || '',
        sell_price_khr: product?.data?.sell_price_khr?.toString() || '',
        image: product?.data?.image ?? null,
        variants:
            product?.data?.variants?.map((variant) => ({
                ...variant,
                size: variant.size || '',
                color: variant.color || '',
                variant_code: variant.variant_code || '',
                cost_price_usd: variant.cost_price_usd?.toString() || '',
                sell_price_usd: variant.sell_price_usd?.toString() || '',
                cost_price_khr: variant.cost_price_khr?.toString() || '',
                sell_price_khr: variant.sell_price_khr?.toString() || '',
                image: variant.image ?? null,
            })) || [],
    });

    // Handle flash messages
    // useEffect(() => {
    //     if (flash?.success) {
    //         toast({ title: 'Success', description: flash.success });
    //     }
    //     if (flash?.error) {
    //         toast({ title: 'Error', description: flash.error, variant: 'destructive' });
    //     }
    // }, [flash, toast]);

    // Add a new variant
    const addVariant = () => {
        form.setData('variants', [
            ...form.data.variants,
            {
                size: '',
                color: '',
                variant_code: '',
                cost_price_usd: '',
                sell_price_usd: '',
                cost_price_khr: '',
                sell_price_khr: '',
                image: null,
            },
        ]);
    };

    // Remove a variant
    const removeVariant = (index: number) => {
        form.setData(
            'variants',
            form.data.variants.filter((_, i) => i !== index),
        );
    };

    // Handle variant field changes
    const handleVariantChange = (index: number, field: keyof Variant, value: string) => {
        const newVariants = [...form.data.variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        form.setData('variants', newVariants);
    };

    // Handle variant image changes
    const handleVariantImageChange = (index: number, files: FileList | null) => {
        if (files && files.length > 0) {
            const newVariants = [...form.data.variants];
            newVariants[index].image = { file: files[0], alt_text: '' };
            form.setData('variants', newVariants);
        }
    };

    // Remove variant image
    const removeVariantImage = (variantIndex: number) => {
        const newVariants = [...form.data.variants];
        newVariants[variantIndex].image = null;
        form.setData('variants', newVariants);
    };

    // Handle product image changes
    const handleProductImageChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            form.setData('image', { file: files[0], alt_text: '' });
        }
    };

    // Remove product image
    const removeProductImage = () => {
        form.setData('image', null);
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const hasNewFileUploads = form.data.image?.file instanceof File;

        if (product?.data?.id) {
            form.put(route('products.update', product.data.id), {
                forceFormData: hasNewFileUploads,
                onSuccess: () => {
                    form.reset();
                },
                onError: () => {
                    console.log(form.errors);
                },
            });
        } else {
            form.post(route('products.store'), {
                forceFormData: true,
                onSuccess: () => {
                    form.reset();
                },
            });
        }
    };

    return (
        <AppLayout>
            <div className="container mx-auto space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Create New Product</h2>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="product_name">Product Name</Label>
                                    <Input
                                        name="product_name"
                                        id="product_name"
                                        value={form.data.product_name}
                                        onChange={(e) => form.setData('product_name', e.target.value)}
                                        placeholder="Enter product name"
                                        className="w-full"
                                    />
                                    <InputError message={form.errors.product_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={form.data.category_id} onValueChange={(value) => form.setData('category_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((ele, i) => (
                                                <SelectItem key={i} value={String(ele.category_id)}>
                                                    {ele.category_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={form.errors.category_id} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="product_code">Product Code</Label>
                                    <Input
                                        id="product_code"
                                        value={form.data.product_code}
                                        onChange={(e) => form.setData('product_code', e.target.value)}
                                        placeholder="Enter product code"
                                    />
                                    <InputError message={form.errors.product_code} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label>Product Type</Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <HelpCircle className="text-muted-foreground h-4 w-4" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Choose between a single product or a product with multiple variants</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Select
                                    value={form.data.type}
                                    onValueChange={(value) => {
                                        form.setData('type', value as 'single' | 'variant');
                                        if (value === 'variant') {
                                            form.setData('variants', [
                                                {
                                                    size: '',
                                                    color: '',
                                                    variant_code: '',
                                                    cost_price_usd: '',
                                                    sell_price_usd: '',
                                                    cost_price_khr: '',
                                                    sell_price_khr: '',
                                                    image: null,
                                                },
                                            ]);
                                        } else {
                                            form.setData('variants', []);
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select product type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="single">Single Product</SelectItem>
                                        <SelectItem value="variant">Product with Variants</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Product Images</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex w-full items-center justify-center">
                                    <label className="bg-muted/50 hover:bg-muted flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="text-muted-foreground mb-2 h-6 w-6" />
                                            <p className="text-muted-foreground text-sm">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-muted-foreground text-xs">PNG, JPG or GIF (MAX. 2MB)</p>
                                        </div>
                                        <Input
                                            type="file"
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/jpg,image/gif"
                                            onChange={(e) => handleProductImageChange(e.target.files)}
                                            disabled={form.isDirty && form.processing}
                                        />
                                    </label>
                                </div>

                                {form.data.image && (
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-[100px] w-[100px]">
                                            <div className="h-full w-full overflow-hidden rounded-lg border">
                                                <img
                                                    src={form.data.image.file ? URL.createObjectURL(form.data.image.file) : form.data.image.path}
                                                    alt={form.data.image.alt_text || 'Product image'}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={removeProductImage}
                                                disabled={form.processing}
                                                className="absolute -top-2 -right-2 h-6 w-6"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Input
                                            className="flex-1"
                                            placeholder="Alt text"
                                            value={form.data.image.alt_text}
                                            onChange={(e) => {
                                                const newImage = { ...form.data.image };
                                                newImage.alt_text = e.target.value;
                                                form.setData('image', newImage as Image);
                                            }}
                                        />
                                    </div>
                                )}
                                <InputError message={form.errors['image.file']} />
                            </div>
                        </CardContent>
                    </Card>

                    {form.data.type === 'single' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="size">Size</Label>
                                        <Select value={form.data.size} onValueChange={(value) => form.setData('size', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="FreeSize">Free Size</SelectItem>
                                                <SelectItem value="xs">XS</SelectItem>
                                                <SelectItem value="s">S</SelectItem>
                                                <SelectItem value="m">M</SelectItem>
                                                <SelectItem value="l">L</SelectItem>
                                                <SelectItem value="xl">XL</SelectItem>
                                                <SelectItem value="xxl">2XL</SelectItem>
                                                <SelectItem value="xxxl">3XL</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={form.errors.size} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="color">Color</Label>
                                        <Input
                                            id="color"
                                            type="text"
                                            value={form.data.color}
                                            onChange={(e) => form.setData('color', e.target.value)}
                                            placeholder="Enter color code (e.g., BLK)"
                                        />
                                        <InputError message={form.errors.color} />
                                    </div>
                                </div>

                                <Tabs defaultValue="usd" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="usd">USD</TabsTrigger>
                                        <TabsTrigger value="khr">KHR</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="usd" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="cost_price_usd">Cost Price</Label>
                                                <Input
                                                    id="cost_price_usd"
                                                    type="number"
                                                    step="0.01"
                                                    value={form.data.cost_price_usd}
                                                    onChange={(e) => form.setData('cost_price_usd', e.target.value)}
                                                    placeholder="0.00"
                                                />
                                                <InputError message={form.errors.cost_price_usd} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="sell_price_usd">Sell Price</Label>
                                                <Input
                                                    id="sell_price_usd"
                                                    type="number"
                                                    step="0.01"
                                                    value={form.data.sell_price_usd}
                                                    onChange={(e) => form.setData('sell_price_usd', e.target.value)}
                                                    placeholder="0.00"
                                                />
                                                <InputError message={form.errors.sell_price_usd} />
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="khr" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="cost_price_khr">Cost Price</Label>
                                                <Input
                                                    id="cost_price_khr"
                                                    type="number"
                                                    value={form.data.cost_price_khr}
                                                    onChange={(e) => form.setData('cost_price_khr', e.target.value)}
                                                    placeholder="0"
                                                />
                                                <InputError message={form.errors.cost_price_khr} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="sell_price_khr">Sell Price</Label>
                                                <Input
                                                    id="sell_price_khr"
                                                    type="number"
                                                    value={form.data.sell_price_khr}
                                                    onChange={(e) => form.setData('sell_price_khr', e.target.value)}
                                                    placeholder="0"
                                                />
                                                <InputError message={form.errors.sell_price_khr} />
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    )}

                    {form.data.type === 'variant' && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Product Variants</CardTitle>
                                <Button type="button" onClick={addVariant} variant="outline" size="sm" disabled={form.processing}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Variant
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {form.data.variants.map((variant, index) => (
                                    <Card key={index} className="relative">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <CardTitle className="text-lg">Variant {index + 1}</CardTitle>
                                            {form.data.variants.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeVariant(index)}
                                                    disabled={form.processing}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`variant-size-${index}`}>Size</Label>
                                                    <Select value={variant.size} onValueChange={(value) => handleVariantChange(index, 'size', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select size" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="FreeSize">Free Size</SelectItem>
                                                            <SelectItem value="xs">XS</SelectItem>
                                                            <SelectItem value="s">S</SelectItem>
                                                            <SelectItem value="m">M</SelectItem>
                                                            <SelectItem value="l">L</SelectItem>
                                                            <SelectItem value="xl">XL</SelectItem>
                                                            <SelectItem value="xxl">2XL</SelectItem>
                                                            <SelectItem value="xxxl">3XL</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={form.errors[`variants.${index}.size`]} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`variant-color-${index}`}>Color</Label>
                                                    <Input
                                                        id={`variant-color-${index}`}
                                                        value={variant.color}
                                                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                                        placeholder="Enter color"
                                                    />
                                                    <InputError message={form.errors[`variants.${index}.color`]} />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`variant-variant-code-${index}`}>Variant Code</Label>
                                                <Input
                                                    id={`variant-variant-code-${index}`}
                                                    value={variant.variant_code}
                                                    onChange={(e) => handleVariantChange(index, 'variant_code', e.target.value)}
                                                    placeholder="Enter variant code"
                                                />
                                                <InputError message={form.errors[`variants.${index}.variant_code`]} />
                                            </div>

                                            <div className="space-y-4">
                                                <Label>Variant Images</Label>
                                                <div className="flex w-full items-center justify-center">
                                                    <label className="bg-muted/50 hover:bg-muted flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <Upload className="text-muted-foreground mb-2 h-6 w-6" />
                                                            <p className="text-muted-foreground text-sm">
                                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                                            </p>
                                                        </div>
                                                        <Input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/jpeg,image/png,image/jpg,image/gif"
                                                            onChange={(e) => handleVariantImageChange(index, e.target.files)}
                                                            disabled={form.isDirty && form.processing}
                                                        />
                                                    </label>
                                                </div>

                                                {variant.image && (
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative h-[100px] w-[100px]">
                                                            <div className="h-full w-full overflow-hidden rounded-lg border">
                                                                <img
                                                                    src={
                                                                        variant.image.file
                                                                            ? URL.createObjectURL(variant.image.file)
                                                                            : variant.image.path
                                                                    }
                                                                    alt={variant.image.alt_text || 'Variant image'}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="icon"
                                                                onClick={() => removeVariantImage(index)}
                                                                disabled={form.processing}
                                                                className="absolute -top-2 -right-2 h-6 w-6"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        <Input
                                                            className="flex-1"
                                                            placeholder="Alt text"
                                                            value={variant.image.alt_text}
                                                            onChange={(e) => {
                                                                const newVariants = [...form.data.variants];
                                                                newVariants[index].image = { ...variant.image, alt_text: e.target.value } as Image;
                                                                form.setData('variants', newVariants);
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                <InputError message={form.errors[`variants.${index}.image.file`]} />
                                            </div>

                                            <Tabs defaultValue="usd" className="w-full">
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="usd">USD</TabsTrigger>
                                                    <TabsTrigger value="khr">KHR</TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="usd" className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`variant-cost_price_usd-${index}`}>Cost Price</Label>
                                                            <Input
                                                                id={`variant-cost_price_usd-${index}`}
                                                                type="number"
                                                                step="0.01"
                                                                value={variant.cost_price_usd}
                                                                onChange={(e) => handleVariantChange(index, 'cost_price_usd', e.target.value)}
                                                                placeholder="0.00"
                                                            />
                                                            <InputError message={form.errors[`variants.${index}.cost_price_usd`]} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`variant-sell_price_usd-${index}`}>Sell Price</Label>
                                                            <Input
                                                                id={`variant-sell_price_usd-${index}`}
                                                                type="number"
                                                                step="0.01"
                                                                value={variant.sell_price_usd}
                                                                onChange={(e) => handleVariantChange(index, 'sell_price_usd', e.target.value)}
                                                                placeholder="0.00"
                                                            />
                                                            <InputError message={form.errors[`variants.${index}.sell_price_usd`]} />
                                                        </div>
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="khr" className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`variant-cost_price_khr-${index}`}>Cost Price</Label>
                                                            <Input
                                                                id={`variant-cost_price_khr-${index}`}
                                                                type="number"
                                                                value={variant.cost_price_khr}
                                                                onChange={(e) => handleVariantChange(index, 'cost_price_khr', e.target.value)}
                                                                placeholder="0"
                                                            />
                                                            <InputError message={form.errors[`variants.${index}.cost_price_khr`]} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`variant-sell_price_khr-${index}`}>Sell Price</Label>
                                                            <Input
                                                                id={`variant-sell_price_khr-${index}`}
                                                                type="number"
                                                                value={variant.sell_price_khr}
                                                                onChange={(e) => handleVariantChange(index, 'sell_price_khr', e.target.value)}
                                                                placeholder="0"
                                                            />
                                                            <InputError message={form.errors[`variants.${index}.sell_price_khr`]} />
                                                        </div>
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        </CardContent>
                                    </Card>
                                ))}
                                <InputError message={form.errors.variants} />
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-end">
                        <Button type="submit" size="lg" disabled={form.processing}>
                            {form.processing ? 'Creating...' : 'Create Product'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
