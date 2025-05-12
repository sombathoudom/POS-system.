import { Link } from '@inertiajs/react';
import Heading from './heading';
import { Button } from './ui/button';

interface Props {
    icon: React.ReactNode;
    href: string;
    title: string;
    buttonText: string;
}

export default function ButtonLink({ icon, href, title, buttonText }: Props) {
    return (
        <>
            <Heading title={title} />
            <Button asChild>
                <Link href={route(href)} className="flex items-center gap-2">
                    {icon}
                    <span>{buttonText}</span>
                </Link>
            </Button>
        </>
    );
}
