import swaggerJsdoc from "swagger-jsdoc";
import swaggerPaths from "./swaggerPaths";

export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EventFlow API",
      version: "1.0.0",
      description: "Documentation for EventFlow Backend",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: swaggerPaths,
  },

  apis: [],
};

export const swaggerSpecs = swaggerJsdoc(swaggerOptions);
