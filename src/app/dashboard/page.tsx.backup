'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const stats = [
    {
        title: 'Ingresos Totales',
        value: '$45,231.89',
        change: '+20.1%',
        trend: 'up',
        icon: CreditCard,
    },
    {
        title: 'Usuarios Activos',
        value: '+2,350',
        change: '+180.1%',
        trend: 'up',
        icon: Users,
    },
    {
        title: 'Ventas',
        value: '+12,234',
        change: '+19%',
        trend: 'up',
        icon: TrendingUp,
    },
    {
        title: 'Actividad',
        value: '+573',
        change: '-4.3%',
        trend: 'down',
        icon: Activity,
    },
];

const recentActivity = [
    { id: 1, user: 'Juan Pérez', action: 'Realizó una compra', amount: '$59.99', time: 'Hace 2 min' },
    { id: 2, user: 'María García', action: 'Se registró', amount: '', time: 'Hace 5 min' },
    { id: 3, user: 'Carlos López', action: 'Actualizó perfil', amount: '', time: 'Hace 10 min' },
    { id: 4, user: 'Ana Martínez', action: 'Realizó una compra', amount: '$129.99', time: 'Hace 15 min' },
    { id: 5, user: 'Pedro Sánchez', action: 'Dejó un comentario', amount: '', time: 'Hace 20 min' },
];

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
                    <p className="text-muted-foreground">
                        Bienvenido a tu panel de control
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.title}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                                        {stat.trend === 'up' ? (
                                            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                                        ) : (
                                            <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                                        )}
                                        <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                                            {stat.change}
                                        </span>
                                        <span className="ml-1">desde el último mes</span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Recent Activity */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Actividad Reciente</CardTitle>
                            <CardDescription>
                                Las últimas acciones realizadas en el sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-primary font-semibold text-sm">
                                                    {activity.user.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{activity.user}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {activity.action}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {activity.amount && (
                                                <p className="text-sm font-medium">{activity.amount}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Estado del Sistema</CardTitle>
                            <CardDescription>
                                Información general del sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Servidor</span>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        Activo
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Base de Datos</span>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        Conectada
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">API Externa</span>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        Operativa
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Almacenamiento</span>
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                        65% usado
                                    </Badge>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">CPU</span>
                                        <span className="font-medium">45%</span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: '45%' }} />
                                    </div>
                                </div>

                                <div className="space-y-2 mt-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Memoria</span>
                                        <span className="font-medium">62%</span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: '62%' }} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
