import { Link } from '@inertiajs/react';
import { Store } from 'lucide-react';
import { Breadcrumbs } from './breadcrumbs';
import { Button } from './ui/button';
import { SidebarTrigger } from './ui/sidebar';

export function AppSidebarHeader() {
    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Breadcrumbs />
                </div>
                <Button variant="default" asChild>
                    <Link href={route('pos.index')}>
                        <Store />
                        POS
                    </Link>
                </Button>
            </div>
        </header>
    );
}
