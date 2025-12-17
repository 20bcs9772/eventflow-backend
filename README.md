# EventFlow Backend

A real-time event companion app backend built with Node.js, Express, TypeScript, PostgreSQL, Prisma, and Socket.IO.

## Features

- ✅ Event management (CRUD) with short codes, visibility, and event types
- ✅ Schedule item management with ordering and creator tracking
- ✅ Real-time announcements via Socket.IO
- ✅ Push notifications via Firebase Admin SDK with notification logging
- ✅ Guest event joining with RSVP status tracking
- ✅ Multi-device support for push notifications
- ✅ Soft delete support for all entities
- ✅ RESTful API with proper structure

## Tech Stack

- **Node.js** with **Express**
- **TypeScript**
- **PostgreSQL** with **Prisma ORM**
- **Socket.IO** for real-time updates
- **Firebase Admin SDK** for push notifications
- **Zod** for validation
- **nanoid** for unique short code generation

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Firebase project with Admin SDK credentials

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your database URL and Firebase credentials.

3. **Set up database & Prisma:**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate
   ```

4. **Run migrations (create/update DB schema):**
   ```bash
   npm run prisma:migrate
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database, Firebase configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Error handling, validation
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── socket/          # Socket.IO handlers
│   ├── types/           # TypeScript types and Zod schemas
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── .env.example         # Environment variables template
└── package.json
```

## Database Schema

### Core Models

- **User**: Users (guests/admins) with soft delete support
- **Device**: FCM tokens and device types (IOS/ANDROID/WEB) - supports multiple devices per user
- **Event**: Events with short codes, visibility (PUBLIC/PRIVATE/UNLISTED), and types (WEDDING/BIRTHDAY/CORPORATE/COLLEGE_FEST/OTHER)
- **ScheduleItem**: Schedule items with ordering and creator tracking
- **Announcement**: Real-time announcements
- **GuestEvent**: Guest-event relationships with RSVP status (INVITED/JOINED/CHECKED_IN)
- **NotificationLog**: Push notification delivery logs

### Key Features

- **Soft Deletes**: All models support soft deletion via `deletedAt` field
- **Short Codes**: Events have unique 8-character alphanumeric codes for easy joining
- **Event Visibility**: Control who can see and join events
- **RSVP Tracking**: Track guest status from invitation to check-in
- **Multi-Device**: Users can register multiple devices for push notifications
- **Notification Logging**: All push notifications are logged for tracking

## API Endpoints (high level)

> For full, interactive documentation, open Swagger UI at: `GET /api/docs`

### Auth
- `POST /api/auth/register` - Register new user (Firebase-authenticated)
- `POST /api/auth/login` - Login existing user (or create for social)
- `GET /api/auth/me` - Get current user profile
- `PATCH /api/auth/profile` - Update profile
- `DELETE /api/auth/account` - Delete account
- `POST /api/auth/verify` - Verify token validity

### Events
- `POST /api/events` - Create event (generates `shortCode` automatically)
- `GET /api/events` - List/search accessible events (supports `?q=` and pagination)
- `GET /api/events/:id` - Get event by ID
- `GET /api/events/code/:shortCode` - Get event by short code
- `GET /api/events/admin` - Get events by admin
- `GET /api/events/public` - Get public events
- `GET /api/events/happening-now` - Get events happening in next 24h
- `GET /api/events/types` - Get available event types
- `GET /api/events/types/:type` - Get events by type
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Soft delete event

### Schedule Items
- `POST /api/schedule` - Create schedule item (requires x-creator-id header)
- `GET /api/schedule/event/:eventId` - Get schedule items for event (ordered by orderIndex, then startTime)
- `GET /api/schedule/:id` - Get schedule item by ID
- `PATCH /api/schedule/:id` - Update schedule item
- `DELETE /api/schedule/:id` - Soft delete schedule item
- `PATCH /api/schedule/reorder` - Bulk reorder schedule items for an event

### Announcements
- `POST /api/announcements` - Create announcement (requires x-sender-id header)
- `GET /api/announcements/event/:eventId` - Get announcements for event
- `GET /api/announcements/:id` - Get announcement by ID
- `PATCH /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Soft delete announcement

### Guest Events
- `POST /api/guests/join` - Join an event (by eventId or shortCode)
- `GET /api/guests/my-events` - Get events for currently authenticated user
- `GET /api/guests/user/:userId` - Get events for user
- `GET /api/guests/event/:eventId` - Get guests for event
- `GET /api/guests/:userId/:eventId` - Get guest-event record for a specific user and event
- `PATCH /api/guests/:userId/:eventId/status` - Update guest status (INVITED/JOINED/CHECKED_IN)
- `DELETE /api/guests/:eventId` - Leave event (soft delete)

### Users
- `POST /api/users` - Create user
- `GET /api/users` - List/search users (admin-only, supports `?q=` and pagination)
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Soft delete user

### Devices
- `POST /api/devices` - Register device (FCM token)
- `GET /api/devices/user/:userId` - Get devices for user
- `GET /api/devices/:id` - Get device by ID
- `PATCH /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Soft delete device

## Socket.IO Events

### Client to Server
- `joinEvent(eventId)` - Join an event room
- `leaveEvent(eventId)` - Leave an event room

### Server to Client
- `scheduleUpdated` - Emitted when schedule is updated
- `announcement` - Emitted when new announcement is created (also sends push notifications)
- `eventUpdated` - Emitted when event is updated
- `joined` - Confirmation when successfully joined an event room
- `error` - Error message if join fails

## Example API Requests

See `API_EXAMPLES.md` for detailed examples with all new features.

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:generate` - Regenerate Prisma Client after schema changes

## Notes

- For MVP, admin authentication is simplified (using headers/query params)
- In production, implement proper JWT authentication
- Firebase Admin SDK requires service account JSON file or environment variables
- Socket.IO rooms are named as `event:{eventId}`
- All deletions are soft deletes (records are marked with `deletedAt` timestamp)
- Event short codes are automatically generated (8-character alphanumeric, uppercase)
- Schedule items are ordered by `orderIndex` (ascending), then by `startTime` (ascending)
- Push notifications are automatically logged in the `NotificationLog` table
