import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Link } from '@inertiajs/react';
import { Fragment } from 'react';

export function Breadcrumbs() {
    const segments = window.location.pathname.split('/').filter((segment) => segment !== '');
    const isDashboard = segments.length === 1 && segments[0] === 'dashboard';
    return (
        <>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <Link href={'/dashboard'}>Dashboard</Link>
                    </BreadcrumbItem>
                    {!isDashboard &&
                        segments.map((item, index) => {
                            const isLast = index === segments.length - 1;
                            const href = `/${segments.slice(0, index + 1).join('/')}`;
                            return (
                                <Fragment key={index}>
                                    <BreadcrumbSeparator className="hidden md:block" />
                                    {isLast ? (
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>{item}</BreadcrumbPage>
                                        </BreadcrumbItem>
                                    ) : (
                                        <BreadcrumbItem className="hidden md:block">
                                            <Link href={href}>{item}</Link>
                                        </BreadcrumbItem>
                                    )}
                                    {/* {!isLast && <BreadcrumbSeparator />} */}
                                </Fragment>
                            );
                        })}
                </BreadcrumbList>
            </Breadcrumb>
        </>
    );
}
