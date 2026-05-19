import createError from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import dotenv from "dotenv";
import cors from "cors";

// Solo para simular "produccion" en local
const envFile = process.env.NODE_ENV === "prod" ? "env.prod" : "env";

dotenv.config({
  path: [
    "/app/enviroments/env", // 1º Prioridad: Secreto en Cloud Run
    path.resolve(process.cwd(), "enviroments", envFile), // 2º Prioridad: Local para desarrollo
  ],
});

import indexRouter from "./dashboard_server/routes/index";
import usersRouter from "./dashboard_server/routes/users";
import userApiRouter from "./draftKings_api/routes/user";

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "dashboard_server/views"));
app.set("view engine", "pug");

app.use(logger("dev"));

// Configuración de CORS
// En desarrollo, permitir peticiones desde localhost:8100 (Ionic), localhost:8200, etc.
// En producción, especificar el dominio exacto del cliente.
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    const allowedOrigins = [process.env.FRONTEND_URL]; // FRONTEND_URL viene de environment

    // En desarrollo, permitir también peticiones sin origen (como Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // En producción, rechazar orígenes no autorizados
      if (process.env.NODE_ENV === "production") {
        callback(new Error("Not allowed by CORS"));
      } else {
        // En desarrollo, ser más permisivo
        callback(null, true);
      }
    }
  },
  credentials: true, // Permitir cookies y headers de autenticación
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

// Rutas del Dashboard
app.use("/", indexRouter);
app.use("/users", usersRouter);

// Rutas de la API
app.use("/api/user", userApiRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// error handler
app.use((err: any, req: Request, res: Response) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
