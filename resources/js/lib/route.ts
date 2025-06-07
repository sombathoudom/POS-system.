import { type NavItem } from '@/types';
import { Container, CreditCard, DatabaseZap, LayoutGrid, PackageOpen, PackagePlus, Shapes, ShoppingCart } from 'lucide-react';
const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Categories',
        href: '/category',
        icon: Shapes,
    },
    {
        title: 'Suppliers',
        href: '/suppliers',
        icon: Container,
    },
    {
        title: 'Products',
        href: '/products',
        icon: PackageOpen,
    },
    {
        title: 'Purchase Order',
        href: '/purchase-order',
        icon: PackagePlus,
    },
    {
        title: 'POS',
        href: '/pos',
        icon: ShoppingCart,
    },
    {
        title: 'Sale Transaction',
        href: '/sale-transaction',
        icon: CreditCard,
    },
    {
        title: 'Expense',
        href: '/expsense',
        icon: DatabaseZap,
    },
];

export { mainNavItems };
