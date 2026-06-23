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
   Configura `DATABASE_URL` apuntando a tu instancia de PostgreSQL.

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

## Próximos pasos sugeridos

- Panel de administración de usuarios (alta de agentes)
- Filtros y búsqueda en el listado de tickets
- Adjuntos en tickets/comentarios
- Centro de notificaciones in-app (badge + lista)
