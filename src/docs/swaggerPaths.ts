const jsonBody = {
  content: {
    "application/json": {
      schema: {
        type: "object",
        additionalProperties: true,
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
          additionalProperties: true,
        },
      },
    },
  },
};

const createdResponse = {
  "201": {
    description: "Created",
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: true,
        },
      },
    },
  },
};

const noContentResponse = {
  "204": {
    description: "No Content",
  },
};

export const swaggerPaths = {
  "/health": {
    get: {
      tags: ["Health"],
      summary: "Health check",
      security: [],
      responses: okResponse,
    },
  },

  // Auth
  "/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Register new user",
      requestBody: jsonBody,
      responses: createdResponse,
    },
  },
  "/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login user",
      requestBody: jsonBody,
      responses: okResponse,
    },
  },
  "/auth/me": {
    get: {
      tags: ["Auth"],
      summary: "Get current user profile",
      responses: okResponse,
    },
  },
  "/auth/profile": {
    patch: {
      tags: ["Auth"],
      summary: "Update profile",
      requestBody: jsonBody,
      responses: okResponse,
    },
  },
  "/auth/account": {
    delete: {
      tags: ["Auth"],
      summary: "Delete account",
      responses: noContentResponse,
    },
  },
  "/auth/verify": {
    post: {
      tags: ["Auth"],
      summary: "Verify token",
      responses: okResponse,
    },
  },

  // Users
  "/users": {
    post: {
      tags: ["Users"],
      summary: "Create user",
      requestBody: jsonBody,
      responses: createdResponse,
    },
  },
  "/users/{id}": {
    get: {
      tags: ["Users"],
      summary: "Get user by id",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: okResponse,
    },
    patch: {
      tags: ["Users"],
      summary: "Update user",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: jsonBody,
      responses: okResponse,
    },
  },

  // Events
  "/events": {
    post: {
      tags: ["Events"],
      summary: "Create event",
      requestBody: jsonBody,
      responses: createdResponse,
    },
  },
  "/events/admin": {
    get: {
      tags: ["Events"],
      summary: "Get events by admin",
      responses: okResponse,
    },
  },
  "/events/calendar": {
    get: {
      tags: ["Events"],
      summary: "Get calendar events for user",
      responses: okResponse,
    },
  },
  "/events/{id}": {
    get: {
      tags: ["Events"],
      summary: "Get event by id",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: okResponse,
    },
    patch: {
      tags: ["Events"],
      summary: "Update event",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: jsonBody,
      responses: okResponse,
    },
    delete: {
      tags: ["Events"],
      summary: "Delete (soft) event",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: noContentResponse,
    },
  },
  "/events/type/{type}": {
    get: {
      tags: ["Events"],
      summary: "Get events by type",
      parameters: [
        {
          name: "type",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: okResponse,
    },
  },
  "/events/public": {
    get: {
      tags: ["Events"],
      summary: "Get public events",
      responses: okResponse,
    },
  },
  "/events/happening-now": {
    get: {
      tags: ["Events"],
      summary: "Get events happening in next 24h",
      responses: okResponse,
    },
  },
  "/events/code/{shortCode}": {
    get: {
      tags: ["Events"],
      summary: "Get event by short code",
      parameters: [
        {
          name: "shortCode",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: okResponse,
    },
  },

  // Guest Events
  "/guests/join": {
    post: {
      tags: ["Guest Events"],
      summary: "Join event (by id or shortcode)",
      requestBody: jsonBody,
      responses: createdResponse,
    },
  },
  "/guests/my-events": {
    get: {
      tags: ["Guest Events"],
      summary: "Get my guest events",
      responses: okResponse,
    },
  },
  "/guests/user/{userId}": {
    get: {
      tags: ["Guest Events"],
      summary: "Get guest events by userId",
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: okResponse,
    },
  },
  "/guests/event/{eventId}": {
    get: {
      tags: ["Guest Events"],
      summary: "Get guests by event",
      parameters: [
        {
          name: "eventId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: okResponse,
    },
  },
  "/guests/{userId}/{eventId}/status": {
    patch: {
      tags: ["Guest Events"],
      summary: "Update guest status",
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
        {
          name: "eventId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: jsonBody,
      responses: okResponse,
    },
  },
  "/guests/{eventId}": {
    delete: {
      tags: ["Guest Events"],
      summary: "Leave event",
      parameters: [
        {
          name: "eventId",
          in: "path",
          required: true,
          schema: { type: "string" },
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
      requestBody: jsonBody,
      responses: createdResponse,
    },
  },
  "/schedule/event/{eventId}": {
    get: {
      tags: ["Schedule"],
      summary: "Get schedule items by event",
      parameters: [
        {
          name: "eventId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: okResponse,
    },
  },
  "/schedule/{id}": {
    get: {
      tags: ["Schedule"],
      summary: "Get schedule item by id",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: okResponse,
    },
    patch: {
      tags: ["Schedule"],
      summary: "Update schedule item",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: jsonBody,
      responses: okResponse,
    },
    delete: {
      tags: ["Schedule"],
      summary: "Delete schedule item",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: noContentResponse,
    },
  },

  // Devices
  "/devices": {
    post: {
      tags: ["Devices"],
      summary: "Register device",
      requestBody: jsonBody,
      responses: createdResponse,
    },
  },
  "/devices/user/{userId}": {
    get: {
      tags: ["Devices"],
      summary: "Get devices by user",
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: okResponse,
    },
  },
  "/devices/{id}": {
    get: {
      tags: ["Devices"],
      summary: "Get device by id",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: okResponse,
    },
    patch: {
      tags: ["Devices"],
      summary: "Update device",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: jsonBody,
      responses: okResponse,
    },
    delete: {
      tags: ["Devices"],
      summary: "Delete device",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: noContentResponse,
    },
  },

  // Announcements
  "/announcements": {
    post: {
      tags: ["Announcements"],
      summary: "Create announcement",
      requestBody: jsonBody,
      responses: createdResponse,
    },
  },
  "/announcements/event/{eventId}": {
    get: {
      tags: ["Announcements"],
      summary: "Get announcements by event",
      parameters: [
        {
          name: "eventId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: okResponse,
    },
  },
  "/announcements/{id}": {
    get: {
      tags: ["Announcements"],
      summary: "Get announcement by id",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: okResponse,
    },
    delete: {
      tags: ["Announcements"],
      summary: "Delete announcement",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: noContentResponse,
    },
  },
};

export default swaggerPaths;
