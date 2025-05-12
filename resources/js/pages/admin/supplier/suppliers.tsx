import ButtonLink from '@/components/button-link';
import AppLayout from '@/layouts/app-layout';
import { PlusIcon } from 'lucide-react';

export default function suppliers() {
    return (
        <AppLayout>
            <div className="space-y-6 p-4">
                <ButtonLink icon={<PlusIcon />} href="supplier.create" title="Suppliers" buttonText="Add Supplier" />
            </div>
        </AppLayout>
    );
}
