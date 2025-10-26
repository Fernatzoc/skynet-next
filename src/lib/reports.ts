import { generateTablePDF } from './pdf-generator';
import type { Visita, Cliente, User } from './api/endpoints';

// ==========================================
// REPORTES DE VISITAS
// ==========================================

export function generateVisitasPDF(visitas: Visita[], filtros?: string) {
    const data = visitas.map(v => ({
        id: v.id,
        cliente: v.nombreCliente,
        tecnico: v.nombreTecnico,
        tipo: v.tipoVisita,
        estado: v.estadoVisita,
        fecha: new Date(v.fechaHoraProgramada).toLocaleDateString('es-ES'),
    }));

    generateTablePDF({
        title: 'Reporte de Visitas',
        subtitle: filtros || `Total de visitas: ${visitas.length}`,
        columns: [
            { header: 'ID', dataKey: 'id' },
            { header: 'Cliente', dataKey: 'cliente' },
            { header: 'Técnico', dataKey: 'tecnico' },
            { header: 'Tipo', dataKey: 'tipo' },
            { header: 'Estado', dataKey: 'estado' },
            { header: 'Fecha', dataKey: 'fecha' },
        ],
        data,
        fileName: `visitas_${new Date().toISOString().split('T')[0]}.pdf`
    });
}

// ==========================================
// REPORTES DE CLIENTES
// ==========================================

export function generateClientesPDF(clientes: Cliente[]) {
    const data = clientes.map(c => ({
        id: c.id,
        nombre: `${c.primerNombre} ${c.primerApellido}`,
        telefono: c.telefono,
        email: c.correoElectronico,
        direccion: c.direccion,
        estado: c.estado ? 'Activo' : 'Inactivo',
    }));

    generateTablePDF({
        title: 'Reporte de Clientes',
        subtitle: `Total de clientes: ${clientes.length}`,
        columns: [
            { header: 'ID', dataKey: 'id' },
            { header: 'Nombre', dataKey: 'nombre' },
            { header: 'Teléfono', dataKey: 'telefono' },
            { header: 'Email', dataKey: 'email' },
            { header: 'Dirección', dataKey: 'direccion' },
            { header: 'Estado', dataKey: 'estado' },
        ],
        data,
        fileName: `clientes_${new Date().toISOString().split('T')[0]}.pdf`
    });
}

// ==========================================
// REPORTES DE USUARIOS
// ==========================================

export function generateUsuariosPDF(usuarios: User[]) {
    const data = usuarios.map(u => ({
        id: u.id,
        nombre: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Sin nombre',
        email: u.email,
        telefono: u.phone || 'N/A',
        roles: u.roles.join(', '),
        estado: u.status ? 'Activo' : 'Inactivo',
    }));

    generateTablePDF({
        title: 'Reporte de Usuarios',
        subtitle: `Total de usuarios: ${usuarios.length}`,
        columns: [
            { header: 'ID', dataKey: 'id' },
            { header: 'Nombre', dataKey: 'nombre' },
            { header: 'Email', dataKey: 'email' },
            { header: 'Teléfono', dataKey: 'telefono' },
            { header: 'Roles', dataKey: 'roles' },
            { header: 'Estado', dataKey: 'estado' },
        ],
        data,
        fileName: `usuarios_${new Date().toISOString().split('T')[0]}.pdf`
    });
}
