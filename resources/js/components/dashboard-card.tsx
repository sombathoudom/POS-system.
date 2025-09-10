import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface DashboardCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    description?: string;
}
export default function DashboardCard({ title, value, icon, description = '' }: DashboardCardProps) {
    return (
        <Card className="group border border-gray-200/60 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-gray-300/80 hover:bg-white hover:shadow-lg dark:border-gray-700/60 dark:bg-gray-900/80 dark:hover:border-gray-600/80 dark:hover:bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
                <div className="dark:group-hover:text-muted-foreground text-gray-400 transition-colors duration-200 group-hover:text-gray-600">
                    {icon}
                </div>
            </CardHeader>

            <CardContent className="space-y-1">
                <div className="text-mute text-2xl font-bold">{value.toFixed(2)}</div>
                <p className="text-muted-foreground text-xs">{description}</p>
            </CardContent>
        </Card>
    );
}
