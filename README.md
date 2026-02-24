# DevDesk: Multi-Tenant Help Desk System

## The Story of DevDesk

DevDesk began as a fully-featured, single-tenant support ticketing system designed to help teams track user issues, assign agents, and monitor resolution workflows. As the application matured, it became clear that a single-tenant architecture was a bottleneck for scalability.

To solve this, DevDesk evolved into a robust **Multi-Tenant SaaS Architecture**. The system now elegantly supports countless distinct organizations operating under a single centralized platform, while guaranteeing strictly enforced data isolation.

To provide ultimate control over the platform, a global **Super Admin** layer was introduced. Super Admins bypass all tenant-level restrictions, allowing them to oversee, manage, and debug the platform across all isolated organizations from a single pane of glass.

---

## Key Capabilities

### 🏢 True Multitenancy
- **Isolated Environments**: Users, tickets, comments, attachments, and dashboard metrics are strictly bound to an `Organization`.
- **Tenant Autonomy**: When a new user registers, an isolated Organization is automatically provisioned for them. They become the localized `ADMIN` and can invite their own `AGENT`s and `USER`s to their closed ecosystem.

### 🛡️ Global Super Admin Oversight
- **Global Context**: The `SUPER_ADMIN` role operates outside the boundaries of any single organization.
- **Platform Management**: Super Admins have their own dedicated "Organizations" dashboard to monitor the usage (ticket volume, user count) of all tenants simultaneously.
- **Secure Bootstrapping**: To prevent security vulnerabilities, the Super Admin account is never manually promoted in the UI. Instead, it is securely seeded on backend startup using local environment variables (`SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`).

### 🎫 Core Ticketing Features
- **Role-Based Access Control (RBAC)**:
  - `USER`: Submits tickets and tracks their own support requests.
  - `AGENT`: Works across the tenant to resolve issues, update statuses, and communicate with users.
  - `ADMIN`: Manages the tenant's team, assigns tickets to agents, and views organization-wide analytical dashboards.
- **Rich Activity Feeds**: Every status change, priority shift, and assignment is tracked in an immutable activity log.
- **File Attachments**: Users can securely attach images and documents to their tickets (powered by Cloudinary).

---

## Technology Stack

**Frontend (React + Vite)**
- **UI Architecture**: React functional components using Hooks and Context API.
- **Routing**: `react-router-dom` with secure, role-based route guards.
- **Styling**: Tailwind CSS for a modern, responsive user interface.
- **API Interactions**: Centralized Axios client with automatic JWT token injection and 401 interception.

**Backend (Node.js + Express)**
- **Database**: PostgreSQL (hosted on NeonDB) managed via Prisma ORM.
- **Authentication**: Stateless JSON Web Tokens (JWT) and bcrypt password hashing.
- **Security**: Robust rate-limiting and comprehensive `zod` schema validation for all incoming requests.
- **Architecture**: Clean Model-View-Controller (MVC) separation of concerns.

---

## Getting Started

### 1. Backend Setup
Navigate to the `backend/` directory:
1. Copy `.env.example` to `.env` and fill in your connection strings and SMTP credentials.
2. Ensure you set the `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` in your `.env`.
3. Install dependencies: `npm install`
4. Apply Prisma migrations to your database: `npx prisma migrate dev`
5. Start the server: `npm run dev`

Read the [Backend README](./backend/README.md) and [API Docs](./backend/API_DOCS.md) for deeper details.

### 2. Frontend Setup
Navigate to the `frontend/` directory:
1. Ensure your `.env` connects to the running local backend (`VITE_BASE_URL=http://localhost:5000`).
2. Install dependencies: `npm install`
3. Start Vite: `npm run dev`

### 3. Usage
- Launch the frontend.
- Log in using your Super Admin credentials to view the global Organizations dashboard.
- Create new accounts from the standard Sign-Up page to mimic generating isolated tenant workspaces!
