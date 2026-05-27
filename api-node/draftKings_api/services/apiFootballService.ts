import axios from "axios"; // Asegúrate de tener axios instalado (npm i axios)
import Player from "../models/player";

export class ApiFootballService {
  private apiKey = process.env.API_FOOTBALL_KEY;

  // 1) Obtener y transformar datos de la API externa
  async searchPlayers(search?: string): Promise<any[]> {
    const params: any = {};
    if (search) params.search = search;

    try {
      const response = await axios.get(
        "https://v3.football.api-sports.io/players/profiles",
        {
          headers: {
            "x-apisports-key": this.apiKey,
            "x-rapidapi-host": "v3.football.api-sports.io",
          },
          params,
        },
      );

      const data = response.data;

      if (!data || !data.response || !Array.isArray(data.response)) return [];

      // Mapeo idéntico al que tenías en Angular
      return data.response.map((item: any) => ({
        name: item.player.name,
        firstName: item.player.firstname || "",
        lastName: item.player.lastname || "",
        age: item.player.age || undefined,
        birthdate: item.player.birth?.date || undefined,
        nationality: item.player.nationality || "",
        position: item.player.position || "",
        photoUrl: item.player.photo || "",
        team: "API Football",
        league: "External",
        latitude: 0,
        longitude: 0,
        height: item.player.height || undefined,
        weight: item.player.weight || undefined,
        number: item.player.number || undefined,
      }));
    } catch (error) {
      console.error("Error fetching from API-Football:", error);
      throw new Error("Failed to fetch players from external API", {
        cause: error,
      });
    }
  }

  // 2) Importar los jugadores pasados desde el front a MongoDB
  async importPlayers(players: any[]): Promise<void> {
    if (!players || players.length === 0) return;

    // Transformamos los objetos planos al formato con GeoJSON para Mongoose
    const docsToInsert = players.map((player) => ({
      ...player,
      birthdate: player.birthdate ? new Date(player.birthdate) : null,
      coords: {
        type: "Point",
        coordinates: [
          Number(player.longitude || 0),
          Number(player.latitude || 0),
        ],
      },
    }));

    // Usamos insertMany para mayor eficiencia en base de datos
    await Player.insertMany(docsToInsert);
  }
}
