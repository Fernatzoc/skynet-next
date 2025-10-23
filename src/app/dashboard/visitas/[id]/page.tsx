'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Calendar,
    User,
    MapPin,
    Phone,
    Mail,
    Clock,
    FileText,
    Loader2,
    CheckCircle2,
    XCircle,
    PlayCircle
} from 'lucide-react';
import { visitasApi, VisitaDetalleResponse, ESTADOS_VISITA } from '@/lib/api/endpoints';
import { useToast } from '@/hooks/use-toast';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const getErrorMessage = (err: any): string => {
    if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const messages: string[] = [];
        Object.keys(errors).forEach(field => {
            const fieldErrors = errors[field];
            if (Array.isArray(fieldErrors)) {
                messages.push(...fieldErrors);
            }
        });
        return messages.join('. ');
    }
    return err.response?.data?.message || err.response?.data?.title || err.message || 'Error al cargar los detalles';
};

const getEstadoBadgeColor = (idEstado: number) => {
    switch (idEstado) {
        case ESTADOS_VISITA.PENDIENTE:
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case ESTADOS_VISITA.EN_PROGRESO:
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case ESTADOS_VISITA.COMPLETADA:
            return 'bg-green-100 text-green-800 border-green-200';
        case ESTADOS_VISITA.CANCELADA:
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const getEstadoIcon = (idEstado: number) => {
    switch (idEstado) {
        case ESTADOS_VISITA.PENDIENTE:
            return <Clock className="h-4 w-4" />;
        case ESTADOS_VISITA.EN_PROGRESO:
            return <PlayCircle className="h-4 w-4" />;
        case ESTADOS_VISITA.COMPLETADA:
            return <CheckCircle2 className="h-4 w-4" />;
        case ESTADOS_VISITA.CANCELADA:
            return <XCircle className="h-4 w-4" />;
        default:
            return <Clock className="h-4 w-4" />;
    }
};

const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '0.5rem'
};

export default function VisitaDetallePage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [detalle, setDetalle] = useState<VisitaDetalleResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const visitaId = parseInt(params.id as string);

    useEffect(() => {
        loadDetalle();
    }, [visitaId]);

    const loadDetalle = async () => {
        try {
            setIsLoading(true);
            setLoadError('');
            const data = await visitasApi.getDetalle(visitaId);
            setDetalle(data);
        } catch (err: any) {
            const errorMsg = getErrorMessage(err);
            setLoadError(errorMsg);
            toast({
                title: "❌ Error",
                description: errorMsg,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatFecha = (fechaISO: string): string => {
        try {
            const fecha = parseISO(fechaISO);
            return format(fecha, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
        } catch {
            return fechaISO;
        }
    };

    const getNombreCompletoCliente = () => {
        if (!detalle) return '';
        const { cliente } = detalle;
        const nombres = [
            cliente.primerNombre,
            cliente.segundoNombre,
            cliente.tercerNombre
        ].filter(Boolean).join(' ');

        const apellidos = [
            cliente.primerApellido,
            cliente.segundoApellido
        ].filter(Boolean).join(' ');

        return `${nombres} ${apellidos}`.trim();
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Cargando detalles...</span>
                </div>
            </DashboardLayout>
        );
    }

    if (loadError || !detalle) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-red-500">{loadError || 'No se pudo cargar la visita'}</p>
                            <Button onClick={loadDetalle} className="mt-4">
                                Reintentar
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    const { visita, cliente } = detalle;
    const center = {
        lat: cliente.latitud,
        lng: cliente.longitud
    };

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Detalle de Visita</h1>
                            <p className="text-muted-foreground">Visita #{visita.id}</p>
                        </div>
                    </div>
                    <Badge className={getEstadoBadgeColor(visita.idEstadoVisita)}>
                        {getEstadoIcon(visita.idEstadoVisita)}
                        <span className="ml-1">{visita.estadoVisita}</span>
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Información de la Visita */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Información de la Visita
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tipo de Visita</p>
                                <p className="text-lg font-semibold">{visita.tipoVisita}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Fecha Programada</p>
                                <p className="text-lg">{formatFecha(visita.fechaHoraProgramada)}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Técnico Asignado</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-lg">{visita.nombreTecnico}</p>
                                </div>
                            </div>

                            {visita.nombreSupervisor && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Supervisor</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-lg">{visita.nombreSupervisor}</p>
                                    </div>
                                </div>
                            )}

                            {visita.descripcion && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                                    <p className="text-base mt-1">{visita.descripcion}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Información del Cliente */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Información del Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                                <p className="text-lg font-semibold">{getNombreCompletoCliente()}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <a
                                        href={`tel:${cliente.telefono}`}
                                        className="text-lg text-blue-600 hover:underline"
                                    >
                                        {cliente.telefono}
                                    </a>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Correo Electrónico</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <a
                                        href={`mailto:${cliente.correoElectronico}`}
                                        className="text-lg text-blue-600 hover:underline"
                                    >
                                        {cliente.correoElectronico}
                                    </a>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                                <div className="flex items-start gap-2 mt-1">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                    <p className="text-base flex-1">{cliente.direccion}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Coordenadas GPS</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Lat: {cliente.latitud}, Lng: {cliente.longitud}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Mapa */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Ubicación del Cliente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={center}
                                zoom={15}
                            >
                                <Marker
                                    position={center}
                                    title={getNombreCompletoCliente()}
                                />
                            </GoogleMap>
                        </LoadScript>
                    </CardContent>
                </Card>

                {/* Registro de Visita (si existe) */}
                {visita.idRegistroVisita && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Registro de Visita
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {visita.fechaHoraInicioReal && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Hora de Inicio Real</p>
                                    <p className="text-lg">{formatFecha(visita.fechaHoraInicioReal)}</p>
                                </div>
                            )}

                            {visita.fechaHoraFinReal && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Hora de Fin Real</p>
                                    <p className="text-lg">{formatFecha(visita.fechaHoraFinReal)}</p>
                                </div>
                            )}

                            {visita.observaciones && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Observaciones</p>
                                    <p className="text-base mt-1">{visita.observaciones}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
