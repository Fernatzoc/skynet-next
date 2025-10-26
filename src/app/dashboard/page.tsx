'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Users, UserCheck, Clock, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { visitasApi, clientesApi, usersApi } from '@/lib/api/endpoints';
import type { Visita } from '@/lib/api/endpoints';
import { getErrorMessage } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
    totalVisits: number;
    pendingVisits: number;
    completedVisits: number;
    totalClients: number;
    activeUsers: number;
    totalTechnicians: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalVisits: 0,
        pendingVisits: 0,
        completedVisits: 0,
        totalClients: 0,
        activeUsers: 0,
        totalTechnicians: 0,
    });
    const [recentVisits, setRecentVisits] = useState<Visita[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            const [visitsData, clientsData, usersData] = await Promise.all([
                visitasApi.getAll(),
                clientesApi.getAll(),
                usersApi.getAll(),
            ]);

            const pendingCount = visitsData.filter((v) => v.idEstadoVisita === 1 || v.idEstadoVisita === 2).length;
            const completedCount = visitsData.filter((v) => v.idEstadoVisita === 3).length;
            const activeUsersCount = usersData.filter((u) => u.status === true).length;
            const techniciansCount = usersData.filter((u) =>
                u.roles.some((r) => r.toLowerCase() === 'tecnico')
            ).length;

            setStats({
                totalVisits: visitsData.length,
                pendingVisits: pendingCount,
                completedVisits: completedCount,
                totalClients: clientsData.length,
                activeUsers: activeUsersCount,
                totalTechnicians: techniciansCount,
            });

            const sortedVisits = [...visitsData]
                .sort((a, b) => new Date(b.fechaHoraProgramada).getTime() - new Date(a.fechaHoraProgramada).getTime())
                .slice(0, 5);
            setRecentVisits(sortedVisits);
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: getErrorMessage(err),
            });
        } finally {
            setLoading(false);
        }
    };

    const getEstadoBadge = (idEstadoVisita: number) => {
        switch (idEstadoVisita) {
            case 1:
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
            case 2:
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En Proceso</Badge>;
            case 3:
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completada</Badge>;
            case 4:
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelada</Badge>;
            default:
                return <Badge variant="outline">Desconocido</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInHours < 1) return 'Hace menos de 1 hora';
        if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
        if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;

        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const statsCards = [
        {
            title: 'Total de Visitas',
            value: loading ? '...' : stats.totalVisits.toString(),
            icon: ClipboardList,
            description: 'Visitas registradas',
        },
        {
            title: 'Visitas Pendientes',
            value: loading ? '...' : stats.pendingVisits.toString(),
            icon: Clock,
            description: 'Requieren atención',
        },
        {
            title: 'Visitas Completadas',
            value: loading ? '...' : stats.completedVisits.toString(),
            icon: CheckCircle,
            description: 'Finalizadas con éxito',
        },
        {
            title: 'Clientes',
            value: loading ? '...' : stats.totalClients.toString(),
            icon: Users,
            description: 'Clientes registrados',
        },
        {
            title: 'Usuarios Activos',
            value: loading ? '...' : stats.activeUsers.toString(),
            icon: UserCheck,
            description: 'Usuarios del sistema',
        },
        {
            title: 'Técnicos',
            value: loading ? '...' : stats.totalTechnicians.toString(),
            icon: UserCheck,
            description: 'Técnicos disponibles',
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
                    <p className="text-muted-foreground">
                        Vista general del sistema de gestión de visitas
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {statsCards.map((stat) => {
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
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stat.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid gap-4 md:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Visitas Recientes</CardTitle>
                            <CardDescription>
                                Últimas visitas registradas en el sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                                    ))}
                                </div>
                            ) : recentVisits.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No hay visitas registradas</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentVisits.map((visita) => (
                                        <div
                                            key={visita.id}
                                            className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-primary font-semibold text-sm">
                                                        {visita.nombreCliente.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{visita.nombreCliente}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {visita.tipoVisita} - {visita.nombreTecnico}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {getEstadoBadge(visita.idEstadoVisita)}
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatDate(visita.fechaHoraProgramada)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Resumen Rápido</CardTitle>
                            <CardDescription>
                                Información clave del sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Visitas Totales</span>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        {stats.totalVisits}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Pendientes</span>
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                        {stats.pendingVisits}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Completadas</span>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        {stats.completedVisits}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Clientes Activos</span>
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                        {stats.totalClients}
                                    </Badge>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tasa de Completitud</span>
                                        <span className="font-medium">
                                            {stats.totalVisits > 0
                                                ? Math.round((stats.completedVisits / stats.totalVisits) * 100)
                                                : 0}
                                            %
                                        </span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500"
                                            style={{
                                                width: `${stats.totalVisits > 0
                                                    ? (stats.completedVisits / stats.totalVisits) * 100
                                                    : 0
                                                    }%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 mt-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Visitas Pendientes</span>
                                        <span className="font-medium">
                                            {stats.totalVisits > 0
                                                ? Math.round((stats.pendingVisits / stats.totalVisits) * 100)
                                                : 0}
                                            %
                                        </span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-500"
                                            style={{
                                                width: `${stats.totalVisits > 0
                                                    ? (stats.pendingVisits / stats.totalVisits) * 100
                                                    : 0
                                                    }%`,
                                            }}
                                        />
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
