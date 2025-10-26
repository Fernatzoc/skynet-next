'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    CalendarPlus,
    Calendar,
    Search,
    Loader2,
    MoreVertical,
    Edit,
    Trash2,
    MapPin,
    User,
    Clock,
    CheckCircle2,
    XCircle,
    PlayCircle,
    CheckSquare,
    FileText,
    Download
} from 'lucide-react';
import {
    visitasApi,
    clientesApi,
    usersApi,
    Visita,
    CrearVisitaRequest,
    RegistrarVisitaRequest,
    Cliente,
    User as UserType,
    ESTADOS_VISITA,
    TIPOS_VISITA,
    ESTADOS_VISITA_LABELS,
    TIPOS_VISITA_LABELS
} from '@/lib/api/endpoints';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/hooks/use-auth';
import { format, parseISO, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { generateVisitasPDF } from '@/lib/reports';

// Helper para extraer mensajes de error
const getErrorMessage = (err: unknown): string => {
    const error = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string; title?: string } }; message?: string };
    if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const messages: string[] = [];
        Object.keys(errors).forEach(field => {
            const fieldErrors = errors[field];
            if (Array.isArray(fieldErrors)) {
                messages.push(...fieldErrors);
            }
        });
        return messages.join('. ');
    }
    return error.response?.data?.message || error.response?.data?.title || error.message || 'Error en la operación';
};

// Helper para obtener el color del badge según el estado
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

// Función para enviar email de reporte de visita
const sendVisitReportEmail = async (visitaId: number) => {
    try {
        const detalle = await visitasApi.getDetalle(visitaId);
        const { visita, cliente } = detalle;

        const emailData = {
            visitaId: visita.id,
            clienteEmail: cliente.correoElectronico,
            clienteNombre: [
                cliente.primerNombre,
                cliente.segundoNombre,
                cliente.tercerNombre,
                cliente.primerApellido,
                cliente.segundoApellido
            ].filter(Boolean).join(' '),
            visitaFecha: visita.fechaHoraProgramada,
            visitaHora: format(parseISO(visita.fechaHoraProgramada), 'HH:mm', { locale: es }),
            visitaEstado: visita.estadoVisita,
            visitaDireccion: cliente.direccion,
            visitaDescripcion: visita.descripcion || '',
            registroFecha: visita.fechaHoraFinReal || new Date().toISOString(),
            registroObservaciones: visita.observaciones || '',
            registroResultado: 'Completada exitosamente',
            tecnicoNombre: visita.nombreTecnico,
            tecnicoTelefono: '(Contactar a través de SkyNet)',
        };

        const response = await fetch('/api/send-visit-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error al enviar el email');
        }

        return result;
    } catch (error) {
        throw error;
    }
};

// Helper para obtener el ícono según el estado
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

export default function VisitasPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { can, user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('today');
    const [estadoFilter, setEstadoFilter] = useState<number | 'all'>('all');
    const [tecnicoFilter, setTecnicoFilter] = useState<string | 'all'>('all');

    // Estados de visitas
    const [visitas, setVisitas] = useState<Visita[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    // Estados para crear/editar visita
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingVisita, setEditingVisita] = useState<Visita | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState('');

    // Catálogos
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [tecnicos, setTecnicos] = useState<UserType[]>([]);
    const [supervisores, setSupervisores] = useState<UserType[]>([]);
    const [loadingCatalogos, setLoadingCatalogos] = useState(false);

    // Estados del formulario
    const [idCliente, setIdCliente] = useState('');
    const [idTecnico, setIdTecnico] = useState('');
    const [idSupervisor, setIdSupervisor] = useState('');
    const [fechaHoraProgramada, setFechaHoraProgramada] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [idEstadoVisita, setIdEstadoVisita] = useState('');
    const [idTipoVisita, setIdTipoVisita] = useState('');

    // Estado para registrar visita
    const [registrarDialogOpen, setRegistrarDialogOpen] = useState(false);
    const [visitaToRegistrar, setVisitaToRegistrar] = useState<Visita | null>(null);
    const [fechaHoraInicioReal, setFechaHoraInicioReal] = useState('');
    const [fechaHoraFinReal, setFechaHoraFinReal] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    // Estado para eliminar
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [visitaToDelete, setVisitaToDelete] = useState<Visita | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Estado para cambiar estado rápido
    const [estadoDialogOpen, setEstadoDialogOpen] = useState(false);
    const [visitaToChangeEstado, setVisitaToChangeEstado] = useState<Visita | null>(null);
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [isChangingEstado, setIsChangingEstado] = useState(false);

    useEffect(() => {
        if (user) {
            loadVisitas();
            loadTecnicosForFilter();
        }
    }, [user]);

    const loadVisitas = async () => {
        try {
            setIsLoading(true);
            setLoadError('');

            // Si es técnico, solo cargar sus visitas asignadas
            if (user?.role === 'Tecnico' && user?.id) {
                const data = await visitasApi.getByTecnico(user.id);
                setVisitas(data);
            } else {
                // Admin y Supervisor ven todas las visitas
                const data = await visitasApi.getAll();
                setVisitas(data);
            }
        } catch (err) {
            setLoadError(getErrorMessage(err));
            console.error('Error loading visitas:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const loadTecnicosForFilter = async () => {
        // Solo cargar técnicos para el filtro si es Admin o Supervisor
        if (!canCreateEdit) return;

        try {
            const usersData = await usersApi.getAll();

            if (user?.role === 'Supervisor' && user?.id) {
                // Supervisor: solo técnicos asignados
                try {
                    const tecnicosData = await usersApi.getTecnicosAsignados(user.id);
                    setTecnicos(tecnicosData);
                } catch (err) {
                    console.error('Error loading técnicos asignados:', err);
                    // Fallback: mostrar todos los técnicos
                    setTecnicos(usersData.filter(u => u.roles.includes('Tecnico')));
                }
            } else {
                // Admin: todos los técnicos
                setTecnicos(usersData.filter(u => u.roles.includes('Tecnico')));
            }
        } catch (err) {
            console.error('Error loading técnicos for filter:', err);
        }
    };

    const loadCatalogos = async () => {
        try {
            setLoadingCatalogos(true);
            const [clientesData, usersData] = await Promise.all([
                clientesApi.getAll(),
                usersApi.getAll(),
            ]);

            setClientes(clientesData);

            // Filtrar técnicos según el rol del usuario
            let tecnicosData: UserType[] = [];

            if (user?.role === 'Supervisor' && user?.id) {
                // Supervisor: solo técnicos asignados a él
                try {
                    tecnicosData = await usersApi.getTecnicosAsignados(user.id);
                } catch (err) {
                    console.error('Error loading técnicos asignados:', err);
                    // Fallback: mostrar todos los técnicos
                    tecnicosData = usersData.filter(u => u.roles.includes('Tecnico'));
                }
            } else {
                // Admin o Tecnico: mostrar todos los técnicos
                tecnicosData = usersData.filter(u => u.roles.includes('Tecnico'));
            }

            const supervisoresData = usersData.filter(u => u.roles.includes('Supervisor') || u.roles.includes('Administrador'));

            setTecnicos(tecnicosData);
            setSupervisores(supervisoresData);
        } catch (err) {
            console.error('Error loading catálogos:', err);
            toast({
                title: "⚠️ Advertencia",
                description: "No se pudieron cargar algunos catálogos",
                variant: "destructive",
            });
        } finally {
            setLoadingCatalogos(false);
        }
    };

    const clearForm = () => {
        setIdCliente('');
        setIdTecnico('');
        setIdSupervisor('');
        setFechaHoraProgramada('');
        setDescripcion('');
        setIdEstadoVisita(ESTADOS_VISITA.PENDIENTE.toString());
        setIdTipoVisita('');
        setFormError('');
        setEditingVisita(null);
    };

    const openCreateDialog = async () => {
        clearForm();
        await loadCatalogos();
        setDialogOpen(true);
    };

    const openEditDialog = async (visita: Visita) => {
        setEditingVisita(visita);
        setIdCliente(visita.idCliente.toString());
        setIdTecnico(visita.idTecnico);
        setIdSupervisor(visita.idSupervisor || '');

        // Convertir ISO string a formato datetime-local
        const fechaProgramada = new Date(visita.fechaHoraProgramada);
        const fechaProgramadaLocal = new Date(fechaProgramada.getTime() - fechaProgramada.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        setFechaHoraProgramada(fechaProgramadaLocal);

        setDescripcion(visita.descripcion || '');
        setIdEstadoVisita(visita.idEstadoVisita.toString());
        setIdTipoVisita(visita.idTipoVisita.toString());
        await loadCatalogos();
        setDialogOpen(true);
    };

    const handleSave = async () => {
        // Validación
        if (!idCliente || !idTecnico || !fechaHoraProgramada || !idEstadoVisita || !idTipoVisita) {
            setFormError('Todos los campos marcados con * son obligatorios');
            return;
        }

        // Validar que la fecha programada no sea en el pasado (solo para nuevas visitas)
        if (!editingVisita) {
            const fechaSeleccionada = new Date(fechaHoraProgramada);
            const ahora = new Date();
            if (fechaSeleccionada < ahora) {
                setFormError('La fecha programada no puede ser en el pasado');
                return;
            }
        }

        setIsSaving(true);
        setFormError('');

        try {
            const data: CrearVisitaRequest = {
                idCliente: parseInt(idCliente),
                idSupervisor: idSupervisor || undefined,
                idTecnico,
                idEstadoVisita: parseInt(idEstadoVisita),
                idTipoVisita: parseInt(idTipoVisita),
                fechaHoraProgramada: new Date(fechaHoraProgramada).toISOString(),
                descripcion: descripcion || undefined,
            };

            if (editingVisita) {
                await visitasApi.update(editingVisita.id, data);
                toast({
                    title: "✅ Visita actualizada",
                    description: "La visita ha sido actualizada exitosamente",
                    variant: "success",
                });
            } else {
                await visitasApi.create(data);
                toast({
                    title: "✅ Visita creada",
                    description: "La visita ha sido agendada exitosamente",
                    variant: "success",
                });
            }

            setDialogOpen(false);
            clearForm();
            await loadVisitas();
        } catch (err) {
            setFormError(getErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (visita: Visita) => {
        setVisitaToDelete(visita);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!visitaToDelete) return;

        setIsDeleting(true);

        try {
            await visitasApi.delete(visitaToDelete.id);
            toast({
                title: "✅ Visita eliminada",
                description: "La visita ha sido eliminada exitosamente",
                variant: "success",
            });
            setDeleteDialogOpen(false);
            setVisitaToDelete(null);
            await loadVisitas();
        } catch (err) {
            toast({
                title: "❌ Error",
                description: getErrorMessage(err),
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleChangeEstadoClick = (visita: Visita) => {
        setVisitaToChangeEstado(visita);
        setNuevoEstado(visita.idEstadoVisita.toString());
        setEstadoDialogOpen(true);
    };

    const handleChangeEstadoConfirm = async () => {
        if (!visitaToChangeEstado || !nuevoEstado) return;

        setIsChangingEstado(true);

        try {
            await visitasApi.updateEstado(visitaToChangeEstado.id, parseInt(nuevoEstado));
            toast({
                title: "✅ Estado actualizado",
                description: `La visita ahora está en estado: ${ESTADOS_VISITA_LABELS[parseInt(nuevoEstado)]}`,
                variant: "success",
            });
            setEstadoDialogOpen(false);
            setVisitaToChangeEstado(null);
            setNuevoEstado('');
            await loadVisitas();
        } catch (err) {
            toast({
                title: "❌ Error",
                description: getErrorMessage(err),
                variant: "destructive",
            });
        } finally {
            setIsChangingEstado(false);
        }
    };

    const handleRegistrarClick = (visita: Visita) => {
        setVisitaToRegistrar(visita);
        setFechaHoraInicioReal('');
        setFechaHoraFinReal('');
        setObservaciones('');
        setRegistrarDialogOpen(true);
    };

    const handleIniciarVisita = async (visita: Visita) => {
        try {
            await visitasApi.updateEstado(visita.id, ESTADOS_VISITA.EN_PROGRESO);
            toast({
                title: "✅ Visita iniciada",
                description: "La visita ha sido marcada como en progreso",
                variant: "success",
            });
            await loadVisitas();
        } catch (err) {
            toast({
                title: "❌ Error",
                description: getErrorMessage(err),
                variant: "destructive",
            });
        }
    };

    const handleRegistrarConfirm = async () => {
        if (!visitaToRegistrar || !fechaHoraInicioReal || !fechaHoraFinReal) {
            toast({
                title: "⚠️ Campos requeridos",
                description: "Debes completar las fechas de inicio y fin",
                variant: "destructive",
            });
            return;
        }

        // Validar que la fecha de fin sea posterior a la de inicio
        if (new Date(fechaHoraFinReal) <= new Date(fechaHoraInicioReal)) {
            toast({
                title: "⚠️ Fechas inválidas",
                description: "La fecha de fin debe ser posterior a la de inicio",
                variant: "destructive",
            });
            return;
        }

        setIsRegistering(true);

        try {
            // Si la visita ya tiene registro, solo cambiar el estado a Completada
            if (visitaToRegistrar.idRegistroVisita) {
                await visitasApi.updateEstado(visitaToRegistrar.id, ESTADOS_VISITA.COMPLETADA);

                toast({
                    title: "✅ Visita completada",
                    description: "La visita ha sido marcada como completada",
                    variant: "success",
                });
            } else {
                // Si no tiene registro, crear uno nuevo y cambiar a Completada
                const data: RegistrarVisitaRequest = {
                    fechaHoraInicioReal: new Date(fechaHoraInicioReal).toISOString(),
                    fechaHoraFinReal: new Date(fechaHoraFinReal).toISOString(),
                    observaciones: observaciones || '',
                };

                const result = await visitasApi.registrar(visitaToRegistrar.id, data);

                // Cambiar el estado a Completada después de registrar
                await visitasApi.updateEstado(visitaToRegistrar.id, ESTADOS_VISITA.COMPLETADA);

                toast({
                    title: "✅ Visita completada",
                    description: "La visita ha sido registrada y completada exitosamente",
                    variant: "success",
                });
            }

            // Enviar email de reporte al cliente
            try {
                await sendVisitReportEmail(visitaToRegistrar.id);

                toast({
                    title: "📧 Email enviado",
                    description: "Se ha enviado el reporte de la visita al cliente",
                    variant: "success",
                });
            } catch (emailError) {
                // No bloqueamos el flujo si falla el email
                toast({
                    title: "⚠️ Advertencia",
                    description: "La visita fue completada pero no se pudo enviar el email al cliente",
                    variant: "default",
                });
            }

            setRegistrarDialogOpen(false);
            setVisitaToRegistrar(null);
            setFechaHoraInicioReal('');
            setFechaHoraFinReal('');
            setObservaciones('');
            await loadVisitas();
        } catch (err) {
            console.error('❌ Error al registrar visita:', err);
            toast({
                title: "❌ Error",
                description: getErrorMessage(err),
                variant: "destructive",
            });
        } finally {
            setIsRegistering(false);
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

    const filteredVisitas = visitas.filter(visita => {
        // Filtro por búsqueda de texto
        const search = searchTerm.toLowerCase();
        const matchesSearch = visita.nombreCliente.toLowerCase().includes(search) ||
            visita.nombreTecnico.toLowerCase().includes(search) ||
            visita.estadoVisita.toLowerCase().includes(search) ||
            visita.tipoVisita.toLowerCase().includes(search);

        if (!matchesSearch) return false;

        // Filtro por estado
        if (estadoFilter !== 'all' && visita.idEstadoVisita !== estadoFilter) {
            return false;
        }

        // Filtro por técnico (solo para Admin/Supervisor)
        if (tecnicoFilter !== 'all' && visita.idTecnico !== tecnicoFilter) {
            return false;
        }

        // Filtro por fecha
        try {
            const fechaProgramada = parseISO(visita.fechaHoraProgramada);

            switch (dateFilter) {
                case 'today':
                    return isToday(fechaProgramada);
                case 'week':
                    return isThisWeek(fechaProgramada, { weekStartsOn: 1 }); // Semana comienza el lunes
                case 'month':
                    return isThisMonth(fechaProgramada);
                case 'all':
                default:
                    return true;
            }
        } catch {
            return false;
        }
    });

    const canCreateEdit = can('canManageVisits');
    const canDelete = user?.role === 'Administrador';

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {user?.role === 'Tecnico' ? 'Mis Visitas' : 'Visitas'}
                        </h1>
                        <p className="text-muted-foreground">
                            {user?.role === 'Tecnico'
                                ? 'Tus visitas técnicas asignadas'
                                : 'Gestiona las visitas técnicas programadas'}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                const filtroTexto = `Filtros aplicados: ${dateFilter !== 'all' ? dateFilter : 'todas las fechas'}, ${estadoFilter !== 'all' ? `Estado ${estadoFilter}` : 'todos los estados'}`;
                                generateVisitasPDF(filteredVisitas, filtroTexto);
                                toast({
                                    title: 'PDF Generado',
                                    description: 'El reporte se ha descargado exitosamente',
                                });
                            }}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Exportar PDF
                        </Button>

                        {canCreateEdit && (
                            <Button onClick={openCreateDialog}>
                                <CalendarPlus className="mr-2 h-4 w-4" />
                                Nueva Visita
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tarjetas de resumen */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Visitas</p>
                                <p className="text-2xl font-bold">{filteredVisitas.length}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                                <p className="text-2xl font-bold">
                                    {filteredVisitas.filter(v => v.idEstadoVisita === ESTADOS_VISITA.COMPLETADA).length}
                                </p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">En Progreso</p>
                                <p className="text-2xl font-bold">
                                    {filteredVisitas.filter(v => v.idEstadoVisita === ESTADOS_VISITA.EN_PROGRESO).length}
                                </p>
                            </div>
                            <PlayCircle className="h-8 w-8 text-blue-500" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                                <p className="text-2xl font-bold">
                                    {filteredVisitas.filter(v => v.idEstadoVisita === ESTADOS_VISITA.PENDIENTE).length}
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-500" />
                        </div>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por cliente, técnico, estado o tipo..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Filtros de fecha */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Mostrar:</span>
                                <Button
                                    variant={dateFilter === 'today' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setDateFilter('today')}
                                >
                                    Hoy
                                </Button>
                                <Button
                                    variant={dateFilter === 'week' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setDateFilter('week')}
                                >
                                    Esta Semana
                                </Button>
                                <Button
                                    variant={dateFilter === 'month' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setDateFilter('month')}
                                >
                                    Este Mes
                                </Button>
                                <Button
                                    variant={dateFilter === 'all' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setDateFilter('all')}
                                >
                                    Todas
                                </Button>
                            </div>

                            {/* Filtros adicionales */}
                            <div className="flex flex-wrap items-center gap-4">
                                {/* Filtro por estado */}
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="estadoFilter" className="text-sm font-medium">Estado:</Label>
                                    <Select value={estadoFilter.toString()} onValueChange={(value) => setEstadoFilter(value === 'all' ? 'all' : parseInt(value))}>
                                        <SelectTrigger id="estadoFilter" className="w-[180px]">
                                            <SelectValue placeholder="Todos los estados" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los estados</SelectItem>
                                            <SelectItem value={ESTADOS_VISITA.PENDIENTE.toString()}>
                                                {ESTADOS_VISITA_LABELS[ESTADOS_VISITA.PENDIENTE]}
                                            </SelectItem>
                                            <SelectItem value={ESTADOS_VISITA.EN_PROGRESO.toString()}>
                                                {ESTADOS_VISITA_LABELS[ESTADOS_VISITA.EN_PROGRESO]}
                                            </SelectItem>
                                            <SelectItem value={ESTADOS_VISITA.COMPLETADA.toString()}>
                                                {ESTADOS_VISITA_LABELS[ESTADOS_VISITA.COMPLETADA]}
                                            </SelectItem>
                                            <SelectItem value={ESTADOS_VISITA.CANCELADA.toString()}>
                                                {ESTADOS_VISITA_LABELS[ESTADOS_VISITA.CANCELADA]}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Filtro por técnico (solo para Admin/Supervisor) */}
                                {canCreateEdit && tecnicos.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="tecnicoFilter" className="text-sm font-medium">Técnico:</Label>
                                        <Select value={tecnicoFilter} onValueChange={setTecnicoFilter}>
                                            <SelectTrigger id="tecnicoFilter" className="w-[200px]">
                                                <SelectValue placeholder="Todos los técnicos" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos los técnicos</SelectItem>
                                                {tecnicos.map(tecnico => (
                                                    <SelectItem key={tecnico.id} value={tecnico.id}>
                                                        {tecnico.firstName} {tecnico.lastName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-muted-foreground">Cargando visitas...</span>
                            </div>
                        ) : loadError ? (
                            <div className="text-center py-12">
                                <p className="text-red-500">{loadError}</p>
                                <Button onClick={loadVisitas} variant="outline" className="mt-4">
                                    Reintentar
                                </Button>
                            </div>
                        ) : filteredVisitas.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                {searchTerm
                                    ? 'No se encontraron visitas'
                                    : user?.role === 'Tecnico'
                                        ? 'No tienes visitas asignadas'
                                        : 'No hay visitas registradas'}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredVisitas.map((visita) => (
                                    <div
                                        key={visita.id}
                                        className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium">{visita.nombreCliente}</h3>
                                                <Badge
                                                    variant="outline"
                                                    className={getEstadoBadgeColor(visita.idEstadoVisita)}
                                                >
                                                    <span className="mr-1">{getEstadoIcon(visita.idEstadoVisita)}</span>
                                                    {visita.estadoVisita}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {visita.tipoVisita}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    <span>Técnico: {visita.nombreTecnico}</span>
                                                </div>
                                                {visita.nombreSupervisor && (
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        <span>Supervisor: {visita.nombreSupervisor}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{formatFecha(visita.fechaHoraProgramada)}</span>
                                                </div>
                                            </div>

                                            {visita.descripcion && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {visita.descripcion}
                                                </p>
                                            )}
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuSeparator />

                                                {/* Ver detalles: disponible para todos */}
                                                <DropdownMenuItem
                                                    className="cursor-pointer"
                                                    onClick={() => router.push(`/dashboard/visitas/${visita.id}`)}
                                                >
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Ver Detalles
                                                </DropdownMenuItem>

                                                {/* Iniciar visita: solo si está pendiente */}
                                                {visita.idEstadoVisita === ESTADOS_VISITA.PENDIENTE && (
                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        onClick={() => handleIniciarVisita(visita)}
                                                    >
                                                        <PlayCircle className="h-4 w-4 mr-2" />
                                                        Iniciar Visita
                                                    </DropdownMenuItem>
                                                )}

                                                {/* Completar visita: si está en progreso */}
                                                {visita.idEstadoVisita === ESTADOS_VISITA.EN_PROGRESO && (
                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        onClick={() => handleRegistrarClick(visita)}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                                        Completar Visita
                                                    </DropdownMenuItem>
                                                )}

                                                {/* Cambiar Estado: solo para Admin/Supervisor */}
                                                {canCreateEdit && (
                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        onClick={() => handleChangeEstadoClick(visita)}
                                                    >
                                                        <PlayCircle className="h-4 w-4 mr-2" />
                                                        Cambiar Estado
                                                    </DropdownMenuItem>
                                                )}

                                                {/* Editar: solo para Admin/Supervisor */}
                                                {canCreateEdit && (
                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        onClick={() => openEditDialog(visita)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                )}

                                                {/* Eliminar: solo para Administrador */}
                                                {canDelete && (
                                                    <DropdownMenuItem
                                                        className="cursor-pointer text-red-600"
                                                        onClick={() => handleDeleteClick(visita)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Dialog para crear/editar visita */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingVisita ? 'Editar Visita' : 'Nueva Visita'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingVisita
                                    ? 'Actualiza la información de la visita'
                                    : 'Agenda una nueva visita técnica. Los campos marcados con * son obligatorios.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            {formError && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md">
                                    {formError}
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="cliente">Cliente *</Label>
                                <Select
                                    value={idCliente}
                                    onValueChange={setIdCliente}
                                    disabled={isSaving || loadingCatalogos}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clientes.map(cliente => (
                                            <SelectItem key={cliente.id} value={cliente.id.toString()}>
                                                {`${cliente.primerNombre} ${cliente.primerApellido}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tecnico">Técnico *</Label>
                                <Select
                                    value={idTecnico}
                                    onValueChange={setIdTecnico}
                                    disabled={isSaving || loadingCatalogos}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un técnico" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tecnicos.map(tecnico => (
                                            <SelectItem key={tecnico.id} value={tecnico.id}>
                                                {tecnico.firstName} {tecnico.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="supervisor">Supervisor (Opcional)</Label>
                                <Select
                                    value={idSupervisor || "none"}
                                    onValueChange={(value) => setIdSupervisor(value === "none" ? "" : value)}
                                    disabled={isSaving || loadingCatalogos}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un supervisor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Sin supervisor</SelectItem>
                                        {supervisores.map(supervisor => (
                                            <SelectItem key={supervisor.id} value={supervisor.id}>
                                                {supervisor.firstName} {supervisor.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="fechaProgramada">Fecha y Hora Programada *</Label>
                                <Input
                                    id="fechaProgramada"
                                    type="datetime-local"
                                    value={fechaHoraProgramada}
                                    onChange={(e) => setFechaHoraProgramada(e.target.value)}
                                    disabled={isSaving}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="descripcion">Descripción</Label>
                                <Input
                                    id="descripcion"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Describe la visita o servicio a realizar..."
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="estado">Estado *</Label>
                                    <Select
                                        value={idEstadoVisita}
                                        onValueChange={setIdEstadoVisita}
                                        disabled={isSaving}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(ESTADOS_VISITA_LABELS).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="tipo">Tipo de Visita *</Label>
                                    <Select
                                        value={idTipoVisita}
                                        onValueChange={setIdTipoVisita}
                                        disabled={isSaving}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(TIPOS_VISITA_LABELS).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDialogOpen(false);
                                    clearForm();
                                }}
                                disabled={isSaving}
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving || loadingCatalogos}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingVisita ? 'Actualizar' : 'Crear'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog para cambiar estado */}
                <Dialog open={estadoDialogOpen} onOpenChange={setEstadoDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cambiar Estado de Visita</DialogTitle>
                            <DialogDescription>
                                Cliente: <strong>{visitaToChangeEstado?.nombreCliente}</strong>
                                <br />
                                Selecciona el nuevo estado para esta visita.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nuevoEstado">Nuevo Estado</Label>
                                <Select
                                    value={nuevoEstado}
                                    onValueChange={setNuevoEstado}
                                    disabled={isChangingEstado}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(ESTADOS_VISITA_LABELS).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEstadoDialogOpen(false);
                                    setVisitaToChangeEstado(null);
                                    setNuevoEstado('');
                                }}
                                disabled={isChangingEstado}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleChangeEstadoConfirm}
                                disabled={isChangingEstado || !nuevoEstado}
                            >
                                {isChangingEstado && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Actualizar Estado
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog para registrar visita */}
                <Dialog open={registrarDialogOpen} onOpenChange={setRegistrarDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Registrar Visita</DialogTitle>
                            <DialogDescription>
                                Completa la información de la visita realizada para{' '}
                                <strong>{visitaToRegistrar?.nombreCliente}</strong>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fechaInicio">Fecha/Hora Inicio Real *</Label>
                                <Input
                                    id="fechaInicio"
                                    type="datetime-local"
                                    value={fechaHoraInicioReal}
                                    onChange={(e) => setFechaHoraInicioReal(e.target.value)}
                                    disabled={isRegistering}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="fechaFin">Fecha/Hora Fin Real *</Label>
                                <Input
                                    id="fechaFin"
                                    type="datetime-local"
                                    value={fechaHoraFinReal}
                                    onChange={(e) => setFechaHoraFinReal(e.target.value)}
                                    disabled={isRegistering}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="observaciones">Observaciones</Label>
                                <textarea
                                    id="observaciones"
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    placeholder="Describe lo realizado durante la visita..."
                                    disabled={isRegistering}
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setRegistrarDialogOpen(false);
                                    setVisitaToRegistrar(null);
                                    setFechaHoraInicioReal('');
                                    setFechaHoraFinReal('');
                                    setObservaciones('');
                                }}
                                disabled={isRegistering}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleRegistrarConfirm}
                                disabled={isRegistering || !fechaHoraInicioReal || !fechaHoraFinReal}
                            >
                                {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Registrar Visita
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog para confirmar eliminación */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar eliminación</DialogTitle>
                            <DialogDescription>
                                ¿Estás seguro de que deseas eliminar la visita para{' '}
                                <strong>{visitaToDelete?.nombreCliente}</strong>?
                                <br />
                                <span className="text-red-600 font-semibold">
                                    ⚠️ Esta acción es permanente y no se puede deshacer.
                                </span>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setVisitaToDelete(null);
                                }}
                                disabled={isDeleting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                            >
                                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Eliminar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
