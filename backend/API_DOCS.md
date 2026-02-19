# DevDesk API Documentation

Base URL: `http://localhost:5000`

All responses follow a standardized format:

**Success**
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... }
}
```

**Error**
```json
{
  "success": false,
  "message": "Error description"
}
```

> **Authentication**: Protected routes require an `Authorization: Bearer <token>` header.

---

## Table of Contents

- [Auth](#auth)
  - [Register](#post-authregister)
  - [Login](#post-authlogin)
  - [Get Profile](#get-authme)
- [Tickets](#tickets)
  - [Create Ticket](#post-tickets)
  - [Get My Tickets](#get-ticketsmy)
  - [Get All Tickets](#get-tickets)
  - [Get Ticket by ID](#get-ticketsid)
  - [Update Ticket Status](#patch-ticketsidstatus)
  - [Assign Ticket](#patch-ticketsidassign)
  - [Add Comment](#post-ticketsidcomments)
  - [Delete Ticket](#delete-ticketsid)
- [Dashboard](#dashboard)
  - [Get Dashboard Stats](#get-dashboardstats)

---

## Auth

### `POST /auth/register`

Register a new user account.

**Access:** Public  
**Rate Limit:** 5 requests per 10 minutes

**Request Body**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

| Field      | Type   | Required | Constraints         |
|------------|--------|----------|---------------------|
| `name`     | string | ✅       | Non-empty           |
| `email`    | string | ✅       | Valid email format  |
| `password` | string | ✅       | Min 6 characters    |

**Response `201 Created`**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

**Error Responses**

| Status | Reason                     |
|--------|----------------------------|
| `400`  | Validation failed          |
| `409`  | Email already in use       |
| `429`  | Rate limit exceeded        |

---

### `POST /auth/login`

Authenticate a user and get a JWT token.

**Access:** Public  
**Rate Limit:** 5 requests per 10 minutes

**Request Body**

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response `200 OK`**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    }
  }
}
```

**Error Responses**

| Status | Reason                     |
|--------|----------------------------|
| `400`  | Validation failed          |
| `401`  | Invalid credentials        |
| `429`  | Rate limit exceeded        |

---

### `GET /auth/me`

Get the authenticated user's profile.

**Access:** 🔒 Authenticated (any role)

**Response `200 OK`**

```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

**Error Responses**

| Status | Reason              |
|--------|---------------------|
| `401`  | Missing/invalid JWT |
| `404`  | User not found      |

---

## Tickets

### `POST /tickets`

Create a new support ticket. Optionally attach up to 5 files.

**Access:** 🔒 Authenticated (any role)  
**Content-Type:** `multipart/form-data`

**Request Body**

| Field         | Type     | Required | Description                            |
|---------------|----------|----------|----------------------------------------|
| `title`       | string   | ✅       | Ticket title                           |
| `description` | string   | ✅       | Detailed description                   |
| `priority`    | string   | ❌       | `LOW` \| `MEDIUM` \| `HIGH` (default: `MEDIUM`) |
| `attachments` | file[]   | ❌       | Up to 5 files                          |

**Response `201 Created`**

```json
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "id": "uuid",
    "title": "Cannot login",
    "description": "Error message shown on login page",
    "status": "OPEN",
    "priority": "HIGH",
    "userId": "uuid",
    "assignedToId": null,
    "isDeleted": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**

| Status | Reason                       |
|--------|------------------------------|
| `400`  | Validation failed / too many files |
| `401`  | Unauthorized                 |

---

### `GET /tickets/my`

Get all tickets created by the currently authenticated user.

**Access:** 🔒 Authenticated (any role)

**Response `200 OK`**

```json
{
  "success": true,
  "message": "Tickets fetched successfully",
  "data": [
    {
      "id": "uuid",
      "title": "Cannot login",
      "status": "OPEN",
      "priority": "HIGH",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### `GET /tickets`

Get all tickets (with filtering and pagination).

**Access:** 🔒 `ADMIN` or `AGENT` only

**Query Parameters**

| Parameter      | Type   | Description                                          |
|----------------|--------|------------------------------------------------------|
| `status`       | string | Filter by status: `OPEN` \| `IN_PROGRESS` \| `RESOLVED` \| `CLOSED` |
| `priority`     | string | Filter by priority: `LOW` \| `MEDIUM` \| `HIGH`     |
| `assignedToId` | string | Filter by assigned agent UUID                        |
| `page`         | number | Page number (default: `1`)                           |
| `limit`        | number | Results per page (default: `10`, max: `50`)          |

**Response `200 OK`**

```json
{
  "success": true,
  "message": "All tickets fetched successfully",
  "data": {
    "tickets": [
      {
        "id": "uuid",
        "title": "Cannot login",
        "status": "OPEN",
        "priority": "HIGH",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "user": {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "USER"
        }
      }
    ],
    "total": 42,
    "page": 1,
    "totalPages": 5
  }
}
```

**Error Responses**

| Status | Reason                      |
|--------|-----------------------------|
| `400`  | Invalid status or priority  |
| `403`  | Insufficient role           |

---

### `GET /tickets/:id`

Get a single ticket by ID, including comments and assigned agent.

**Access:** 🔒 Authenticated (any role)

**Path Parameters**

| Parameter | Type   | Description   |
|-----------|--------|---------------|
| `id`      | string | Ticket UUID   |

**Response `200 OK`**

```json
{
  "success": true,
  "message": "Ticket fetched successfully",
  "data": {
    "id": "uuid",
    "title": "Cannot login",
    "description": "Error message shown on login page",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "user": { "id": "uuid", "name": "John Doe", "role": "USER" },
    "assignedTo": { "id": "uuid", "name": "Agent Smith", "role": "AGENT" },
    "comments": [
      {
        "id": "uuid",
        "message": "Working on it.",
        "createdAt": "2024-01-02T00:00:00.000Z",
        "user": { "id": "uuid", "name": "Agent Smith", "role": "AGENT" }
      }
    ]
  }
}
```

**Error Responses**

| Status | Reason           |
|--------|------------------|
| `401`  | Unauthorized     |
| `404`  | Ticket not found |

---

### `PATCH /tickets/:id/status`

Update the status of a ticket. Sends an email notification to the ticket owner.

**Access:** 🔒 `ADMIN` or `AGENT` only

**Path Parameters**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Ticket UUID |

**Request Body**

```json
{
  "status": "IN_PROGRESS"
}
```

| Field    | Type   | Required | Values                                       |
|----------|--------|----------|----------------------------------------------|
| `status` | string | ✅       | `OPEN` \| `IN_PROGRESS` \| `RESOLVED` \| `CLOSED` |

**Response `200 OK`**

```json
{
  "success": true,
  "message": "Ticket status updated successfully",
  "data": {
    "id": "uuid",
    "status": "IN_PROGRESS",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

**Error Responses**

| Status | Reason             |
|--------|--------------------|
| `400`  | Invalid status     |
| `403`  | Insufficient role  |
| `404`  | Ticket not found   |

---

### `PATCH /tickets/:id/assign`

Assign a ticket to an agent. Sends email notifications to both the ticket owner and the assigned agent.

**Access:** 🔒 `ADMIN` only

**Path Parameters**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Ticket UUID |

**Request Body**

```json
{
  "assignedToId": "agent-uuid"
}
```

| Field          | Type   | Required | Description                          |
|----------------|--------|----------|--------------------------------------|
| `assignedToId` | string | ✅       | UUID of the agent to assign          |

**Response `200 OK`**

```json
{
  "success": true,
  "message": "Ticket assigned successfully",
  "data": {
    "id": "uuid",
    "assignedToId": "agent-uuid",
    "assignedTo": {
      "id": "agent-uuid",
      "name": "Agent Smith",
      "email": "agent@example.com",
      "role": "AGENT"
    }
  }
}
```

**Error Responses**

| Status | Reason                        |
|--------|-------------------------------|
| `400`  | User is not an agent          |
| `403`  | Insufficient role             |
| `404`  | Ticket or agent not found     |

---

### `POST /tickets/:id/comments`

Add a comment to a ticket.

**Access:** 🔒 Authenticated (any role)  
> `USER` role can only comment on their own tickets.

**Path Parameters**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Ticket UUID |

**Request Body**

```json
{
  "message": "This is still happening."
}
```

| Field     | Type   | Required | Constraints |
|-----------|--------|----------|-------------|
| `message` | string | ✅       | Non-empty   |

**Response `201 Created`**

```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "id": "uuid",
    "message": "This is still happening.",
    "createdAt": "2024-01-02T00:00:00.000Z",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "role": "USER"
    }
  }
}
```

**Error Responses**

| Status | Reason                               |
|--------|--------------------------------------|
| `400`  | Validation failed                    |
| `403`  | USER commenting on another's ticket  |
| `404`  | Ticket not found                     |

---

### `DELETE /tickets/:id`

Soft-delete a ticket (sets `isDeleted: true`).

**Access:** 🔒 `ADMIN` (any ticket) or `USER` (own tickets only)

**Path Parameters**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Ticket UUID |

**Response `200 OK`**

```json
{
  "success": true,
  "message": "Ticket deleted successfully",
  "data": {
    "id": "uuid",
    "isDeleted": true
  }
}
```

**Error Responses**

| Status | Reason                              |
|--------|-------------------------------------|
| `403`  | USER trying to delete others' ticket|
| `404`  | Ticket not found                    |

---

## Dashboard

### `GET /dashboard/stats`

Get aggregate ticket statistics for the dashboard.

**Access:** 🔒 `ADMIN` or `AGENT` only  
> For `AGENT` role, `assignedToMe` reflects only tickets assigned to that agent.

**Response `200 OK`**

```json
{
  "success": true,
  "message": "Dashboard stats fetched successfully",
  "data": {
    "total": 120,
    "open": 45,
    "inProgress": 30,
    "resolved": 35,
    "closed": 10,
    "highPriority": 20,
    "mediumPriority": 70,
    "lowPriority": 30,
    "assignedToMe": 12
  }
}
```

| Field            | Description                                     |
|------------------|-------------------------------------------------|
| `total`          | Total non-deleted tickets                       |
| `open`           | Tickets with status `OPEN`                      |
| `inProgress`     | Tickets with status `IN_PROGRESS`               |
| `resolved`       | Tickets with status `RESOLVED`                  |
| `closed`         | Tickets with status `CLOSED`                    |
| `highPriority`   | Tickets with `HIGH` priority                    |
| `mediumPriority` | Tickets with `MEDIUM` priority                  |
| `lowPriority`    | Tickets with `LOW` priority                     |
| `assignedToMe`   | Tickets assigned to the requesting agent (`0` for ADMINs) |

**Error Responses**

| Status | Reason            |
|--------|-------------------|
| `401`  | Unauthorized      |
| `403`  | Insufficient role |

---

## Data Models

### User

| Field       | Type     | Description                            |
|-------------|----------|----------------------------------------|
| `id`        | UUID     | Unique identifier                      |
| `name`      | string   | Display name                           |
| `email`     | string   | Unique email address                   |
| `role`      | enum     | `USER` \| `AGENT` \| `ADMIN`           |
| `createdAt` | datetime | Account creation timestamp             |

### Ticket

| Field          | Type     | Description                                        |
|----------------|----------|----------------------------------------------------|
| `id`           | UUID     | Unique identifier                                  |
| `title`        | string   | Ticket title                                       |
| `description`  | string   | Detailed issue description                         |
| `status`       | enum     | `OPEN` \| `IN_PROGRESS` \| `RESOLVED` \| `CLOSED`  |
| `priority`     | enum     | `LOW` \| `MEDIUM` \| `HIGH`                        |
| `userId`       | UUID     | Ticket creator (User)                              |
| `assignedToId` | UUID?    | Assigned agent (nullable)                          |
| `isDeleted`    | boolean  | Soft delete flag                                   |
| `createdAt`    | datetime | Creation timestamp                                 |
| `updatedAt`    | datetime | Last update timestamp                              |

### Comment

| Field      | Type     | Description             |
|------------|----------|-------------------------|
| `id`       | UUID     | Unique identifier       |
| `message`  | string   | Comment text            |
| `ticketId` | UUID     | Associated ticket       |
| `userId`   | UUID     | Comment author          |
| `createdAt`| datetime | Creation timestamp      |

### Attachment

| Field      | Type     | Description                         |
|------------|----------|-------------------------------------|
| `id`       | UUID     | Unique identifier                   |
| `fileName` | string   | Original file name                  |
| `filePath` | string   | Cloudinary URL or local path        |
| `mimeType` | string   | MIME type (e.g., `image/png`)       |
| `ticketId` | UUID     | Associated ticket                   |
| `createdAt`| datetime | Upload timestamp                    |
