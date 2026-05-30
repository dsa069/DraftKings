import axios from "axios";
import Player from "../../models/player";
import { ApiFootballService } from "../../services/apiFootballService";
import {
  emptyApiFootballResponse,
  importPlayersApiPayload,
  searchApiFootballResponse,
  transformedExternalPlayers,
} from "../utils/data/apiFootball.test.data";

jest.mock("axios");
jest.mock("../../models/player");

describe("ApiFootballService (Pruebas Unitarias)", () => {
  let apiFootballService: ApiFootballService;

  beforeEach(() => {
    apiFootballService = new ApiFootballService();
    jest.clearAllMocks();
  });

  describe("searchPlayers()", () => {
    it("Debería llamar a la API externa sin search cuando no se pasa criterio", async () => {
      (axios.get as jest.Mock).mockResolvedValue(emptyApiFootballResponse);

      await apiFootballService.searchPlayers();

      expect(axios.get).toHaveBeenCalledWith(
        "https://v3.football.api-sports.io/players/profiles",
        expect.objectContaining({
          params: {},
        }),
      );
    });

    it("Debería llamar a la API externa con el parámetro search y mapear la respuesta", async () => {
      (axios.get as jest.Mock).mockResolvedValue(searchApiFootballResponse);

      const result = await apiFootballService.searchPlayers("Lamine");

      expect(axios.get).toHaveBeenCalledWith(
        "https://v3.football.api-sports.io/players/profiles",
        expect.objectContaining({
          params: { search: "Lamine" },
        }),
      );
      expect(result).toEqual(transformedExternalPlayers);
    });

    it("Debería devolver un array vacío si la respuesta no tiene formato válido", async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: { response: null } });

      await expect(apiFootballService.searchPlayers()).resolves.toEqual([]);
    });

    it("Debería lanzar un error si falla la petición externa", async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error("network down"));

      await expect(apiFootballService.searchPlayers()).rejects.toThrow(
        "Failed to fetch players from external API",
      );
    });
  });

  describe("importPlayers()", () => {
    it("Debería no hacer nada si recibe un array vacío", async () => {
      await apiFootballService.importPlayers([]);

      expect(Player.insertMany).not.toHaveBeenCalled();
    });

    it("Debería no hacer nada si recibe undefined", async () => {
      await apiFootballService.importPlayers(
        undefined as Parameters<ApiFootballService["importPlayers"]>[0],
      );

      expect(Player.insertMany).not.toHaveBeenCalled();
    });

    it("Debería transformar los jugadores e insertarlos en MongoDB", async () => {
      (Player.insertMany as jest.Mock).mockResolvedValue(true);

      const players = importPlayersApiPayload;

      await apiFootballService.importPlayers(players);

      expect(Player.insertMany).toHaveBeenCalledWith([
        {
          name: "Jugador 1",
          birthdate: new Date("2000-01-01"),
          latitude: 41.1,
          longitude: 2.2,
          coords: {
            type: "Point",
            coordinates: [2.2, 41.1],
          },
        },
      ]);
    });
  });
});
