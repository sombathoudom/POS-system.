import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
export default function CategoryIndex() {
    return (
        <AppLayout>
            <div className="p-4">
                <Button asChild>
                    <Link href="/category/create">Create</Link>
                </Button>
            </div>
        </AppLayout>
    );
}
