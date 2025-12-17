# API Examples

This document provides example API requests for the EventFlow backend.

## Base URL
```
http://localhost:3000/api
```

## Headers
Most endpoints use Firebase authentication via Bearer token:
```
Authorization: Bearer <firebase-id-token>
```

---

## 1. Create User

```bash
POST /users
Content-Type: application/json

{
  "email": "admin@example.com",
  "name": "Event User"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "admin@example.com",
    "name": "Event Admin",
  "role": "GUEST",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "deletedAt": null
  }
}
```

---

## 2. Register Device (FCM Token)

```bash
POST /devices
Content-Type: application/json

{
  "userId": "user-uuid",
  "fcmToken": "fcm-token-from-device",
  "deviceType": "IOS"
}
```

**Device Types:** `IOS`, `ANDROID`, `WEB`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "device-uuid",
    "userId": "user-uuid",
    "fcmToken": "fcm-token-from-device",
    "deviceType": "IOS",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 3. Create Event

```bash
POST /events
Content-Type: application/json
Authorization: Bearer <firebase-id-token>

{
  "name": "Summer Wedding 2024",
  "description": "A beautiful outdoor wedding celebration",
  "startDate": "2024-06-15T14:00:00.000Z",
  "endDate": "2024-06-15T22:00:00.000Z",
  "location": "Garden Venue, 123 Main St",
  "visibility": "PUBLIC",
  "type": "WEDDING"
}
```

**Visibility Options:** `PUBLIC`, `PRIVATE`, `UNLISTED`  
**Event Types:** `WEDDING`, `BIRTHDAY`, `CORPORATE`, `COLLEGE_FEST`, `OTHER`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "event-uuid",
    "name": "Summer Wedding 2024",
    "description": "A beautiful outdoor wedding celebration",
    "shortCode": "ABC123XY",
    "startDate": "2024-06-15T14:00:00.000Z",
    "endDate": "2024-06-15T22:00:00.000Z",
    "location": "Garden Venue, 123 Main St",
    "visibility": "PUBLIC",
    "type": "WEDDING",
    "adminId": "admin-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Note:** `shortCode` is automatically generated (8-character alphanumeric, uppercase)

---

## 4. Get Event by Short Code

```bash
GET /events/code/ABC123XY
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "event-uuid",
    "name": "Summer Wedding 2024",
    "shortCode": "ABC123XY",
    "startDate": "2024-06-15T14:00:00.000Z",
    "endDate": "2024-06-15T22:00:00.000Z",
    "scheduleItems": [...],
    "announcements": [...]
  }
}
```

---

## 5. Add Schedule Item

```bash
POST /schedule
Content-Type: application/json
Authorization: Bearer <firebase-id-token>

{
  "eventId": "event-uuid",
  "title": "Ceremony",
  "description": "Wedding ceremony begins",
  "startTime": "2024-06-15T14:00:00.000Z",
  "endTime": "2024-06-15T15:00:00.000Z",
  "location": "Main Garden",
  "orderIndex": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "schedule-uuid",
    "eventId": "event-uuid",
    "title": "Ceremony",
    "description": "Wedding ceremony begins",
    "startTime": "2024-06-15T14:00:00.000Z",
    "endTime": "2024-06-15T15:00:00.000Z",
    "location": "Main Garden",
    "orderIndex": 0,
    "createdBy": "admin-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "creator": {
      "id": "admin-uuid",
      "name": "Event Admin"
    }
  }
}
```

**Note:** If `orderIndex` is not provided, it will be set to the next available index for the event.

---

## 6. Guest Joins Event (by ID or Short Code)

### Join by Event ID:
```bash
POST /guests/join
Content-Type: application/json

{
  "eventId": "event-uuid",
  "email": "guest@example.com",
  "name": "John Doe"
}
```

### Join by Short Code:
```bash
POST /guests/join
Content-Type: application/json

{
  "shortCode": "ABC123XY",
  "email": "guest@example.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "guest-event-uuid",
    "userId": "user-uuid",
    "eventId": "event-uuid",
    "status": "JOINED",
    "joinedAt": "2024-01-01T00:00:00.000Z",
    "checkedInAt": null,
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "guest@example.com"
    },
    "event": {
      "id": "event-uuid",
      "name": "Summer Wedding 2024",
      "scheduleItems": [...],
      "announcements": [...]
    }
  }
}
```

**Note:** Guest status starts as `JOINED` when joining via API. Use status update endpoint to change to `CHECKED_IN`.

---

## 7. Update Guest Status

```bash
PATCH /guests/{userId}/{eventId}/status
Content-Type: application/json

{
  "status": "CHECKED_IN"
}
```

**Status Options:** `INVITED`, `JOINED`, `CHECKED_IN`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "guest-event-uuid",
    "userId": "user-uuid",
    "eventId": "event-uuid",
    "status": "CHECKED_IN",
    "joinedAt": "2024-01-01T00:00:00.000Z",
    "checkedInAt": "2024-01-01T12:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "name": "John Doe"
    },
    "event": {
      "id": "event-uuid",
      "name": "Summer Wedding 2024"
    }
  }
}
```

---

## 8. Get Event Details (with schedule and announcements)

```bash
GET /events/{event-id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "event-uuid",
    "name": "Summer Wedding 2024",
    "description": "A beautiful outdoor wedding celebration",
    "shortCode": "ABC123XY",
    "startDate": "2024-06-15T14:00:00.000Z",
    "endDate": "2024-06-15T22:00:00.000Z",
    "location": "Garden Venue, 123 Main St",
    "visibility": "PUBLIC",
    "type": "WEDDING",
    "scheduleItems": [
      {
        "id": "schedule-uuid",
        "title": "Ceremony",
        "startTime": "2024-06-15T14:00:00.000Z",
        "endTime": "2024-06-15T15:00:00.000Z",
        "orderIndex": 0,
        "location": "Main Garden"
      }
    ],
    "announcements": [
      {
        "id": "announcement-uuid",
        "title": "Welcome!",
        "message": "Welcome to our wedding!",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "sender": {
          "id": "admin-uuid",
          "name": "Event Admin"
        }
      }
    ]
  }
}
```

**Note:** Schedule items are ordered by `orderIndex` (ascending), then by `startTime` (ascending).

---

## 9. Create Announcement (triggers Socket.IO + push notification)

```bash
POST /announcements
Content-Type: application/json
Authorization: Bearer <firebase-id-token>

{
  "eventId": "event-uuid",
  "title": "Important Update",
  "message": "The ceremony will start in 10 minutes!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "announcement-uuid",
    "eventId": "event-uuid",
    "senderId": "admin-uuid",
    "title": "Important Update",
    "message": "The ceremony will start in 10 minutes!",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "sender": {
      "id": "admin-uuid",
      "name": "Event Admin",
      "email": "admin@example.com"
    }
  }
}
```

**Note:** This will:
1. Save the announcement to the database
2. Emit a Socket.IO event to all clients in the event room
3. Send push notifications to all registered devices of guests in the event
4. Log all notification attempts in the `NotificationLog` table

---

## 10. Get Schedule Items for Event

```bash
GET /schedule/event/{event-id}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "schedule-uuid-1",
      "title": "Ceremony",
      "startTime": "2024-06-15T14:00:00.000Z",
      "endTime": "2024-06-15T15:00:00.000Z",
      "orderIndex": 0
    },
    {
      "id": "schedule-uuid-2",
      "title": "Reception",
      "startTime": "2024-06-15T16:00:00.000Z",
      "endTime": "2024-06-15T20:00:00.000Z",
      "orderIndex": 1
    }
  ]
}
```

**Note:** Items are ordered by `orderIndex` (ascending), then by `startTime` (ascending).

---

## 11. Get Announcements for Event

```bash
GET /announcements/event/{event-id}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "announcement-uuid",
      "title": "Welcome!",
      "message": "Welcome to our wedding!",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "sender": {
        "id": "admin-uuid",
        "name": "Event Admin"
      }
    }
  ]
}
```

---

## 12. Update Schedule Item

```bash
PATCH /schedule/{schedule-item-id}
Content-Type: application/json

{
  "title": "Updated Ceremony",
  "startTime": "2024-06-15T14:30:00.000Z",
  "orderIndex": 1
}
```

---

## 13. Reorder Schedule Items for Event

```bash
PATCH /schedule/reorder
Content-Type: application/json

{
  "eventId": "event-uuid",
  "items": [
    { "id": "schedule-uuid-1", "orderIndex": 1 },
    { "id": "schedule-uuid-2", "orderIndex": 0 }
  ]
}
```

---

## 14. Get Devices for User

```bash
GET /devices/user/{user-id}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "device-uuid-1",
      "userId": "user-uuid",
      "fcmToken": "fcm-token-1",
      "deviceType": "IOS",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "device-uuid-2",
      "userId": "user-uuid",
      "fcmToken": "fcm-token-2",
      "deviceType": "ANDROID",
      "createdAt": "2024-01-01T01:00:00.000Z"
    }
  ]
}
```

---

## Socket.IO Client Example

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

// Join an event room
socket.emit('joinEvent', 'event-uuid');

// Listen for join confirmation
socket.on('joined', (data) => {
  console.log('Joined event:', data.eventId);
});

// Listen for schedule updates
socket.on('scheduleUpdated', (data) => {
  console.log('Schedule updated:', data);
});

// Listen for announcements
socket.on('announcement', (data) => {
  console.log('New announcement:', data);
  // This will also trigger push notifications to registered devices
});

// Listen for event updates
socket.on('eventUpdated', (data) => {
  console.log('Event updated:', data);
});

// Listen for errors
socket.on('error', (data) => {
  console.error('Socket error:', data.message);
});

// Leave event room
socket.emit('leaveEvent', 'event-uuid');
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": [] // For validation errors
}
```

**Example (Validation Error):**
```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    {
      "path": "startTime",
      "message": "Required"
    }
  ]
}
```

**Example (Not Found):**
```json
{
  "success": false,
  "error": "Event not found"
}
```

---

## Soft Delete Behavior

All DELETE endpoints perform soft deletes (sets `deletedAt` timestamp). Soft-deleted records:
- Are excluded from all queries by default
- Can be recovered by updating `deletedAt` to `null`
- Maintain referential integrity

---

## Event Visibility

- **PUBLIC**: Anyone with the event ID or short code can join
- **PRIVATE**: Only invited guests can join (enforced by application logic)
- **UNLISTED**: Event exists but won't appear in public listings

---

## Guest Status Flow

1. **INVITED**: Guest has been invited but hasn't joined yet
2. **JOINED**: Guest has joined the event (default when joining via API)
3. **CHECKED_IN**: Guest has checked in at the event venue
