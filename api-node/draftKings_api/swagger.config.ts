import swaggerJsdoc, { Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DraftKings API",
      version: "1.0.0",
      description:
        "Documentación de la API de Draftkings, la aplicación de Football. Esta API permite gestionar jugadores, tácticas, reseñas y usuarios. Protegida con JWT y autenticación Firebase.",
      contact: {
        name: "Daniel Salas Alonso",
        email: "dsa069@inlumine.ual.es",
        url: "https://github.com/dsa069/DraftKings.git",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de Desarrollo Node.js",
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
      schemas: {
        Player: {
          type: "object",
          properties: {
            id: { type: "string", description: "ID autogenerado por MongoDB" },
            name: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            age: { type: "number" },
            birthdate: { type: "string", format: "date" },
            nationality: { type: "string" },
            height: { type: "number" },
            weight: { type: "number" },
            number: { type: "number" },
            team: { type: "string" },
            league: { type: "string" },
            position: { type: "string" },
            photoUrl: { type: "string" },
            latitude: { type: "number" },
            longitude: { type: "number" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Review: {
          type: "object",
          properties: {
            id: { type: "string" },
            user_id: {
              type: "string",
              description: "ID del usuario que creó la reseña",
            },
            author: { type: "string" },
            text: { type: "string" },
            rating: { type: "number" },
            latitude: { type: "number" },
            longitude: { type: "number" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string", description: "ID autogenerado por MongoDB" },
            email: { type: "string" },
            userName: { type: "string" },
            role: { type: "string", default: "USER" },
            firebaseUid: { type: "string" },
            is_active: { type: "boolean", default: true },
            blocked: { type: "boolean", default: false },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  // Rutas donde Swagger buscará los comentarios de la documentación
  apis: ["./draftKings_api/routes/*.ts", "./draftKings_api/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📄 Swagger Docs en http://localhost:3000/api-docs");
};
