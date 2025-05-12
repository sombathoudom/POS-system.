import { CustTable } from '@/components/cust-table';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { PageProps, PaginatedResponse } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import CategoryForm, { CategoryFormData } from './components/category-form';
interface Category {
    category_id?: number;
    category_name: string;
    [key: string]: string | number | undefined;
}

export default function CategoryIndex({ categories }: { categories: PaginatedResponse<Category> }) {
    const { flash } = usePage<PageProps>().props;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { data, setData, post, put, errors, processing } = useForm<CategoryFormData>({
        category_id: undefined,
        category_name: '',
    });

    const resetForm = () => {
        setData({
            category_id: undefined,
            category_name: '',
        });
    };

    const openCreateDialog = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (data.category_id) {
            put(route('category.update', data.category_id), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    resetForm();
                },
            });
        } else {
            post(route('category.store'), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    resetForm();
                },
            });
        }
    };

    const handleEdit = (category: Category) => {
        setData({
            category_id: category.category_id,
            category_name: category.category_name,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (category: Category) => {
        return {
            url: 'category.destroy',
            id: category.category_id ?? '',
        };
    };

    const handlePageChange = (page: number) => {
        router.visit(route('category.index'), {
            data: { page },
            preserveState: true,
            preserveScroll: true,
            only: ['categories'],
        });
    };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash?.success);
        }
    }, [flash.success]);

    return (
        <AppLayout>
            <div className="space-y-6 p-4">
                <Heading title="Categories" />
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Create Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{data.category_id ? 'Edit Category' : 'Create Category'}</DialogTitle>
                        </DialogHeader>
                        <CategoryForm
                            formData={data}
                            setFormData={(key, value) => setData(key, value)}
                            onSubmit={handleSubmit}
                            isEditing={!!data.category_id}
                            errors={errors}
                            isProcessing={processing}
                        />
                    </DialogContent>
                </Dialog>
                <CustTable
                    data={categories}
                    columns={[
                        {
                            key: 'category_id',
                            header: 'ID',
                        },
                        {
                            key: 'category_name',
                            header: 'Name',
                        },
                    ]}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    idKey="category_id"
                    onPageChange={handlePageChange}
                />
            </div>
        </AppLayout>
    );
}
