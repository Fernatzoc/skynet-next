import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            visitaId,
            clienteEmail,
            clienteNombre,
            visitaFecha,
            visitaHora,
            visitaEstado,
            visitaDireccion,
            visitaDescripcion,
            registroFecha,
            registroObservaciones,
            registroResultado,
            tecnicoNombre,
            tecnicoTelefono
        } = body;

        // Validar que tenemos el email del cliente
        if (!clienteEmail) {
            return NextResponse.json(
                { error: 'Email del cliente es requerido' },
                { status: 400 }
            );
        }

        // Formatear la fecha para mejor legibilidad
        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

        // Crear el contenido HTML del email
        const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border: 1px solid #e5e7eb;
            }
            .section {
              background: white;
              padding: 20px;
              margin-bottom: 20px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #667eea;
              margin-bottom: 15px;
              border-bottom: 2px solid #667eea;
              padding-bottom: 8px;
            }
            .info-row {
              display: flex;
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: bold;
              color: #6b7280;
              min-width: 150px;
            }
            .info-value {
              color: #1f2937;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 14px;
              background: #f9fafb;
              border-radius: 0 0 10px 10px;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 14px;
              font-weight: 600;
            }
            .badge-success {
              background: #d1fae5;
              color: #065f46;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">🔧 SkyNet - Reporte de Visita</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Visita #${visitaId}</p>
          </div>
          
          <div class="content">
            <p>Estimado(a) <strong>${clienteNombre}</strong>,</p>
            <p>Le informamos que la visita técnica programada ha sido <span class="badge badge-success">COMPLETADA</span>.</p>
            
            <div class="section">
              <div class="section-title">📋 Información de la Visita</div>
              <div class="info-row">
                <span class="info-label">Fecha:</span>
                <span class="info-value">${formatDate(visitaFecha)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Hora:</span>
                <span class="info-value">${visitaHora}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Estado:</span>
                <span class="info-value">${visitaEstado}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Dirección:</span>
                <span class="info-value">${visitaDireccion}</span>
              </div>
              ${visitaDescripcion ? `
              <div class="info-row">
                <span class="info-label">Descripción:</span>
                <span class="info-value">${visitaDescripcion}</span>
              </div>
              ` : ''}
            </div>

            <div class="section">
              <div class="section-title">👨‍🔧 Técnico Asignado</div>
              <div class="info-row">
                <span class="info-label">Nombre:</span>
                <span class="info-value">${tecnicoNombre}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Teléfono:</span>
                <span class="info-value">${tecnicoTelefono}</span>
              </div>
            </div>

            ${registroFecha ? `
            <div class="section">
              <div class="section-title">✅ Registro de Finalización</div>
              <div class="info-row">
                <span class="info-label">Fecha de Finalización:</span>
                <span class="info-value">${formatDate(registroFecha)}</span>
              </div>
              ${registroResultado ? `
              <div class="info-row">
                <span class="info-label">Resultado:</span>
                <span class="info-value">${registroResultado}</span>
              </div>
              ` : ''}
              ${registroObservaciones ? `
              <div class="info-row">
                <span class="info-label">Observaciones:</span>
                <span class="info-value">${registroObservaciones}</span>
              </div>
              ` : ''}
            </div>
            ` : ''}

            <p style="margin-top: 30px;">Si tiene alguna duda o consulta sobre este reporte, no dude en contactarnos.</p>
            <p><strong>Gracias por confiar en SkyNet.</strong></p>
          </div>

          <div class="footer">
            <p>Este es un correo automático, por favor no responder.</p>
            <p>© ${new Date().getFullYear()} SkyNet - Sistema de Gestión de Visitas Técnicas</p>
          </div>
        </body>
      </html>
    `;

        // Enviar el email
        const { data, error } = await resend.emails.send({
            from: 'SkyNet <onboarding@resend.dev>',
            to: [clienteEmail],
            subject: `Reporte de Visita #${visitaId} - Visita Completada`,
            html: emailHtml,
        });

        if (error) {
            console.error('Error al enviar email:', error);
            return NextResponse.json(
                { error: 'Error al enviar el email', details: error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Email enviado correctamente',
            emailId: data?.id
        });

    } catch (error) {
        console.error('Error en la API de envío de email:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
