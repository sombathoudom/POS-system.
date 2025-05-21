import { Head, Link } from '@inertiajs/react';
import Heading from './heading';
import { Button } from './ui/button';

interface Props {
    icon: React.ReactNode;
    href: string;
    title?: string;
    buttonText: string;
    params?: any;
}

export default function ButtonLink({ icon, href, title, buttonText, params }: Props) {
    return (
        <div className="flex max-w-fit flex-col">
            {title && <Head title={title} />}
            {title && <Heading title={title} />}
            <Button asChild>
                <Link href={route(href, params)} className="flex items-center gap-2">
                    {icon}
                    <span>{buttonText}</span>
                </Link>
            </Button>
        </div>
    );
}
