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
import { setupSwagger } from "./draftKings_api/swagger.config";
import indexRouter from "./dashboard_server/routes/index";
import usersRouter from "./dashboard_server/routes/users";
import userApiRouter from "./draftKings_api/routes/userRoutes";
import playerApiRouter from "./draftKings_api/routes/playerRoutes";
import reviewApiRouter from "./draftKings_api/routes/reviewRoutes";
import tacticRoutes from "./draftKings_api/routes/tacticRoutes";

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
    const mobileOrigins = ["https://localhost", "http://localhost"];

    // Si FRONTEND_URL existe en el .env, lo añadimos a la lista de permitidos
    const allowedOrigins = process.env.FRONTEND_URL
      ? [process.env.FRONTEND_URL, ...mobileOrigins]
      : [...mobileOrigins];

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
app.use(express.static(path.join(__dirname, "public")));

setupSwagger(app);

// Rutas del Dashboard
app.use("/", indexRouter);
// Rutas de usuarios del Dashboard SOLO VISTA (POSIBLE BORRARDA)(CRUD, etc.)
app.use("/users", usersRouter);

// Rutas de la API
app.use("/api/user", userApiRouter);
app.use("/api/players", playerApiRouter);
app.use("/api/reviews", reviewApiRouter);
app.use("/api/tactics", tacticRoutes);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.url.includes(".well-known")) {
    return res.status(404).send(); // Responde 404 sin hacer log
  }
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
