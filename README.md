# HostDash - Simplified Hosting SaaS

A modern, modular hosting management platform (WHMCS simplified) built with Node.js, Express, Prisma, PostgreSQL, and React.

## Features

### Client Area
- **Dashboard**: Overview of active services and credit balance.
- **Store**: Multi-category product browsing (VPS, Game Servers) with easy ordering.
- **Service Management**: Power controls (Start/Stop/Reboot) with console simulation.
- **Billing**: Invoice management and balance-based automated payments.
- **Support**: Real-time ticket system for technical assistance.

### Admin Area
- **Global Dashboard**: Statistics on revenue, users, services, and tickets.
- **User Management**: Complete CRUD with user impersonation ("Login as Client").
- **Catalog Management**: Category and Product CRUD with configuration JSON.
- **Order & Service Tracking**: Monitor all system orders and active service instances.
- **Support Queue**: Respond to customer inquiries from a central interface.

### Provisioning System
- Modular adapter architecture.
- Included simulations for **Proxmox** (VPS) and **Pterodactyl** (Game Servers).

## Tech Stack
- **Backend**: Node.js, Express, TypeScript, Prisma (ORM), JWT.
- **Frontend**: React, Vite, Tailwind CSS, Lucide React, Axios.
- **Database**: PostgreSQL (via Docker).

## Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose

### Installation

1. **Clone the repository**
2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Start database
   docker compose up -d
   # Generate Prisma client & Seed data
   npx prisma generate
   npx prisma db seed
   # Start dev server
   npm run dev
   ```
3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Development
- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:3000`

## Production
- Build frontend: `cd frontend && npm run build`
- Build backend: `cd backend && npm run build`
