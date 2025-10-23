'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, UserPlus, MoreVertical, Phone, MapPin, Loader2, Edit, Trash2 } from 'lucide-react';
import { clientesApi, Cliente, CreateClienteRequest } from '@/lib/api/endpoints';
import { useToast } from '@/hooks/use-toast';
import { LocationPicker } from '@/components/ui/location-picker';

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

export default function ClientesPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    // Estados de clientes
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    // Estados para crear/editar cliente
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState('');

    // Estados del formulario
    const [primerNombre, setPrimerNombre] = useState('');
    const [segundoNombre, setSegundoNombre] = useState('');
    const [tercerNombre, setTercerNombre] = useState('');
    const [primerApellido, setPrimerApellido] = useState('');
    const [segundoApellido, setSegundoApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [correoElectronico, setCorreoElectronico] = useState('');
    const [latitud, setLatitud] = useState('');
    const [longitud, setLongitud] = useState('');
    const [direccion, setDireccion] = useState('');

    // Estado para eliminar
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadClientes();
    }, []);

    const loadClientes = async () => {
        try {
            setIsLoading(true);
            setLoadError('');
            const data = await clientesApi.getAll();
            setClientes(data);
        } catch (err) {
            setLoadError(getErrorMessage(err));
            console.error('Error loading clientes:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const clearForm = () => {
        setPrimerNombre('');
        setSegundoNombre('');
        setTercerNombre('');
        setPrimerApellido('');
        setSegundoApellido('');
        setTelefono('');
        setCorreoElectronico('');
        setLatitud('');
        setLongitud('');
        setDireccion('');
        setFormError('');
        setEditingCliente(null);
    };

    const openCreateDialog = () => {
        clearForm();
        setDialogOpen(true);
    };

    const openEditDialog = (cliente: Cliente) => {
        setEditingCliente(cliente);
        setPrimerNombre(cliente.primerNombre);
        setSegundoNombre(cliente.segundoNombre || '');
        setTercerNombre(cliente.tercerNombre || '');
        setPrimerApellido(cliente.primerApellido);
        setSegundoApellido(cliente.segundoApellido || '');
        setTelefono(cliente.telefono);
        setCorreoElectronico(cliente.correoElectronico);
        setLatitud(cliente.latitud.toString());
        setLongitud(cliente.longitud.toString());
        setDireccion(cliente.direccion);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        // Validación
        if (!primerNombre || !primerApellido || !telefono || !correoElectronico || !latitud || !longitud || !direccion) {
            setFormError('Los campos marcados con * son obligatorios');
            return;
        }

        if (telefono.length !== 8) {
            setFormError('El teléfono debe tener 8 dígitos');
            return;
        }

        // Validación básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correoElectronico)) {
            setFormError('El correo electrónico no es válido');
            return;
        }

        const lat = parseFloat(latitud);
        const lng = parseFloat(longitud);

        if (isNaN(lat) || isNaN(lng)) {
            setFormError('Latitud y longitud deben ser números válidos');
            return;
        }

        setIsSaving(true);
        setFormError('');

        try {
            const data: CreateClienteRequest = {
                primerNombre,
                segundoNombre: segundoNombre || undefined,
                tercerNombre: tercerNombre || undefined,
                primerApellido,
                segundoApellido: segundoApellido || undefined,
                telefono,
                correoElectronico,
                latitud: lat,
                longitud: lng,
                direccion,
            };

            if (editingCliente) {
                await clientesApi.update(editingCliente.id, data);
                toast({
                    title: "✅ Cliente actualizado",
                    description: "El cliente ha sido actualizado exitosamente",
                    variant: "success",
                });
            } else {
                await clientesApi.create(data);
                toast({
                    title: "✅ Cliente creado",
                    description: "El cliente ha sido creado exitosamente",
                    variant: "success",
                });
            }

            setDialogOpen(false);
            clearForm();
            await loadClientes();
        } catch (err) {
            setFormError(getErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (cliente: Cliente) => {
        setClienteToDelete(cliente);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!clienteToDelete) return;

        setIsDeleting(true);

        try {
            await clientesApi.delete(clienteToDelete.id);
            toast({
                title: "✅ Cliente desactivado",
                description: "El cliente ha sido desactivado exitosamente",
                variant: "success",
            });
            setDeleteDialogOpen(false);
            setClienteToDelete(null);
            await loadClientes();
        } catch (err: any) {
            toast({
                title: "❌ Error",
                description: getErrorMessage(err),
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const getClienteNombreCompleto = (cliente: Cliente): string => {
        const nombres = [cliente.primerNombre, cliente.segundoNombre, cliente.tercerNombre]
            .filter(Boolean)
            .join(' ');
        const apellidos = [cliente.primerApellido, cliente.segundoApellido]
            .filter(Boolean)
            .join(' ');
        return `${nombres} ${apellidos}`.trim();
    };

    const filteredClientes = clientes.filter(cliente => {
        const nombreCompleto = getClienteNombreCompleto(cliente).toLowerCase();
        const search = searchTerm.toLowerCase();
        return nombreCompleto.includes(search) ||
            cliente.telefono.includes(search) ||
            cliente.direccion.toLowerCase().includes(search);
    });

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
                        <p className="text-muted-foreground">
                            Gestiona los clientes de la plataforma
                        </p>
                    </div>

                    <Button onClick={openCreateDialog}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Nuevo Cliente
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nombre, teléfono o dirección..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-muted-foreground">Cargando clientes...</span>
                            </div>
                        ) : loadError ? (
                            <div className="text-center py-12">
                                <p className="text-red-500">{loadError}</p>
                                <Button onClick={loadClientes} variant="outline" className="mt-4">
                                    Reintentar
                                </Button>
                            </div>
                        ) : filteredClientes.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredClientes.map((cliente) => (
                                    <div
                                        key={cliente.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">{getClienteNombreCompleto(cliente)}</p>
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    Activo
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {cliente.telefono}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {cliente.direccion}
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Coordenadas: {cliente.latitud}, {cliente.longitud}
                                            </p>
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
                                                <DropdownMenuItem
                                                    className="cursor-pointer"
                                                    onClick={() => openEditDialog(cliente)}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="cursor-pointer text-red-600"
                                                    onClick={() => handleDeleteClick(cliente)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Desactivar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Dialog para crear/editar cliente */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingCliente
                                    ? 'Actualiza la información del cliente'
                                    : 'Ingresa la información del nuevo cliente. Los campos marcados con * son obligatorios.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            {formError && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md">
                                    {formError}
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="primerNombre">Primer Nombre *</Label>
                                    <Input
                                        id="primerNombre"
                                        value={primerNombre}
                                        onChange={(e) => setPrimerNombre(e.target.value)}
                                        placeholder="Juan"
                                        disabled={isSaving}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="segundoNombre">Segundo Nombre</Label>
                                    <Input
                                        id="segundoNombre"
                                        value={segundoNombre}
                                        onChange={(e) => setSegundoNombre(e.target.value)}
                                        placeholder="Carlos"
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tercerNombre">Tercer Nombre</Label>
                                    <Input
                                        id="tercerNombre"
                                        value={tercerNombre}
                                        onChange={(e) => setTercerNombre(e.target.value)}
                                        placeholder="José"
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="primerApellido">Primer Apellido *</Label>
                                    <Input
                                        id="primerApellido"
                                        value={primerApellido}
                                        onChange={(e) => setPrimerApellido(e.target.value)}
                                        placeholder="García"
                                        disabled={isSaving}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="segundoApellido">Segundo Apellido</Label>
                                    <Input
                                        id="segundoApellido"
                                        value={segundoApellido}
                                        onChange={(e) => setSegundoApellido(e.target.value)}
                                        placeholder="López"
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="telefono">Teléfono * (8 dígitos)</Label>
                                <Input
                                    id="telefono"
                                    type="tel"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    placeholder="12345678"
                                    maxLength={8}
                                    disabled={isSaving}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="correoElectronico">Correo Electrónico *</Label>
                                <Input
                                    id="correoElectronico"
                                    type="email"
                                    value={correoElectronico}
                                    onChange={(e) => setCorreoElectronico(e.target.value)}
                                    placeholder="cliente@example.com"
                                    maxLength={100}
                                    disabled={isSaving}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="direccion">Dirección *</Label>
                                <Input
                                    id="direccion"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    placeholder="Calle Principal #123"
                                    disabled={isSaving}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Ubicación en el Mapa *</Label>
                                <LocationPicker
                                    latitude={latitud ? parseFloat(latitud) : null}
                                    longitude={longitud ? parseFloat(longitud) : null}
                                    onLocationChange={(lat, lng) => {
                                        setLatitud(lat.toString());
                                        setLongitud(lng.toString());
                                    }}
                                    disabled={isSaving}
                                />
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
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingCliente ? 'Actualizar' : 'Crear'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog para confirmar eliminación */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar desactivación</DialogTitle>
                            <DialogDescription>
                                ¿Estás seguro de que deseas desactivar al cliente{' '}
                                <strong>{clienteToDelete && getClienteNombreCompleto(clienteToDelete)}</strong>?
                                <br />
                                El cliente será marcado como inactivo y no aparecerá en las búsquedas.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setClienteToDelete(null);
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
                                Desactivar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
