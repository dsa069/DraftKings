import createError from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import dotenv from "dotenv";

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
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
