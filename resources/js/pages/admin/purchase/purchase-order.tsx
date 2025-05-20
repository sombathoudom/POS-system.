import ButtonLink from '@/components/button-link';
import AppLayout from '@/layouts/app-layout';
import { PlusIcon } from 'lucide-react';
export default function PurchaseOrder() {
    return (
        <AppLayout>
            <div className="space-y-6 p-4">
                <ButtonLink icon={<PlusIcon />} href={'purchase.create'} title="Purchase" buttonText="Add Purchase" />
            </div>
        </AppLayout>
    );
}
