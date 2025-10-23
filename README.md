This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

Edita `.env.local` y agrega las API keys necesarias:

```env
# Google Maps (requerido para módulo de clientes)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu-google-maps-api-key-aqui

# Resend (requerido para envío de emails)
RESEND_API_KEY=re_tu-resend-api-key-aqui
```

**📍 Google Maps:** El módulo de clientes requiere Google Maps API para seleccionar ubicaciones.
Ver [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md) para instrucciones detalladas.

**📧 Resend:** El sistema envía emails automáticos a clientes cuando se completan visitas.
Ver [RESEND_EMAIL_SETUP.md](./RESEND_EMAIL_SETUP.md) para configuración completa.

### 3. Ejecutar el servidor de desarrollo

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Características Principales

- 🔐 **Sistema de autenticación** con roles (Técnico, Supervisor, Administrador)
- 👥 **Gestión de usuarios** completa con asignación de roles
-  **Módulo de clientes** con selector de ubicación en mapa (Google Maps)
- 📅 **Módulo de visitas** con gestión completa de agendación y estados
- 📧 **Notificaciones por email** automáticas al completar visitas (Resend)
- 🗺️ **Vista de detalles** con Google Maps integrado
- 🎨 **UI moderna** con shadcn/ui y Tailwind CSS 4
- 🔔 **Notificaciones toast** para feedback al usuario
- 📱 **Responsive design** optimizado para todos los dispositivos

## Estructura del Proyecto

```
src/
├── app/                    # Páginas y rutas de Next.js
│   ├── dashboard/         # Área protegida del dashboard
│   │   ├── clientes/     # Módulo de gestión de clientes
│   │   ├── visitas/      # Módulo de gestión de visitas
│   │   ├── users/        # Módulo de gestión de usuarios
│   │   └── profile/      # Perfil del usuario
│   └── login/            # Página de login
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de UI (shadcn/ui)
│   └── dashboard/        # Componentes específicos del dashboard
├── lib/                   # Utilidades y configuración
│   ├── api/              # Cliente API y endpoints
│   ├── hooks/            # Custom hooks de React
│   └── types/            # Tipos TypeScript
└── public/               # Archivos estáticos
```

## Documentación

- [Configuración Google Maps](./GOOGLE_MAPS_SETUP.md) - Guía completa para configurar Google Maps API
- [API de Usuarios](./USUARIOS_API.md) - Documentación de endpoints de usuarios
- [API de Visitas](./VISITAS_API.md) - Documentación completa del módulo de visitas

## Tecnologías Utilizadas

- **Next.js 15.5** - Framework React con App Router
- **React 19** - Librería de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos utility-first
- **shadcn/ui** - Componentes de UI accesibles
- **Google Maps API** - Mapas y geolocalización
- **date-fns** - Manejo de fechas y formato i18n
- **Axios** - Cliente HTTP para API

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
