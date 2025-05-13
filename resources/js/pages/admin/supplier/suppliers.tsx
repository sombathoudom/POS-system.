import ButtonLink from '@/components/button-link';
import { CustTable } from '@/components/cust-table';
import { Input } from '@/components/ui/input';
import useDebounce from '@/hooks/useDebounce';
import AppLayout from '@/layouts/app-layout';
import { PageProps, PaginatedResponse } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';
import { useDeferredValue, useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface Supplier {
    supplier_id: number;
    supplier_name: string;
    contact_info: string;
}

export default function suppliers({ suppliers }: { suppliers: PaginatedResponse<Supplier> }) {
    const { flash } = usePage<PageProps>().props;
    const [search, setSearch] = useState('');
    const deferredQuery = useDeferredValue(search);
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);

    // Handle search input changes
    const debouncedSearch = useDebounce({ value: search, delay: 500 });
    const handleSearch = (value: string) => {
        setSearch(value);
        console.log(debouncedSearch);
    };

    const handleEdit = (supplier: Supplier) => {
        router.visit(route('suppliers.edit', supplier.supplier_id), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (supplier: Supplier) => {
        return {
            url: 'suppliers.destroy',
            id: supplier.supplier_id ?? '',
        };
    };

    const handlePageChange = (page: number) => {
        router.visit(route('suppliers.index'), {
            data: { page },
            preserveState: true,
            preserveScroll: true,
            only: ['suppliers'],
        });
    };

    return (
        <AppLayout>
            <div className="space-y-6 p-4">
                <ButtonLink icon={<PlusIcon />} href="suppliers.create" title="Suppliers" buttonText="Add Supplier" />
                <Input type="text" name="search" placeholder="Search" value={search} onChange={(e) => handleSearch(e.target.value)} />
                <CustTable
                    columns={[
                        {
                            key: 'supplier_id',
                            header: 'ID',
                        },
                        {
                            key: 'supplier_name',
                            header: 'Supplier Name',
                        },
                        {
                            key: 'contact_info',
                            header: 'Contact Info',
                        },
                    ]}
                    data={suppliers}
                    idKey="supplier_id"
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPageChange={handlePageChange}
                />
            </div>
        </AppLayout>
    );
}
