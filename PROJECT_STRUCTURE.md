# EventFlow Backend - Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Prisma client setup
│   │   └── firebase.ts           # Firebase Admin SDK initialization & push notification helpers
│   │
│   ├── controllers/
│   │   ├── announcement.controller.ts  # Announcement CRUD handlers
│   │   ├── device.controller.ts         # Device management handlers
│   │   ├── event.controller.ts          # Event CRUD handlers
│   │   ├── guestEvent.controller.ts     # Guest event join/leave/status handlers
│   │   ├── schedule.controller.ts       # Schedule item CRUD handlers
│   │   └── user.controller.ts           # User CRUD handlers
│   │
│   ├── middleware/
│   │   ├── errorHandler.ts       # Global error handling middleware
│   │   └── validation.ts         # Zod validation middleware
│   │
│   ├── routes/
│   │   ├── announcement.routes.ts
│   │   ├── device.routes.ts
│   │   ├── event.routes.ts
│   │   ├── guestEvent.routes.ts
│   │   ├── schedule.routes.ts
│   │   └── user.routes.ts
│   │
│   ├── services/
│   │   ├── announcement.service.ts      # Announcement business logic
│   │   ├── device.service.ts             # Device management & FCM token retrieval
│   │   ├── event.service.ts              # Event business logic (includes shortCode generation)
│   │   ├── guestEvent.service.ts         # Guest event business logic (status management)
│   │   ├── notificationLog.service.ts   # Notification logging
│   │   ├── schedule.service.ts           # Schedule item business logic (ordering)
│   │   └── user.service.ts              # User business logic
│   │
│   ├── socket/
│   │   └── socketHandlers.ts     # Socket.IO event handlers & real-time helpers
│   │
│   ├── types/
│   │   └── index.ts              # TypeScript types & Zod validation schemas
│   │
│   ├── app.ts                    # Express app configuration
│   └── server.ts                 # Server entry point
│
├── prisma/
│   └── schema.prisma             # Database schema (with soft deletes, enums, indexes)
│
├── .env.example                  # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
├── README.md
├── API_EXAMPLES.md
├── SETUP_GUIDE.md
└── PROJECT_STRUCTURE.md          # This file
```

## Key Files Explained

### Entry Points
- **`src/server.ts`**: Server startup, database connection, graceful shutdown
- **`src/app.ts`**: Express app setup, middleware, routes, Socket.IO initialization

### Configuration
- **`src/config/database.ts`**: Prisma client singleton
- **`src/config/firebase.ts`**: Firebase Admin SDK setup and push notification helpers with logging support

### Business Logic Layer
- **Services** (`src/services/`): All database operations and business logic
  - **device.service.ts**: Manages FCM tokens, supports multiple devices per user
  - **event.service.ts**: Generates unique short codes, handles visibility/type
  - **guestEvent.service.ts**: Manages RSVP status (INVITED/JOINED/CHECKED_IN)
  - **schedule.service.ts**: Handles ordering via `orderIndex`
  - **notificationLog.service.ts**: Logs all push notification attempts
- **Controllers** (`src/controllers/`): HTTP request handlers, call services

### API Layer
- **Routes** (`src/routes/`): Route definitions with validation middleware
- **Middleware** (`src/middleware/`): Error handling, validation

### Real-time
- **Socket Handlers** (`src/socket/`): Socket.IO event handlers for real-time updates, integrates with device service for push notifications

### Data Layer
- **Prisma Schema** (`prisma/schema.prisma`): Database schema definition with:
  - Soft delete support (`deletedAt` fields)
  - Enums (UserRole, EventVisibility, EventType, GuestStatus, DeviceType)
  - Comprehensive indexes for performance
  - Explicit relations with proper cascading rules
- **Types** (`src/types/`): TypeScript types and Zod validation schemas

## Data Flow

1. **Request** → Route → Validation Middleware → Controller
2. **Controller** → Service → Database (Prisma with soft delete filtering)
3. **Service** → Returns data → Controller → Response
4. **Real-time**: Controller → Socket.IO → Emit to event room
5. **Push Notifications**: 
   - Controller → Device Service (get FCM tokens)
   - Device Service → Firebase Admin → Send to devices
   - Firebase Admin → Notification Log Service (log results)

## Database Models

### User
- Basic user information
- Soft delete support
- Relations: devices, guestEvents, announcementsSent, eventsCreated, scheduleItems

### Device
- FCM tokens and device types (IOS/ANDROID/WEB)
- Supports multiple devices per user
- Soft delete support
- Unique constraint on (userId, fcmToken)

### Event
- Core event information
- Auto-generated shortCode (8-char alphanumeric)
- Visibility (PUBLIC/PRIVATE/UNLISTED) and Type (WEDDING/BIRTHDAY/CORPORATE/COLLEGE_FEST/OTHER)
- startDate and endDate (replaces single eventDate)
- Soft delete support
- Indexes on: adminId, shortCode, startDate, endDate, visibility, type

### ScheduleItem
- Event schedule items
- orderIndex for manual ordering
- createdBy tracks admin who created it
- Soft delete support
- Ordered by orderIndex (asc), then startTime (asc)

### Announcement
- Real-time announcements
- Soft delete support
- Triggers Socket.IO events and push notifications

### GuestEvent
- Guest-event relationship
- Status enum (INVITED/JOINED/CHECKED_IN)
- joinedAt and checkedInAt timestamps
- Soft delete support
- Unique constraint on (userId, eventId)

### NotificationLog
- Push notification delivery logs
- Tracks success/failure for each notification
- Indexed for efficient querying

## Socket.IO Rooms

- Rooms are named: `event:{eventId}`
- Clients join via `joinEvent(eventId)` event
- Server emits to room on:
  - Schedule updates
  - New announcements (also triggers push notifications)
  - Event updates

## Key Features

### Soft Deletes
- All models support soft deletion
- Queries automatically exclude soft-deleted records
- Can be recovered by setting `deletedAt` to null

### Short Codes
- Events have unique 8-character alphanumeric codes
- Generated using nanoid with uppercase alphanumeric alphabet
- Used for easy event joining via QR codes or links

### Multi-Device Support
- Users can register multiple devices
- Push notifications sent to all registered devices
- Device type tracking (IOS/ANDROID/WEB)

### Notification Logging
- All push notification attempts are logged
- Tracks success/failure status
- Includes error messages for failed notifications
- Useful for debugging and analytics
