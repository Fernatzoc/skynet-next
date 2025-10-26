import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFColumn {
    header: string;
    dataKey: string;
}

interface PDFOptions {
    title: string;
    subtitle?: string;
    columns: PDFColumn[];
    data: Record<string, unknown>[];
    fileName?: string;
}

export class PDFGenerator {
    private doc: jsPDF;

    constructor() {
        this.doc = new jsPDF();
    }

    private addHeader(title: string, subtitle?: string) {
        // Logo o título principal
        this.doc.setFontSize(20);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('SkyNet', 14, 15);

        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text('Sistema de Gestión de Visitas', 14, 20);

        // Línea separadora
        this.doc.setLineWidth(0.5);
        this.doc.line(14, 23, 196, 23);

        // Título del reporte
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(title, 14, 32);

        // Subtítulo si existe
        if (subtitle) {
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(subtitle, 14, 38);
        }

        // Fecha de generación
        const fecha = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        this.doc.setFontSize(9);
        this.doc.setTextColor(100);
        this.doc.text(`Generado: ${fecha}`, 14, subtitle ? 44 : 38);
        this.doc.setTextColor(0);
    }

    private addFooter() {
        const pageCount = this.doc.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);
            this.doc.setFontSize(8);
            this.doc.setTextColor(100);
            this.doc.text(
                `Página ${i} de ${pageCount}`,
                this.doc.internal.pageSize.getWidth() / 2,
                this.doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }
        this.doc.setTextColor(0);
    }

    generateTable(options: PDFOptions) {
        this.addHeader(options.title, options.subtitle);

        const startY = options.subtitle ? 50 : 44;

        autoTable(this.doc, {
            startY,
            head: [options.columns.map(col => col.header)],
            body: options.data.map(row =>
                options.columns.map(col => {
                    const value = row[col.dataKey];
                    return value !== null && value !== undefined ? String(value) : '-';
                })
            ),
            theme: 'striped',
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center'
            },
            styles: {
                fontSize: 9,
                cellPadding: 3,
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            margin: { top: 10, left: 14, right: 14 },
        });

        this.addFooter();
    }

    save(fileName: string = 'reporte.pdf') {
        this.doc.save(fileName);
    }

    getBlob(): Blob {
        return this.doc.output('blob');
    }

    getDataUrl(): string {
        return this.doc.output('dataurlstring');
    }
}

// Función helper para generar PDF de tabla simple
export function generateTablePDF(options: PDFOptions) {
    const generator = new PDFGenerator();
    generator.generateTable(options);
    generator.save(options.fileName || 'reporte.pdf');
}
