import { Request, Response } from "express";
import Player from "../models/player";
import { PlayerService } from "../services/playerService";

const playerService = new PlayerService();

// 3) Obtener listado de jugadores (Directo al Modelo + Transformación automática de Mongoose)
export const playersReadAll = async (req: Request, res: Response) => {
  try {
    const { search, team, league, startDate, page, size } = req.query;
    const pageNum = parseInt(page as string) || 0;
    const sizeNum = parseInt(size as string) || 10;

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
      .exec(); // .exec() asegura promesas nativas reales

    return res.status(200).json({
      content: players, // Gracias al transform de toJSON, Mongoose los mapea automáticamente
      totalElements: totalItems,
      totalPages: Math.ceil(totalItems / sizeNum),
      number: pageNum,
      size: sizeNum,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// 4) Obtener detalle de un jugador (Limpio y directo sin el "tochaco" de mapeo)
export const playersReadOne = async (req: Request, res: Response) => {
  try {
    let id = req.params.id as string | string[] | undefined;
    if (Array.isArray(id)) id = id[0];
    if (!id) return res.status(400).json({ message: "Bad Request" });

    const player = await Player.findById(id).exec();
    if (!player) return res.status(404).json({ message: "not found" });

    // Mongoose ejecuta en segundo plano 'toJSON.transform' convirtiendo el GeoJSON a campos id, latitude y longitude
    return res.status(200).json(player);
  } catch (err: any) {
    if (err.name === "CastError")
      return res.status(400).json({ message: "Bad Request" });
    res.status(500).json({ message: "Unknown Error" });
  }
};

// 5) Crear un jugador -> DELEGA EN SERVICIO (Mantiene la lógica de construcción de GeoJSON interna)
export const playersCreate = async (req: Request, res: Response) => {
  try {
    const savedPlayer = await playerService.createPlayer(req.body);
    return res.status(201).json(savedPlayer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// 7) Editar datos de un jugador -> DELEGA EN SERVICIO (Mantiene la lógica condicional campo a campo)
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
    res.status(500).json({ message: "Unknown Error" });
  }
};

// 8) Eliminar un jugador (Directo al Modelo)
export const playersDelete = async (req: Request, res: Response) => {
  try {
    let id = req.params.id as string | string[] | undefined;
    if (Array.isArray(id)) id = id[0];
    if (!id) return res.status(400).json({ message: "Bad Request" });

    const deletedPlayer = await Player.findByIdAndDelete(id).exec();
    if (!deletedPlayer) return res.status(404).json({ message: "not found" });

    return res.status(204).send(); // 204 No Content estándar para eliminaciones exitosas
  } catch (err: any) {
    if (err.name === "CastError")
      return res.status(400).json({ message: "Bad Request" });
    res.status(500).json({ message: "Unknown Error" });
  }
};
