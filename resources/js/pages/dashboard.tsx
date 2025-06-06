import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BarChart2, DollarSign, TrendingUp } from 'lucide-react';

// Define the shape of a product for topProducts
interface Product {
    id: number;
    name: string;
    sales: number;
    revenue: number;
}

interface DashboardProps {
    dailySales: number;
    monthlySales: number;
    yearlySales: number;
    profitOrLoss: number;
    topProducts: Product[];
}

// Utility function to format currency
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(amount);
};

export default function Dashboard({ dailySales, monthlySales, yearlySales, profitOrLoss, topProducts }: DashboardProps) {
    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })}</div>
                </div>

                {/* Sales Metrics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card className="shadow-md transition-shadow hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Profit/Loss</CardTitle>
                            <DollarSign className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-800">{formatCurrency(profitOrLoss)}</div>
                            <p className="mt-1 text-xs text-gray-500">Profit/Loss for {new Date().toLocaleDateString()}</p>
                        </CardContent>
                    </Card>
                    {/* Daily Sales Card */}
                    <Card className="shadow-md transition-shadow hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Daily Sales</CardTitle>
                            <DollarSign className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-800">{formatCurrency(dailySales)}</div>
                            <p className="mt-1 text-xs text-gray-500">Sales for {new Date().toLocaleDateString()}</p>
                        </CardContent>
                    </Card>

                    {/* Monthly Sales Card */}
                    <Card className="shadow-md transition-shadow hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Monthly Sales</CardTitle>
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-800">{formatCurrency(monthlySales)}</div>
                            <p className="mt-1 text-xs text-gray-500">
                                Sales for {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Yearly Sales Card */}
                    <Card className="shadow-md transition-shadow hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Yearly Sales</CardTitle>
                            <BarChart2 className="h-5 w-5 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-800">{formatCurrency(yearlySales)}</div>
                            <p className="mt-1 text-xs text-gray-500">Sales for {new Date().getFullYear()}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Products Table */}
                <div className="mt-8">
                    <h2 className="mb-4 text-xl font-semibold text-gray-800">Top Selling Products</h2>
                    <Card className="m-0 p-0 shadow">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-left">Product Name</TableHead>
                                        <TableHead className="text-right">Units Sold</TableHead>
                                        <TableHead className="text-right">Revenue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topProducts.length > 0 ? (
                                        topProducts.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                <TableCell className="text-right">{product.sales}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-gray-500">
                                                No top products available.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
