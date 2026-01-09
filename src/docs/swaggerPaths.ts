// Common response schemas
const errorResponse = {
  "400": {
    description: "Bad Request - Invalid input",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            error: { type: "string" },
          },
        },
      },
    },
  },
  "401": {
    description: "Unauthorized - Authentication required",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Authentication required" },
          },
        },
      },
    },
  },
  "403": {
    description: "Forbidden - Insufficient permissions",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
      },
    },
  },
  "404": {
    description: "Not Found",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
      },
    },
  },
  "500": {
    description: "Internal Server Error",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
      },
    },
  },
};

const okResponse = {
  "200": {
    description: "Successful response",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object", additionalProperties: true },
          },
        },
      },
    },
  },
  ...errorResponse,
};

const createdResponse = {
  "201": {
    description: "Created",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object", additionalProperties: true },
          },
        },
      },
    },
  },
  ...errorResponse,
};

const noContentResponse = {
  "204": {
    description: "No Content",
  },
  ...errorResponse,
};

export const swaggerPaths = {
  "/health": {
    get: {
      tags: ["Health"],
      summary: "Health check",
      description: "Check if the server is running",
      security: [],
      responses: {
        "200": {
          description: "Server is running",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Server is running" },
                  timestamp: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
      },
    },
  },

  // Auth
  "/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Register new user",
      description: "Register a new user after Firebase authentication. Requires Firebase token.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  minLength: 1,
                  maxLength: 100,
                  description: "User's display name",
                },
              },
            },
          },
        },
      },
      responses: createdResponse,
    },
  },
  "/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login user",
      description: "Login existing user or create account for social logins. Requires Firebase token.",
      requestBody: {
        required: false,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "User's display name (optional, used if not in Firebase profile)",
                },
              },
            },
          },
        },
      },
      responses: okResponse,
    },
  },
  "/auth/me": {
    get: {
      tags: ["Auth"],
      summary: "Get current user profile",
      description: "Get the authenticated user's profile information",
      responses: okResponse,
    },
  },
  "/auth/profile": {
    patch: {
      tags: ["Auth"],
      summary: "Update profile",
      description: "Update the authenticated user's profile",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  minLength: 1,
                  maxLength: 100,
                  description: "User's display name",
                },
                avatarUrl: {
                  type: "string",
                  format: "uri",
                  description: "URL to user's avatar image",
                },
              },
            },
          },
        },
      },
      responses: okResponse,
    },
  },
  "/auth/account": {
    delete: {
      tags: ["Auth"],
      summary: "Delete account",
      description: "Delete the authenticated user's account (soft delete)",
      responses: {
        "200": {
          description: "Account deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        ...errorResponse,
      },
    },
  },
  "/auth/verify": {
    post: {
      tags: ["Auth"],
      summary: "Verify token",
      description: "Verify if the current Firebase token is valid and check if user is registered",
      responses: {
        "200": {
          description: "Token verification result",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Token is valid" },
                  data: {
                    type: "object",
                    properties: {
                      isRegistered: { type: "boolean" },
                      user: { type: "object", nullable: true },
                    },
                  },
                },
              },
            },
          },
        },
        ...errorResponse,
      },
    },
  },

  // Users (Admin only)
  "/users": {
    post: {
      tags: ["Users"],
      summary: "Create user",
      description: "Create a new user (admin only)",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  description: "User's email address",
                },
                name: {
                  type: "string",
                  minLength: 1,
                  description: "User's display name",
                },
              },
            },
          },
        },
      },
      responses: createdResponse,
    },
    get: {
      tags: ["Users"],
      summary: "List/search users",
      description: "List or search users (admin only)",
      parameters: [
        {
          name: "q",
          in: "query",
          required: false,
          schema: { type: "string" },
          description: "Search by name or email",
        },
      ],
      responses: okResponse,
    },
  },
  "/users/{id}": {
    get: {
      tags: ["Users"],
      summary: "Get user by id",
      description: "Get a specific user by their ID (admin only)",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "User ID",
        },
      ],
      responses: okResponse,
    },
    patch: {
      tags: ["Users"],
      summary: "Update user",
      description: "Update a user's information (admin only)",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "User ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  minLength: 1,
                  description: "User's display name",
                },
              },
            },
          },
        },
      },
      responses: okResponse,
    },
    delete: {
      tags: ["Users"],
      summary: "Delete user",
      description: "Delete a user (admin only, soft delete)",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "User ID",
        },
      ],
      responses: noContentResponse,
    },
  },

  // Events
  "/events": {
    post: {
      tags: ["Events"],
      summary: "Create event",
      description: "Create a new event. Automatically generates a shortCode.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "startDate", "endDate"],
              properties: {
                name: { type: "string", minLength: 1 },
                description: { type: "string" },
                startDate: { type: "string", format: "date-time" },
                endDate: { type: "string", format: "date-time" },
                startTime: { type: "string", example: "9:00 AM" },
                endTime: { type: "string", example: "5:00 PM" },
                timeZone: { type: "string" },
                location: { type: "string" },
                coverImage: { type: "string", format: "uri" },
                portraitImage: { type: "string", format: "uri" },
                galleryImages: {
                  type: "array",
                  items: { type: "string", format: "uri" },
                },
                venue: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    fullAddress: { type: "string" },
                    address: { type: "string" },
                    city: { type: "string" },
                    state: { type: "string" },
                    zipCode: { type: "string" },
                  },
                },
                visibility: {
                  type: "string",
                  enum: ["PUBLIC", "PRIVATE", "UNLISTED"],
                  default: "PUBLIC",
                },
                type: {
                  type: "string",
                  enum: ["WEDDING", "BIRTHDAY", "CORPORATE", "COLLEGE_FEST", "OTHER"],
                },
                scheduleItems: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["title", "startTime", "endTime"],
                    properties: {
                      title: { type: "string", minLength: 1 },
                      description: { type: "string" },
                      startTime: { type: "string", format: "date-time" },
                      endTime: { type: "string", format: "date-time" },
                      location: { type: "string" },
                      orderIndex: { type: "integer", minimum: 0 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: createdResponse,
    },
    get: {
      tags: ["Events"],
      summary: "List/search accessible events",
      description: "List events accessible to the user. Authentication is optional.",
      parameters: [
        {
          name: "q",
          in: "query",
          required: false,
          schema: { type: "string" },
          description: "Search by name, description, or location",
        },
        {
          name: "limit",
          in: "query",
          required: false,
          schema: { type: "integer", default: 20 },
          description: "Maximum number of results",
        },
        {
          name: "offset",
          in: "query",
          required: false,
          schema: { type: "integer", default: 0 },
          description: "Number of results to skip",
        },
      ],
      security: [],
      responses: okResponse,
    },
  },
  "/events/admin": {
    get: {
      tags: ["Events"],
      summary: "Get events by admin",
      description: "Get all events created by the authenticated user",
      responses: okResponse,
    },
  },
  "/events/calendar": {
    get: {
      tags: ["Events"],
      summary: "Get calendar events for user",
      description: "Get events the authenticated user is attending",
      responses: okResponse,
    },
  },
  "/events/{id}": {
    get: {
      tags: ["Events"],
      summary: "Get event by id",
      description: "Get a specific event by ID. Authentication is optional.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Event ID",
        },
      ],
      security: [],
      responses: okResponse,
    },
    patch: {
      tags: ["Events"],
      summary: "Update event",
      description: "Update an event (only event admin can update)",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Event ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", minLength: 1 },
                description: { type: "string" },
                startDate: { type: "string", format: "date-time" },
                endDate: { type: "string", format: "date-time" },
                location: { type: "string" },
                coverImage: { type: "string", format: "uri" },
                portraitImage: { type: "string", format: "uri" },
                galleryImages: {
                  type: "array",
                  items: { type: "string", format: "uri" },
                },
                visibility: {
                  type: "string",
                  enum: ["PUBLIC", "PRIVATE", "UNLISTED"],
                },
                type: {
                  type: "string",
                  enum: ["WEDDING", "BIRTHDAY", "CORPORATE", "COLLEGE_FEST", "OTHER"],
                },
              },
            },
          },
        },
      },
      responses: okResponse,
    },
    delete: {
      tags: ["Events"],
      summary: "Delete event",
      description: "Soft delete an event (only event admin can delete)",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Event ID",
        },
      ],
      responses: noContentResponse,
    },
  },
  "/events/types": {
    get: {
      tags: ["Events"],
      summary: "Get types of events",
      description: "Get list of available event types",
      security: [],
      responses: okResponse,
    },
  },
  "/events/types/{type}": {
    get: {
      tags: ["Events"],
      summary: "Get events by type",
      description: "Get events filtered by type. Authentication is optional.",
      parameters: [
        {
          name: "type",
          in: "path",
          required: true,
          schema: {
            type: "string",
            enum: ["WEDDING", "BIRTHDAY", "CORPORATE", "COLLEGE_FEST", "OTHER"],
          },
          description: "Event type",
        },
      ],
      security: [],
      responses: okResponse,
    },
  },
  "/events/public": {
    get: {
      tags: ["Events"],
      summary: "Get public events",
      description: "Get all public events (no authentication required)",
      security: [],
      responses: okResponse,
    },
  },
  "/events/happening-now": {
    get: {
      tags: ["Events"],
      summary: "Get events happening now",
      description: "Get events happening in the next 24 hours (no authentication required)",
      security: [],
      responses: okResponse,
    },
  },
  "/events/code/{shortCode}": {
    get: {
      tags: ["Events"],
      summary: "Get event by short code",
      description: "Get an event by its 8-character short code (no authentication required)",
      parameters: [
        {
          name: "shortCode",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^[A-Za-z0-9]{8}$" },
          description: "8-character alphanumeric short code",
        },
      ],
      security: [],
      responses: okResponse,
    },
  },

  // Guest Events
  "/guests/join": {
    post: {
      tags: ["Guest Events"],
      summary: "Join event",
      description: "Join an event by event ID or short code. Authentication is optional (for public joining).",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                eventId: {
                  type: "string",
                  format: "uuid",
                  description: "Event ID (optional if shortCode provided)",
                },
                shortCode: {
                  type: "string",
                  description: "8-character short code (optional if eventId provided)",
                },
                userId: {
                  type: "string",
                  format: "uuid",
                  description: "User ID (optional if authenticated)",
                },
                email: {
                  type: "string",
                  format: "email",
                  description: "Email for guest (optional)",
                },
                name: {
                  type: "string",
                  description: "Guest name (optional)",
                },
              },
            },
          },
        },
      },
      security: [],
      responses: createdResponse,
    },
  },
  "/guests/my-events": {
    get: {
      tags: ["Guest Events"],
      summary: "Get my guest events",
      description: "Get all events the authenticated user is attending",
      responses: okResponse,
    },
  },
  "/guests/user/{userId}": {
    get: {
      tags: ["Guest Events"],
      summary: "Get guest events by userId",
      description: "Get all events a specific user is attending",
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "User ID",
        },
      ],
      responses: okResponse,
    },
  },
  "/guests/event/{eventId}": {
    get: {
      tags: ["Guest Events"],
      summary: "Get guests by event",
      description: "Get all guests for a specific event",
      parameters: [
        {
          name: "eventId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Event ID",
        },
      ],
      responses: okResponse,
    },
  },
  "/guests/{userId}/{eventId}": {
    get: {
      tags: ["Guest Events"],
      summary: "Get guest event by user and event",
      description: "Get the guest-event relationship for a specific user and event",
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "User ID",
        },
        {
          name: "eventId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Event ID",
        },
      ],
      responses: okResponse,
    },
  },
  "/guests/{userId}/{eventId}/status": {
    patch: {
      tags: ["Guest Events"],
      summary: "Update guest status",
      description: "Update the RSVP status for a guest-event relationship",
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "User ID",
        },
        {
          name: "eventId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Event ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["status"],
              properties: {
                status: {
                  type: "string",
                  enum: ["INVITED", "JOINED", "CHECKED_IN"],
                  description: "RSVP status",
                },
              },
            },
          },
        },
      },
      responses: okResponse,
    },
  },
  "/guests/{eventId}": {
    delete: {
      tags: ["Guest Events"],
      summary: "Leave event",
      description: "Remove the authenticated user from an event",
      parameters: [
        {
          name: "eventId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Event ID",
        },
      ],
      responses: noContentResponse,
    },
  },

  // Schedule
  "/schedule": {
    post: {
      tags: ["Schedule"],
      summary: "Create schedule item",
      description: "Create a new schedule item for an event. Requires x-creator-id header or createdBy in body.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["eventId", "title", "startTime", "endTime"],
              properties: {
                eventId: { type: "string", format: "uuid" },
                title: { type: "string", minLength: 1 },
                description: { type: "string" },
                startTime: { type: "string", format: "date-time" },
                endTime: { type: "string", format: "date-time" },
                location: { type: "string" },
                orderIndex: { type: "integer", minimum: 0 },
                createdBy: {
                  type: "string",
                  format: "uuid",
                  description: "User ID of creator (alternative to x-creator-id header)",
                },
              },
            },
          },
        },
      },
      responses: createdResponse,
    },
  },
  "/schedule/reorder": {
    patch: {
      tags: ["Schedule"],
      summary: "Reorder schedule items",
      description: "Update the order of schedule items for an event",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["eventId", "items"],
              properties: {
                eventId: {
                  type: "string",
                  format: "uuid",
                  description: "Event ID",
                },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["id", "orderIndex"],
                    properties: {
                      id: { type: "string", format: "uuid" },
                      orderIndex: { type: "integer", minimum: 0 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: okResponse,
    },
  },
  "/schedule/event/{eventId}": {
    get: {
      tags: ["Schedule"],
      summary: "Get schedule items by event",
      description: "Get all schedule items for a specific event",
      parameters: [
        {
          name: "eventId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Event ID",
        },
      ],
      responses: okResponse,
    },
  },
  "/schedule/{id}": {
    get: {
      tags: ["Schedule"],
      summary: "Get schedule item by id",
      description: "Get a specific schedule item by ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Schedule item ID",
        },
      ],
      responses: okResponse,
    },
    patch: {
      tags: ["Schedule"],
      summary: "Update schedule item",
      description: "Update a schedule item",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Schedule item ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string", minLength: 1 },
                description: { type: "string" },
                startTime: { type: "string", format: "date-time" },
                endTime: { type: "string", format: "date-time" },
                location: { type: "string" },
                orderIndex: { type: "integer", minimum: 0 },
              },
            },
          },
        },
      },
      responses: okResponse,
    },
    delete: {
      tags: ["Schedule"],
      summary: "Delete schedule item",
      description: "Delete a schedule item",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Schedule item ID",
        },
      ],
      responses: {
        "200": {
          description: "Schedule item deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        ...errorResponse,
      },
    },
  },

  // Devices
  "/devices": {
    post: {
      tags: ["Devices"],
      summary: "Register device",
      description: "Register a device for push notifications",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["userId", "fcmToken", "deviceId", "deviceType"],
              properties: {
                userId: { type: "string", format: "uuid" },
                fcmToken: {
                  type: "string",
                  minLength: 1,
                  description: "Firebase Cloud Messaging token",
                },
                deviceId: {
                  type: "string",
                  description: "Unique device identifier",
                },
                deviceType: {
                  type: "string",
                  enum: ["IOS", "ANDROID", "WEB"],
                  description: "Device platform",
                },
              },
            },
          },
        },
      },
      responses: createdResponse,
    },
  },
  "/devices/user/{userId}": {
    get: {
      tags: ["Devices"],
      summary: "Get devices by user",
      description: "Get all devices registered for a user",
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "User ID",
        },
      ],
      responses: okResponse,
    },
  },
  "/devices/{id}": {
    get: {
      tags: ["Devices"],
      summary: "Get device by id",
      description: "Get a specific device by ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Device ID",
        },
      ],
      responses: okResponse,
    },
    patch: {
      tags: ["Devices"],
      summary: "Update device",
      description: "Update device information (e.g., FCM token)",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Device ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                fcmToken: {
                  type: "string",
                  minLength: 1,
                  description: "Firebase Cloud Messaging token",
                },
                deviceType: {
                  type: "string",
                  enum: ["IOS", "ANDROID", "WEB"],
                  description: "Device platform",
                },
              },
            },
          },
        },
      },
      responses: okResponse,
    },
    delete: {
      tags: ["Devices"],
      summary: "Delete device",
      description: "Unregister a device",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Device ID",
        },
      ],
      responses: noContentResponse,
    },
  },

  // Announcements
  "/announcements": {
    post: {
      tags: ["Announcements"],
      summary: "Create announcement",
      description: "Create a new announcement for an event. Requires x-sender-id header or senderId in body/query.",
      parameters: [
        {
          name: "x-sender-id",
          in: "header",
          required: false,
          schema: { type: "string", format: "uuid" },
          description: "User ID of the announcement sender (alternative to senderId in body/query)",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["eventId", "title", "message"],
              properties: {
                eventId: { type: "string", format: "uuid" },
                title: { type: "string", minLength: 1 },
                message: { type: "string", minLength: 1 },
                senderId: {
                  type: "string",
                  format: "uuid",
                  description: "User ID of the sender (alternative to x-sender-id header)",
                },
              },
            },
          },
        },
      },
      responses: createdResponse,
    },
    get: {
      tags: ["Announcements"],
      summary: "Get user announcements",
      description: "Get all announcements for events the authenticated user is attending",
      responses: okResponse,
    },
  },
  "/announcements/event/{eventId}": {
    get: {
      tags: ["Announcements"],
      summary: "Get announcements by event",
      description: "Get all announcements for a specific event",
      parameters: [
        {
          name: "eventId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Event ID",
        },
      ],
      responses: okResponse,
    },
  },
  "/announcements/{id}": {
    get: {
      tags: ["Announcements"],
      summary: "Get announcement by id",
      description: "Get a specific announcement by ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Announcement ID",
        },
      ],
      responses: okResponse,
    },
    patch: {
      tags: ["Announcements"],
      summary: "Update announcement",
      description: "Update an announcement",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Announcement ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string", minLength: 1 },
                message: { type: "string", minLength: 1 },
              },
            },
          },
        },
      },
      responses: okResponse,
    },
    delete: {
      tags: ["Announcements"],
      summary: "Delete announcement",
      description: "Delete an announcement (soft delete)",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Announcement ID",
        },
      ],
      responses: {
        "200": {
          description: "Announcement deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Announcement deleted successfully" },
                },
              },
            },
          },
        },
        ...errorResponse,
      },
    },
  },
};

export default swaggerPaths;
