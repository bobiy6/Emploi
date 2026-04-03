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
- **Proxmox VE Integration**: Automates VPS creation, suspension, and power management.
- **Pterodactyl Integration**: Automates Game server deployment.

### Proxmox Setup Guide
To connect a Proxmox node in the Admin Infrastructure panel:
1.  **In Proxmox**:
    - Go to **Datacenter > Permissions > API Tokens**.
    - Click **Add**. Select a user (e.g., `root@pam`) and give it a Token ID (e.g., `hostdash`).
    - **IMPORTANT**: Uncheck "Privilege Separation" unless you know how to configure fine-grained ACLs.
    - Copy the **Token ID** (e.g., `root@pam!hostdash`) and the **Secret**.
2.  **In HostDash Admin**:
    - Go to `/admin/infrastructure`.
    - Click **Add Physical Server**.
    - **API URL**: `https://YOUR_PROXMOX_IP:8006/api2/json`
    - **API Key / Token ID**: The Token ID from step 1.
    - **API Secret**: The Secret from step 1.
    - **Default Node**: The name of your Proxmox node (e.g., `pve`).
3.  **Test**: Click "Test Connect" to verify.

### Pterodactyl Setup Guide
To connect a Pterodactyl Panel:
1.  **In Pterodactyl**:
    - Go to **Admin Control Panel > Application API**.
    - Click **Create New**.
    - Give it a description (e.g., `HostDash`).
    - Select **Read & Write** for all categories required (Nodes, Servers, Users).
    - Copy the **API Key** (starts with `ptla_`).
2.  **In HostDash Admin**:
    - Go to `/admin/infrastructure`.
    - Click **Add Physical Server**.
    - **Server Type**: Pterodactyl.
    - **API URL**: Your panel URL (e.g., `https://panel.example.com`).
    - **Application API Key**: The key from step 1.
3.  **Test**: Click "Test Configuration" to verify.

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

## Database Management
To easily view, edit, or delete data (users, products, services) in the database:
1. Open a terminal in the `backend` folder.
2. Run: `npx prisma studio`
3. This will open a web interface in your browser (usually at `http://localhost:5555`) where you can manage all your tables.
