# KTG Ticket System

Sistema de tickets multipropósito (help desk de soporte + gestión de tareas internas) construido con Next.js, Prisma y PostgreSQL.

## Stack

- Next.js 16 (App Router) + TypeScript
- PostgreSQL + Prisma ORM
- NextAuth.js (Auth.js v5) con Credentials provider
- Tailwind CSS
- Resend para notificaciones por email

## Modelo de datos

- **User**: roles `ADMIN`, `AGENT`, `CLIENT`
- **Ticket**: estado (`OPEN`/`IN_PROGRESS`/`RESOLVED`/`CLOSED`), prioridad, tipo (`SUPPORT`/`TASK`), creador y asignado
- **Comment**: hilo de comentarios por ticket
- **Notification**: notificaciones in-app + email (creación, asignación, cambio de estado, nuevo comentario)
- **Tag**: etiquetas opcionales para categorizar tickets

## Setup local

1. Copia las variables de entorno:
   ```bash
   cp .env.example .env
   ```
   Configura `DATABASE_URL` apuntando a tu instancia de PostgreSQL y genera un `NEXTAUTH_SECRET` real:
   ```bash
   openssl rand -base64 32
   ```
   Sin `RESEND_API_KEY` configurada, los emails (verificación, reset de contraseña, notificaciones) solo se loguean en consola en vez de enviarse.

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Corre las migraciones:
   ```bash
   npm run db:migrate
   ```

4. (Opcional) Carga datos de ejemplo:
   ```bash
   npm run db:seed
   ```
   Crea usuarios `admin@ktg.com`, `agent@ktg.com`, `cliente@ktg.com` con contraseña `password123`.

5. Levanta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Roles y permisos

- **CLIENT**: crea tickets y solo ve/comenta los propios.
- **AGENT** / **ADMIN**: ven todos los tickets, pueden asignar, cambiar estado y prioridad.

## Seguridad (Fase 1 completada)

- Verificación de email obligatoria antes de poder iniciar sesión
- Recuperación de contraseña vía token de un solo uso con expiración (1h)
- Rate limiting en registro, login, recuperación de contraseña, creación de tickets y comentarios
  (limitador en memoria — para multi-instancia en producción, migrar a Redis/Upstash)
- Validación de variables de entorno al boot (`src/lib/env.ts`)
- Manejo de errores y logging consistente en todas las API routes
- Límites de longitud en todos los inputs de usuario

## Próximos pasos sugeridos

- Panel de administración de usuarios (alta de agentes)
- Filtros y búsqueda en el listado de tickets
- Adjuntos en tickets/comentarios
- Centro de notificaciones in-app (badge + lista)
- Tests automatizados y CI
- Rate limiter distribuido (Redis/Upstash) para despliegues multi-instancia
