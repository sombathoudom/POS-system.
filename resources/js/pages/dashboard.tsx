import { CalendarDatePicker } from '@/components/calendar-date-picker';
import DashboardCard from '@/components/dashboard-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { BarChart2, DollarSign, SearchIcon, ShoppingCart, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { MonthlySaleChart } from '@/components/charts/monthly-sale-chart';
// Define the shape of a product for topProducts
export interface MonthlySaleChart {
    month: string;
    // total_amount: number;
    count: number;
}
interface DashboardProps {
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
                    <DashboardCard title="Total Orders" value={totalOrders} icon={<ShoppingCart className="h-5 w-5 text-green-500" />} description={`Total Orders for ${new Date().toLocaleDateString()}`} />
                    {/* Daily Sales Card */}
                    <DashboardCard title="Revenue" value={revenue} icon={<DollarSign className="h-5 w-5 text-green-500" />} description={`Revenue for ${new Date().toLocaleDateString()}`} />

                    <DashboardCard title="Daily Sales" value={dailySales} icon={<DollarSign className="h-5 w-5 text-green-500" />} description={`Sales for ${new Date().toLocaleDateString()}`} />

                    {/* Monthly Sales Card */}
                    <DashboardCard title="Monthly Sales" value={monthlySales} icon={<DollarSign className="h-5 w-5 text-green-500" />} description={`Sales for ${new Date().toLocaleDateString()}`} />

                    {/* Yearly Sales Card */}
                    <DashboardCard title="Yearly Sales" value={yearlySales} icon={<BarChart2 className="h-5 w-5 text-purple-500" />} description={`Sales for ${new Date().getFullYear()}`} />
                    <DashboardCard title="Unpaid Sales" value={Number(unpaidSales.total_amount || 0)} icon={<DollarSign className="h-5 w-5 text-red-500" />} description={`Unpaid sales for ${new Date().toLocaleDateString()}`} />
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <MonthlySaleChart data={monthlySaleChart} />
                </div>
            </div>
        </AppLayout>
    );
}
