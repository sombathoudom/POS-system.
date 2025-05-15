import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { useState } from 'react';
// TypeScript interfaces

interface Image {
    file: File;
    alt_text: string;
    [key: string]: string | File; // Add index signature
}

interface Variant {
    size: string;
    color: string;
    barcode: string;
    cost_price_usd: string;
    sell_price_usd: string;
    cost_price_khr: string;
    sell_price_khr: string;
    images: Image[];
    [key: string]: string | Image[]; // Add index signature
}

interface FormData {
    product_name: string;
    category_id: string;
    type: 'single' | 'variant';
    barcode: string;
    cost_price_usd: string;
    sell_price_usd: string;
    cost_price_khr: string;
    sell_price_khr: string;
    images: Image[];
    variants: Variant[];
    [key: string]: string | Image[] | Variant[] | 'single' | 'variant';
}

export default function FormProducts() {
    const { categories, flash } = usePage<PageProps>().props;
    const [categoryOpen, setCategoryOpen] = useState(false);

    // Initialize form with useForm
    const form = useForm<FormData>({
        product_name: '',
        category_id: '',
        type: 'single',
        barcode: '',
        cost_price_usd: '',
        sell_price_usd: '',
        cost_price_khr: '',
        sell_price_khr: '',
        images: [],
        variants: [], // Initialize with empty array instead of array with empty variant
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
                barcode: '',
                cost_price_usd: '',
                sell_price_usd: '',
                cost_price_khr: '',
                sell_price_khr: '',
                images: [],
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
        if (files) {
            const newImages = Array.from(files).map((file) => ({ file, alt_text: '' }));
            const newVariants = [...form.data.variants];
            newVariants[index].images = [...newVariants[index].images, ...newImages];
            form.setData('variants', newVariants);
        }
    };

    // Remove variant image
    const removeVariantImage = (variantIndex: number, imageIndex: number) => {
        const newVariants = [...form.data.variants];
        newVariants[variantIndex].images = newVariants[variantIndex].images.filter((_, i) => i !== imageIndex);
        form.setData('variants', newVariants);
    };

    // Handle product image changes
    const handleProductImageChange = (files: FileList | null) => {
        if (files) {
            const newImages = Array.from(files).map((file) => ({ file, alt_text: '' }));
            form.setData('images', [...form.data.images, ...newImages]);
        }
    };

    // Remove product image
    const removeProductImage = (index: number) => {
        form.setData(
            'images',
            form.data.images.filter((_, i) => i !== index),
        );
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('product_name', form.data.product_name || '');
        formData.append('category_id', form.data.category_id || '');
        formData.append('type', form.data.type);

        if (form.data.type === 'single') {
            formData.append('barcode', form.data.barcode || '');
            formData.append('cost_price_usd', form.data.cost_price_usd || '');
            formData.append('sell_price_usd', form.data.sell_price_usd || '');
            formData.append('cost_price_khr', form.data.cost_price_khr || '');
            formData.append('sell_price_khr', form.data.sell_price_khr || '');
        }

        // Append product images
        form.data.images.forEach((image, index) => {
            formData.append(`images[${index}][file]`, image.file);
            if (image.alt_text) formData.append(`images[${index}][alt_text]`, image.alt_text);
        });

        // Append variants for variant products
        if (form.data.type === 'variant') {
            form.data.variants.forEach((variant, index) => {
                formData.append(`variants[${index}][size]`, variant.size || '');
                formData.append(`variants[${index}][color]`, variant.color || '');
                formData.append(`variants[${index}][barcode]`, variant.barcode || '');
                formData.append(`variants[${index}][cost_price_usd]`, variant.cost_price_usd || '0');
                formData.append(`variants[${index}][sell_price_usd]`, variant.sell_price_usd || '0');
                formData.append(`variants[${index}][cost_price_khr]`, variant.cost_price_khr || '0');
                formData.append(`variants[${index}][sell_price_khr]`, variant.sell_price_khr || '0');
                variant.images.forEach((image, imgIndex) => {
                    formData.append(`variants[${index}][images][${imgIndex}][file]`, image.file);
                    if (image.alt_text) formData.append(`variants[${index}][images][${imgIndex}][alt_text]`, image.alt_text);
                });
            });
        }
        console.log(form);
        form.post(route('products.store'), {
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                form.setData('variants', [
                    {
                        size: '',
                        color: '',
                        barcode: '',
                        cost_price_usd: '',
                        sell_price_usd: '',
                        cost_price_khr: '',
                        sell_price_khr: '',
                        images: [],
                    },
                ]);
            },
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <div className="space-y-6 p-4">
                <h2 className="text-2xl font-bold">Create New Product</h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="product_name">Product Name</Label>
                        <Input
                            id="product_name"
                            value={form.data.product_name}
                            onChange={(e) => form.setData('product_name', e.target.value)}
                            placeholder="Enter product name"
                        />
                        {form.errors.product_name && <p className="text-sm text-red-500">{form.errors.product_name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={categoryOpen}
                                    className="w-full justify-between"
                                    disabled={categories.length === 0}
                                >
                                    {form.data.category_id
                                        ? categories.find((category) => String(category.category_id) === form.data.category_id)?.category_name
                                        : 'Select category...'}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search category..." />
                                    <CommandEmpty>No category found.</CommandEmpty>
                                    <CommandGroup>
                                        {categories.map((category) => (
                                            <CommandItem
                                                key={category.category_id}
                                                value={String(category.category_id)}
                                                onSelect={(value) => {
                                                    form.setData('category_id', value);
                                                    setCategoryOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        'mr-2 h-4 w-4',
                                                        form.data.category_id === String(category.category_id) ? 'opacity-100' : 'opacity-0',
                                                    )}
                                                />
                                                {category.category_name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {form.errors.category_id && <p className="text-sm text-red-500">{form.errors.category_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Product Type</Label>
                        <Select
                            value={form.data.type}
                            onValueChange={(value) => {
                                form.setData('type', value as 'single' | 'variant');
                                if (value === 'variant') {
                                    form.setData('variants', [
                                        {
                                            size: '',
                                            color: '',
                                            barcode: '',
                                            cost_price_usd: '',
                                            sell_price_usd: '',
                                            cost_price_khr: '',
                                            sell_price_khr: '',
                                            images: [],
                                        },
                                    ]);
                                } else {
                                    form.setData('variants', []); // Clear variants when switching to single
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

                    <div className="space-y-2">
                        <Label>Product Images</Label>
                        <Input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/gif"
                            multiple
                            onChange={(e) => handleProductImageChange(e.target.files)}
                            disabled={form.isDirty && form.processing}
                        />
                        <div className="mt-2 space-y-2">
                            {form.data.images.map((image, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <span>{image.file.name}</span>
                                    <Input
                                        placeholder="Alt text"
                                        value={image.alt_text}
                                        onChange={(e) => {
                                            const newImages = [...form.data.images];
                                            newImages[index].alt_text = e.target.value;
                                            form.setData('images', newImages);
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeProductImage(index)}
                                        disabled={form.processing}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        {form.errors['images.0.file'] && <p className="text-sm text-red-500">At least one product image is required</p>}
                    </div>

                    {form.data.type === 'single' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="barcode">Barcode</Label>
                                <Input
                                    id="barcode"
                                    value={form.data.barcode}
                                    onChange={(e) => form.setData('barcode', e.target.value)}
                                    placeholder="Enter barcode"
                                />
                                {form.errors.barcode && <p className="text-sm text-red-500">{form.errors.barcode}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cost_price_usd">Cost Price (USD)</Label>
                                    <Input
                                        id="cost_price_usd"
                                        type="number"
                                        step="0.01"
                                        value={form.data.cost_price_usd}
                                        onChange={(e) => form.setData('cost_price_usd', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {form.errors.cost_price_usd && <p className="text-sm text-red-500">{form.errors.cost_price_usd}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sell_price_usd">Sell Price (USD)</Label>
                                    <Input
                                        id="sell_price_usd"
                                        type="number"
                                        step="0.01"
                                        value={form.data.sell_price_usd}
                                        onChange={(e) => form.setData('sell_price_usd', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {form.errors.sell_price_usd && <p className="text-sm text-red-500">{form.errors.sell_price_usd}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cost_price_khr">Cost Price (KHR)</Label>
                                    <Input
                                        id="cost_price_khr"
                                        type="number"
                                        value={form.data.cost_price_khr}
                                        onChange={(e) => form.setData('cost_price_khr', e.target.value)}
                                        placeholder="0"
                                    />
                                    {form.errors.cost_price_khr && <p className="text-sm text-red-500">{form.errors.cost_price_khr}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sell_price_khr">Sell Price (KHR)</Label>
                                    <Input
                                        id="sell_price_khr"
                                        type="number"
                                        value={form.data.sell_price_khr}
                                        onChange={(e) => form.setData('sell_price_khr', e.target.value)}
                                        placeholder="0"
                                    />
                                    {form.errors.sell_price_khr && <p className="text-sm text-red-500">{form.errors.sell_price_khr}</p>}
                                </div>
                            </div>
                        </>
                    )}

                    {form.data.type === 'variant' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Product Variants</h3>
                                <Button type="button" onClick={addVariant} variant="outline" size="sm" disabled={form.processing}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Variant
                                </Button>
                            </div>

                            {form.data.variants.map((variant, index) => (
                                <div key={index} className="space-y-4 rounded-lg border p-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">Variant {index + 1}</h4>
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
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`variant-size-${index}`}>Size</Label>
                                            <Input
                                                id={`variant-size-${index}`}
                                                value={variant.size}
                                                onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                                placeholder="Enter size"
                                            />
                                            {form.errors[`variants.${index}.size`] && (
                                                <p className="text-sm text-red-500">{form.errors[`variants.${index}.size`]}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`variant-color-${index}`}>Color</Label>
                                            <Input
                                                id={`variant-color-${index}`}
                                                value={variant.color}
                                                onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                                placeholder="Enter color"
                                            />
                                            {form.errors[`variants.${index}.color`] && (
                                                <p className="text-sm text-red-500">{form.errors[`variants.${index}.color`]}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`variant-barcode-${index}`}>Barcode</Label>
                                        <Input
                                            id={`variant-barcode-${index}`}
                                            value={variant.barcode}
                                            onChange={(e) => handleVariantChange(index, 'barcode', e.target.value)}
                                            placeholder="Enter barcode"
                                        />
                                        {form.errors[`variants.${index}.barcode`] && (
                                            <p className="text-sm text-red-500">{form.errors[`variants.${index}.barcode`]}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Variant Images</Label>
                                        <Input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,image/gif"
                                            multiple
                                            onChange={(e) => handleVariantImageChange(index, e.target.files)}
                                            disabled={form.isDirty && form.processing}
                                        />
                                        <div className="mt-2 space-y-2">
                                            {variant.images.map((image, imgIndex) => (
                                                <div key={imgIndex} className="flex items-center space-x-2">
                                                    <span>{image.file.name}</span>
                                                    <Input
                                                        placeholder="Alt text"
                                                        value={image.alt_text}
                                                        onChange={(e) => {
                                                            const newVariants = [...form.data.variants];
                                                            newVariants[index].images[imgIndex].alt_text = e.target.value;
                                                            form.setData('variants', newVariants);
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeVariantImage(index, imgIndex)}
                                                        disabled={form.processing}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        {form.errors[`variants.${index}.images.0.file`] && (
                                            <p className="text-sm text-red-500">Variant image error</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`variant-cost_price_usd-${index}`}>Cost Price (USD)</Label>
                                            <Input
                                                id={`variant-cost_price_usd-${index}`}
                                                type="number"
                                                step="0.01"
                                                value={variant.cost_price_usd}
                                                onChange={(e) => handleVariantChange(index, 'cost_price_usd', e.target.value)}
                                                placeholder="0.00"
                                            />
                                            {form.errors[`variants.${index}.cost_price_usd`] && (
                                                <p className="text-sm text-red-500">{form.errors[`variants.${index}.cost_price_usd`]}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`variant-sell_price_usd-${index}`}>Sell Price (USD)</Label>
                                            <Input
                                                id={`variant-sell_price_usd-${index}`}
                                                type="number"
                                                step="0.01"
                                                value={variant.sell_price_usd}
                                                onChange={(e) => handleVariantChange(index, 'sell_price_usd', e.target.value)}
                                                placeholder="0.00"
                                            />
                                            {form.errors[`variants.${index}.sell_price_usd`] && (
                                                <p className="text-sm text-red-500">{form.errors[`variants.${index}.sell_price_usd`]}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`variant-cost_price_khr-${index}`}>Cost Price (KHR)</Label>
                                            <Input
                                                id={`variant-cost_price_khr-${index}`}
                                                type="number"
                                                value={variant.cost_price_khr}
                                                onChange={(e) => handleVariantChange(index, 'cost_price_khr', e.target.value)}
                                                placeholder="0"
                                            />
                                            {form.errors[`variants.${index}.cost_price_khr`] && (
                                                <p className="text-sm text-red-500">{form.errors[`variants.${index}.cost_price_khr`]}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`variant-sell_price_khr-${index}`}>Sell Price (KHR)</Label>
                                            <Input
                                                id={`variant-sell_price_khr-${index}`}
                                                type="number"
                                                value={variant.sell_price_khr}
                                                onChange={(e) => handleVariantChange(index, 'sell_price_khr', e.target.value)}
                                                placeholder="0"
                                            />
                                            {form.errors[`variants.${index}.sell_price_khr`] && (
                                                <p className="text-sm text-red-500">{form.errors[`variants.${index}.sell_price_khr`]}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {form.errors.variants && <p className="text-sm text-red-500">{form.errors.variants}</p>}
                        </div>
                    )}

                    <div className="pt-4">
                        <Button type="submit" className="w-full" disabled={form.processing}>
                            {form.processing ? 'Creating...' : 'Create Product'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
