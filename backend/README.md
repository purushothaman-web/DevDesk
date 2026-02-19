# DevDesk Backend

A RESTful API backend for **DevDesk** — a help desk ticketing system. Built with Node.js, Express, Prisma ORM, and PostgreSQL.

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Runtime      | Node.js (ESM)                       |
| Framework    | Express v5                          |
| ORM          | Prisma                              |
| Database     | PostgreSQL                          |
| Auth         | JWT (jsonwebtoken) + bcrypt         |
| Validation   | Zod                                 |
| File Uploads | Multer + Cloudinary                 |
| Email        | Nodemailer                          |
| Rate Limiting| express-rate-limit                  |
| Logging      | Morgan                              |

---

## Prerequisites

- Node.js >= 18
- PostgreSQL database
- A Cloudinary account (for file attachment uploads)
- An SMTP provider (e.g. Mailtrap, Gmail) for email notifications

---

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd backend
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable            | Description                                      |
|---------------------|--------------------------------------------------|
| `DATABASE_URL`      | PostgreSQL connection string                     |
| `PORT`              | Server port (default: `5000`)                    |
| `JWT_SECRET`        | Secret key for signing JWTs                      |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                        |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                           |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                        |
| `EMAIL_HOST`        | SMTP host                                        |
| `EMAIL_PORT`        | SMTP port                                        |
| `EMAIL_USER`        | SMTP username                                    |
| `EMAIL_PASS`        | SMTP password                                    |

### 3. Run database migrations

```bash
npm run prisma:migrate
# or for production migrations:
npx prisma migrate deploy
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Start the server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

The server will start on `http://localhost:5000` (or your configured `PORT`).

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Prisma migration history
├── src/
│   ├── config/              # App configuration
│   ├── controllers/         # Route handler logic
│   │   ├── auth.controller.js
│   │   ├── ticket.controller.js
│   │   └── dashboard.controller.js
│   ├── db/
│   │   └── client.js        # Prisma client instance
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT authentication
│   │   ├── role.middleware.js       # Role-based access control
│   │   ├── upload.middleware.js     # Multer + Cloudinary config
│   │   ├── ratelimit.middleware.js  # Rate limiting rules
│   │   └── error.middleware.js      # Global error handler
│   ├── routes/
│   │   ├── auth.route.js
│   │   ├── ticket.routes.js
│   │   └── dashboard.route.js
│   ├── services/
│   │   └── mail.service.js   # Email notification logic
│   ├── utils/
│   │   ├── jwt.js            # Token generation helper
│   │   └── response.js       # Standardized ApiResponse utility
│   └── validators/           # Zod schemas for request validation
├── uploads/                  # Temporary local upload directory
├── server.js                 # Express app entry point
├── package.json
├── .env.example
└── API_DOCS.md               # Full API reference
```

---

## Available Scripts

| Script                  | Description                              |
|-------------------------|------------------------------------------|
| `npm run dev`           | Start dev server with nodemon            |
| `npm start`             | Start production server                  |
| `npm run prisma:generate` | Regenerate Prisma client               |
| `npm run prisma:migrate`  | Run migrations (dev mode)              |

---

## API Overview

The API is organized around three main resource groups:

| Prefix        | Description                                      |
|---------------|--------------------------------------------------|
| `/auth`       | Registration, login, profile                     |
| `/tickets`    | Ticket CRUD, status/assignment, comments         |
| `/dashboard`  | Stats for admins and agents                      |

For full request/response details, see [`API_DOCS.md`](./API_DOCS.md).

---

## Authentication

The API uses **JWT Bearer Token** authentication.

Include the token in the `Authorization` header for all protected routes:

```
Authorization: Bearer <your_token>
```

---

## User Roles

| Role    | Permissions                                                |
|---------|------------------------------------------------------------|
| `USER`  | Create tickets, view own tickets, add comments             |
| `AGENT` | View all tickets, update ticket status, add comments       |
| `ADMIN` | Full access — assign tickets, delete any ticket, dashboard |

---

## Rate Limiting

| Scope     | Limit                            |
|-----------|----------------------------------|
| Global    | 100 requests per 15 minutes      |
| Login     | 5 attempts per 10 minutes        |
| Register  | 5 attempts per 10 minutes        |

---

## Error Handling

All errors follow a consistent JSON structure:

```json
{
  "success": false,
  "message": "Error description"
}
```

Validation errors (Zod) return HTTP `400`. Authentication errors return `401`. Authorization errors return `403`.

---

## License

ISC
