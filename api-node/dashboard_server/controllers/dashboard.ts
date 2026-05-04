import { Request, Response, NextFunction } from "express";

/**
 * Controlador para la página principal del dashboard.
 */
export const getHome = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.render("index", { title: "Express" });
};
