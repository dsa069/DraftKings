import { Request, Response, NextFunction } from "express";

/**
 * Controlador para obtener la lista de usuarios.
 */
export const getUsers = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.send("respond with a resource");
};
