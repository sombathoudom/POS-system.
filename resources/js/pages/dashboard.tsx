import { CalendarDatePicker } from '@/components/calendar-date-picker';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { BarChart2, DollarSign, SearchIcon, ShoppingCart, TrendingUp } from 'lucide-react';
import { lazy, useState } from 'react';


// Define the shape of a product for topProducts
export interface MonthlySaleChart {
    month: string;
    // total_amount: number;
    count: number;
}
export interface DashboardProps {
    dailySales: number;
    monthlySales: number;
    yearlySales: number;
    totalOrders: number;
    unpaidSales: {
        total_amount: string | null;
        count: number | null;
    };
    revenue: number;
    monthlySaleChart: MonthlySaleChart[];
}

// Utility function to format currency
const DashboardStats = lazy(() => import('@/components/charts/dashboard-stats'));
const MonthlySaleChart = lazy(() => import('@/components/charts/monthly-sale-chart').then(module => ({ default: module.MonthlySaleChart })));
export default function Dashboard({
    dailySales,
    monthlySales,
    yearlySales,
    totalOrders,
    unpaidSales,
    revenue,
    monthlySaleChart,
}: DashboardProps) {

    const [selectedDateRange, setSelectedDateRange] = useState({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
    });

    const handleSearch = () => {
        router.get(route('dashboard.index'), { date: selectedDateRange }, { preserveScroll: true });
    };
    return (
        <AppLayout>
            <Head title="Dashboard"  />
            <div className="flex justify-center gap-2 p-4">
                <CalendarDatePicker date={selectedDateRange} onDateSelect={setSelectedDateRange} />
                <Button variant="outline" onClick={handleSearch}>
                    <SearchIcon className="h-4 w-4" />
                    Search
                </Button>
            </div>
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <div className="text-sm text-foreground">Last updated: {new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })}</div>
                </div>

                {/* Sales Metrics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <DashboardStats
                        totalOrders={totalOrders}
                        revenue={revenue}
                        dailySales={dailySales}
                        monthlySales={monthlySales}
                        yearlySales={yearlySales}
                        unpaidSales={unpaidSales}
                        monthlySaleChart={monthlySaleChart}
                    />
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <MonthlySaleChart data={monthlySaleChart} />
                </div>
            </div>
        </AppLayout>
    );
}
