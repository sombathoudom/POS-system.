import { BarChart2, DollarSign, ShoppingCart } from "lucide-react"
import DashboardCard from "../dashboard-card"
import { type DashboardProps } from "@/pages/dashboard"
export default function DashboardStats({
    totalOrders,
    revenue,
    dailySales,
    monthlySales,
    yearlySales,
    unpaidSales,
}: DashboardProps) {
    return (
        <>
        <DashboardCard title="Total Orders" value={totalOrders} icon={<ShoppingCart className="h-5 w-5 text-green-500" />} description={`Total Orders for ${new Date().toLocaleDateString()}`} />
        {/* Daily Sales Card */}
        <DashboardCard title="Revenue" value={revenue} icon={<DollarSign className="h-5 w-5 text-green-500" />} description={`Revenue for ${new Date().toLocaleDateString()}`} />

        <DashboardCard title="Daily Sales" value={dailySales} icon={<DollarSign className="h-5 w-5 text-green-500" />} description={`Sales for ${new Date().toLocaleDateString()}`} />

        {/* Monthly Sales Card */}
        <DashboardCard title="Monthly Sales" value={monthlySales} icon={<DollarSign className="h-5 w-5 text-green-500" />} description={`Sales for ${new Date().toLocaleDateString()}`} />

        {/* Yearly Sales Card */}
        <DashboardCard title="Yearly Sales" value={yearlySales} icon={<BarChart2 className="h-5 w-5 text-purple-500" />} description={`Sales for ${new Date().getFullYear()}`} />
        <DashboardCard title="Unpaid Sales" value={Number(unpaidSales.total_amount || 0)} icon={<DollarSign className="h-5 w-5 text-red-500" />} description={`Unpaid sales for ${new Date().toLocaleDateString()}`} />
        </>
    )
}
