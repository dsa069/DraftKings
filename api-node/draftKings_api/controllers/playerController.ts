import { Request, Response } from "express";
import Player from "../models/player";
import Review from "../models/review";
import { PlayerService } from "../services/playerService";
import { ApiFootballService } from "../services/apiFootballService";

const apiFootballService = new ApiFootballService();
const playerService = new PlayerService();

// 3) Obtener listado de jugadores (Directo al Modelo + Transformación)
export const playersReadAll = async (req: Request, res: Response) => {
  try {
    const { search, team, league, startDate, page, size } = req.query;

    // Validación de paginación (400 Bad Request según README)
    const pageNum = page !== undefined ? parseInt(page as string) : 0;
    const sizeNum = size !== undefined ? parseInt(size as string) : 10;

    if (isNaN(pageNum) || pageNum < 0 || isNaN(sizeNum) || sizeNum <= 0) {
      return res
        .status(400)
        .json({ message: "Parámetros de paginación inválidos" });
    }

    const queryFilter: any = {};
    if (search) queryFilter.name = { $regex: search, $options: "i" };
    if (team) queryFilter.team = team;
    if (league) queryFilter.league = league;
    if (startDate)
      queryFilter.created_at = { $gte: new Date(startDate as string) };

    const totalItems = await Player.countDocuments(queryFilter);
    const players = await Player.find(queryFilter)
      .skip(pageNum * sizeNum)
      .limit(sizeNum)
      .exec();

    return res.status(200).json({
      content: players,
      totalElements: totalItems,
      totalPages: Math.ceil(totalItems / sizeNum),
      number: pageNum,
      size: sizeNum,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

// 4) Obtener detalle de un jugador
export const playersReadOne = async (req: Request, res: Response) => {
  try {
    let id = req.params.id as string | string[] | undefined;
    if (Array.isArray(id)) id = id[0];
    if (!id) return res.status(400).json({ message: "Bad Request" });

    const player = await Player.findById(id).exec();
    if (!player) return res.status(404).json({ message: "not found" });

    return res.status(200).json(player);
  } catch (err: any) {
    if (err.name === "CastError")
      return res.status(400).json({ message: "Bad Request: ID inválido" });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 5) Crear un jugador -> DELEGA EN SERVICIO
export const playersCreate = async (req: Request, res: Response) => {
  try {
    // Validación de campos requeridos (400 Bad Request según README)
    const { name, latitude, longitude } = req.body;
    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message:
          "Body inválido. Faltan campos requeridos: name, latitude, longitude.",
      });
    }

    const savedPlayer = await playerService.createPlayer(req.body);
    return res.status(201).json(savedPlayer);
  } catch (err: any) {
    // Distinguimos errores de validación de Mongoose de errores internos
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Bad Request", error: err.message });
    }
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

// 8) Editar datos de un jugador -> DELEGA EN SERVICIO
export const playersUpdate = async (req: Request, res: Response) => {
  try {
    let id = req.params.id as string | string[] | undefined;
    if (Array.isArray(id)) id = id[0];
    if (!id) return res.status(400).json({ message: "Bad Request" });

    const updatedPlayer = await playerService.updatePlayerPartial(id, req.body);
    return res.status(200).json(updatedPlayer);
  } catch (err: any) {
    if (err.message === "NOT_FOUND")
      return res.status(404).json({ message: "not found" });
    if (err.name === "CastError")
      return res.status(400).json({ message: "Bad Request" });

    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 9) Eliminar un jugador (Directo al Modelo)
export const playersDelete = async (req: Request, res: Response) => {
  try {
    let id = req.params.id as string | string[] | undefined;
    if (Array.isArray(id)) id = id[0];
    if (!id) return res.status(400).json({ message: "Bad Request" });

    await Review.deleteMany({ player: id });

    const deletedPlayer = await Player.findByIdAndDelete(id).exec();
    if (!deletedPlayer) return res.status(404).json({ message: "not found" });

    return res.status(204).send();
  } catch (err: any) {
    if (err.name === "CastError")
      return res.status(400).json({ message: "Bad Request" });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 6) Obtener jugadores de la API Externa
export const playersGetExternal = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const players = await apiFootballService.searchPlayers(search);
    return res.status(200).json(players);
  } catch (err: any) {
    // 503 Service Unavailable según README para errores de comunicación externa
    if (
      err.isAxiosError ||
      err.response ||
      err.message.includes("timeout") ||
      err.message.includes("network")
    ) {
      return res.status(503).json({
        message:
          "Service Unavailable: Fallo en la comunicación con la API externa.",
      });
    }
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

// 7) Importar jugadores desde el Front
export const playersImport = async (req: Request, res: Response) => {
  try {
    const playersArray = req.body;

    if (!Array.isArray(playersArray)) {
      return res.status(400).json({ message: "Expected an array of players" });
    }

    // Comprobamos que cada elemento cumpla los requisitos del README (400 Bad Request)
    const isValid = playersArray.every(
      (p: any) =>
        p.name && p.latitude !== undefined && p.longitude !== undefined,
    );

    if (!isValid) {
      return res.status(400).json({
        message:
          "Body inválido. Cada elemento debe incluir al menos name, latitude y longitude.",
      });
    }

    await apiFootballService.importPlayers(playersArray);
    return res.status(201).json({ message: "Players imported successfully" });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Bad Request", error: err.message });
    }
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};
