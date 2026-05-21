import { Request, Response } from "express";
import Player from "../models/player";
import { PlayerService } from "../services/playerService";

const playerService = new PlayerService();

// 3) Obtener listado de jugadores (Directo al Modelo + Mapeo de salida en Controller)
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
      .exec();

    // Mapeo simple requerido por el JSON del listado
    const formattedPlayers = players.map((p) => ({
      id: p._id,
      name: p.name,
      position: p.position,
      number: p.number,
      team: p.team,
      photoUrl: p.photoUrl,
    }));

    return res.status(200).json({
      content: formattedPlayers,
      totalElements: totalItems,
      totalPages: Math.ceil(totalItems / sizeNum),
      number: pageNum,
      size: sizeNum,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// 4) Obtener detalle de un jugador (Directo al Modelo + El "Mapeo" obligatorio de GeoJSON a plano)
export const playersReadOne = async (req: Request, res: Response) => {
  try {
    let id = req.params.id as string | string[] | undefined;
    if (Array.isArray(id)) id = id[0];
    if (!id) return res.status(400).json({ message: "Bad Request" });

    const player = await Player.findById(id).exec();
    if (!player) return res.status(404).json({ message: "not found" });

    // Aquí se realiza el return estructurado para aplanar las coordenadas de Mongo y limpiar la fecha
    return res.status(200).json({
      id: player._id,
      name: player.name,
      firstName: player.firstName,
      lastName: player.lastName,
      age: player.age,
      birthdate: player.birthdate
        ? player.birthdate.toISOString().split("T")[0]
        : undefined,
      nationality: player.nationality,
      height: player.height,
      weight: player.weight,
      number: player.number,
      team: player.team,
      league: player.league,
      position: player.position,
      photoUrl: player.photoUrl,
      latitude: player.coords?.coordinates[1],
      longitude: player.coords?.coordinates[0],
      created_at: player.created_at,
    });
  } catch (err: any) {
    if (err.name === "CastError")
      return res.status(400).json({ message: "Bad Request" });
    res.status(500).json({ message: "Unknown Error" });
  }
};

// 5) Crear un jugador -> DELEGA EN SERVICIO (Tiene lógica de negocio de conversión geoespacial)
export const playersCreate = async (req: Request, res: Response) => {
  try {
    const savedPlayer = await playerService.createPlayer(req.body);
    return res.status(201).json(savedPlayer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// 7) Editar datos de un jugador -> DELEGA EN SERVICIO (Tiene lógica condicional de parches)
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

    return res.status(204).send();
  } catch (err: any) {
    if (err.name === "CastError")
      return res.status(400).json({ message: "Bad Request" });
    res.status(500).json({ message: "Unknown Error" });
  }
};
