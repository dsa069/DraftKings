import Player, { IPlayer } from "../models/player";

export class PlayerService {
  // 5) Crear un jugador: Contiene la lógica interna de transformar lat/lng en un Point GeoJSON
  async createPlayer(body: any): Promise<IPlayer> {
    const newPlayer = new Player({
      name: body.name,
      firstName: body.firstName,
      lastName: body.lastName,
      age: body.age,
      birthdate: body.birthdate ? new Date(body.birthdate) : undefined,
      nationality: body.nationality,
      height: body.height,
      weight: body.weight,
      number: body.number,
      team: body.team,
      league: body.league,
      position: body.position,
      photoUrl: body.photoUrl,
      coords: {
        type: "Point",
        coordinates: [Number(body.longitude || 0), Number(body.latitude || 0)], // [lng, lat] estándar GeoJSON
      },
    });

    return await newPlayer.save();
  }

  // 7) Editar datos: Lógica de negocio condicional campo por campo
  async updatePlayerPartial(id: string, updateData: any): Promise<IPlayer> {
    const player = await Player.findById(id).exec();
    if (!player) {
      throw new Error("NOT_FOUND");
    }

    // Comprobaciones selectivas - TODOS LOS CAMPOS PERSONALES
    if (updateData.name !== undefined) player.name = updateData.name;
    if (updateData.firstName !== undefined)
      player.firstName = updateData.firstName;
    if (updateData.lastName !== undefined)
      player.lastName = updateData.lastName;
    if (updateData.age !== undefined) player.age = updateData.age;
    if (updateData.birthdate !== undefined)
      player.birthdate = updateData.birthdate
        ? new Date(updateData.birthdate)
        : undefined;
    if (updateData.nationality !== undefined)
      player.nationality = updateData.nationality;
    if (updateData.height !== undefined) player.height = updateData.height;
    if (updateData.weight !== undefined) player.weight = updateData.weight;

    // Campos de carrera/equipo
    if (updateData.team !== undefined) player.team = updateData.team;
    if (updateData.league !== undefined) player.league = updateData.league;
    if (updateData.position !== undefined)
      player.position = updateData.position;
    if (updateData.number !== undefined) player.number = updateData.number;

    // Foto
    if (updateData.photoUrl !== undefined)
      player.photoUrl = updateData.photoUrl;

    // Lógica condicional geográfica
    if (
      updateData.latitude !== undefined ||
      updateData.longitude !== undefined
    ) {
      const currentLng = player.coords?.coordinates[0] || 0;
      const currentLat = player.coords?.coordinates[1] || 0;
      const newLng =
        updateData.longitude !== undefined ? updateData.longitude : currentLng;
      const newLat =
        updateData.latitude !== undefined ? updateData.latitude : currentLat;

      player.coords = {
        type: "Point",
        coordinates: [Number(newLng), Number(newLat)],
      };
    }

    return await player.save();
  }
}
