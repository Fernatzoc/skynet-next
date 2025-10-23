'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar, Plus, Users, MapPin } from 'lucide-react';
import { useState } from 'react';

interface PlannedVisit {
    id: string;
    clientName: string;
    address: string;
    technician: string;
    date: string;
    time: string;
    notes: string;
}

// Mock data
const mockTechnicians = [
    { id: '1', name: 'Juan Pérez' },
    { id: '2', name: 'María González' },
    { id: '3', name: 'Carlos Rodríguez' },
];

const mockClients = [
    { id: '1', name: 'Empresa ABC', address: 'Av. Principal 123' },
    { id: '2', name: 'Corporación XYZ', address: 'Calle Secundaria 456' },
    { id: '3', name: 'Industrias LMN', address: 'Boulevard Norte 789' },
];

export default function PlanVisitsPage() {
    const [visits, setVisits] = useState<PlannedVisit[]>([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        clientName: '',
        address: '',
        technician: '',
        date: '',
        time: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newVisit: PlannedVisit = {
            id: Date.now().toString(),
            ...formData,
        };

        setVisits([...visits, newVisit]);
        setFormData({
            clientName: '',
            address: '',
            technician: '',
            date: '',
            time: '',
            notes: '',
        });
        setOpen(false);
    };

    return (
        <ProtectedRoute permission="canPlanVisits">
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Planificar Visitas</h1>
                            <p className="text-muted-foreground mt-2">
                                Programa y asigna visitas a tu equipo de técnicos
                            </p>
                        </div>

                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nueva Visita
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Planificar Nueva Visita</DialogTitle>
                                    <DialogDescription>
                                        Completa los detalles para programar una nueva visita técnica
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="clientName">Cliente</Label>
                                            <select
                                                id="clientName"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={formData.clientName}
                                                onChange={(e) => {
                                                    const client = mockClients.find(c => c.name === e.target.value);
                                                    setFormData({
                                                        ...formData,
                                                        clientName: e.target.value,
                                                        address: client?.address || '',
                                                    });
                                                }}
                                                required
                                            >
                                                <option value="">Seleccionar cliente</option>
                                                {mockClients.map((client) => (
                                                    <option key={client.id} value={client.name}>
                                                        {client.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="technician">Técnico Asignado</Label>
                                            <select
                                                id="technician"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={formData.technician}
                                                onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                                                required
                                            >
                                                <option value="">Seleccionar técnico</option>
                                                {mockTechnicians.map((tech) => (
                                                    <option key={tech.id} value={tech.name}>
                                                        {tech.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">Dirección</Label>
                                        <Input
                                            id="address"
                                            value={formData.address}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Fecha</Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={formData.date}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="time">Hora</Label>
                                            <Input
                                                id="time"
                                                type="time"
                                                value={formData.time}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, time: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notas / Descripción del Trabajo</Label>
                                        <textarea
                                            id="notes"
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            placeholder="Describe el trabajo a realizar..."
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                            Cancelar
                                        </Button>
                                        <Button type="submit">Programar Visita</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Visitas Programadas</p>
                                    <p className="text-2xl font-bold">{visits.length}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Técnicos Activos</p>
                                    <p className="text-2xl font-bold">{mockTechnicians.length}</p>
                                </div>
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Esta Semana</p>
                                    <p className="text-2xl font-bold">
                                        {visits.filter(v => {
                                            const visitDate = new Date(v.date);
                                            const now = new Date();
                                            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                                            return visitDate >= now && visitDate <= weekFromNow;
                                        }).length}
                                    </p>
                                </div>
                                <Calendar className="h-8 w-8 text-blue-500" />
                            </div>
                        </Card>
                    </div>

                    {/* Visits List */}
                    <Card>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Visitas Programadas</h2>

                            {visits.length > 0 ? (
                                <div className="space-y-4">
                                    {visits.map((visit) => (
                                        <div
                                            key={visit.id}
                                            className="flex items-start justify-between p-4 border rounded-lg"
                                        >
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-semibold">{visit.clientName}</h3>
                                                    <span className="text-sm text-muted-foreground">
                                                        {new Date(visit.date).toLocaleDateString('es-ES')} - {visit.time}
                                                    </span>
                                                </div>

                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{visit.address}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4" />
                                                        <span>Técnico: {visit.technician}</span>
                                                    </div>
                                                    {visit.notes && (
                                                        <p className="mt-2">{visit.notes}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm">Editar</Button>
                                                <Button variant="outline" size="sm">Cancelar</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No hay visitas programadas</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Comienza programando una nueva visita para tu equipo
                                    </p>
                                    <Button onClick={() => setOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Programar Primera Visita
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
