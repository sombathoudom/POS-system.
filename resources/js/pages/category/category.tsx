import { CustTable } from '@/components/CustTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import CategoryForm, { CategoryFormData } from './components/category-form';
interface Category {
    category_id?: number;
    category_name: string;
    [key: string]: string | number | undefined;
}

interface CategoryIndexProps {
    categories: {
        data: Category[];
    };
}

export default function CategoryIndex({ categories }: CategoryIndexProps) {
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

    return (
        <AppLayout>
            <div className="space-y-6 p-4">
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
                    data={categories.data}
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
                    idKey="category_id"
                />
            </div>
        </AppLayout>
    );
}
