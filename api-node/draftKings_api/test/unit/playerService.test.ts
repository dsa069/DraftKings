import { PlayerService } from "../../services/playerService";
import Player from "../../models/player";

// 1. Aislar Mongoose: Mockeamos el modelo completo de Mongoose
jest.mock("../../models/player");

describe("PlayerService (Pruebas Unitarias)", () => {
  let playerService: PlayerService;

  beforeEach(() => {
    playerService = new PlayerService();
    jest.clearAllMocks(); // Limpiamos los mocks antes de cada test (Mejor práctica del PDF)
  });

  describe("createPlayer()", () => {
    it("Debería transformar los datos y llamar a save() en el modelo", async () => {
      // Preparamos los datos de entrada
      const mockBody = {
        name: "Lamine Yamal",
        latitude: 41.3809,
        longitude: 2.1228,
      };

      // Simulamos la respuesta de la función save() de Mongoose
      const mockSavedPlayer = { ...mockBody, _id: "mockId123" };

      // Interceptamos el constructor del modelo Player y su método save
      (Player as unknown as jest.Mock).mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedPlayer),
      }));

      // Ejecutamos el servicio
      const result = await playerService.createPlayer(mockBody);

      // Verificamos que devolvió lo que el mock simuló
      expect(result).toEqual(mockSavedPlayer);
      // Verificamos que el modelo de Mongoose fue instanciado correctamente
      expect(Player).toHaveBeenCalledTimes(1);
    });

    it("Debería convertir birthdate y coordinar correctamente todos los campos opcionales", async () => {
      const mockBody = {
        name: "Completo",
        firstName: "Completo",
        lastName: "Jugador",
        age: 25,
        birthdate: "2000-01-01T00:00:00.000Z",
        nationality: "Spain",
        height: 180,
        weight: 75,
        number: 9,
        team: "Team A",
        league: "League A",
        position: "ST",
        photoUrl: "https://example.com/photo.jpg",
        latitude: 41.1,
        longitude: 2.2,
      };

      const mockSavedPlayer = {
        ...mockBody,
        birthdate: new Date(mockBody.birthdate),
        coords: {
          type: "Point",
          coordinates: [2.2, 41.1],
        },
        _id: "mockId456",
      };

      (Player as unknown as jest.Mock).mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedPlayer),
      }));

      const result = await playerService.createPlayer(mockBody);

      expect(Player).toHaveBeenCalledWith(
        expect.objectContaining({
          birthdate: new Date(mockBody.birthdate),
          coords: {
            type: "Point",
            coordinates: [2.2, 41.1],
          },
        }),
      );
      expect(result.coords.coordinates).toEqual([2.2, 41.1]);
      expect(result.team).toBe("Team A");
      expect(result.position).toBe("ST");
    });
  });

  describe("updatePlayerPartial()", () => {
    it("Debería lanzar un error 'NOT_FOUND' si el jugador no existe", async () => {
      // Simulamos que Mongoose devuelve null (no encontró al jugador)
      (Player.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Verificamos que el servicio lanza el error esperado
      await expect(
        playerService.updatePlayerPartial("id-falso", { name: "Test" }),
      ).rejects.toThrow("NOT_FOUND");
    });

    it("Debería actualizar los campos y guardar si el jugador existe", async () => {
      // Simulamos el jugador existente en BD
      const mockExistingPlayer = {
        _id: "id-real",
        name: "Jugador Viejo",
        age: 20,
        coords: { coordinates: [0, 0] },
        save: jest.fn().mockResolvedValue(true), // Simulamos el método save del documento
      };

      (Player.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockExistingPlayer),
      });

      // Ejecutamos la actualización
      await playerService.updatePlayerPartial("id-real", {
        name: "Jugador Nuevo",
        age: 21,
      });

      // Verificamos que el servicio modificó los campos del objeto simulado
      expect(mockExistingPlayer.name).toBe("Jugador Nuevo");
      expect(mockExistingPlayer.age).toBe(21);
      // Verificamos que mandó a guardar los cambios
      expect(mockExistingPlayer.save).toHaveBeenCalled();
    });

    it("Debería actualizar birthdate, coordenadas y campos adicionales", async () => {
      const mockExistingPlayer = {
        _id: "id-real",
        birthdate: new Date("1990-01-01T00:00:00.000Z"),
        nationality: "Old",
        height: 170,
        weight: 70,
        team: "Old Team",
        league: "Old League",
        position: "CM",
        number: 8,
        photoUrl: "old.jpg",
        coords: { coordinates: [1, 2] },
        save: jest.fn().mockResolvedValue(true),
      };

      (Player.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockExistingPlayer),
      });

      await playerService.updatePlayerPartial("id-real", {
        birthdate: null,
        nationality: "New",
        height: 180,
        weight: 75,
        team: "New Team",
        league: "New League",
        position: "ST",
        number: 10,
        photoUrl: "new.jpg",
        latitude: 10,
      });

      expect(mockExistingPlayer.birthdate).toBeNull();
      expect(mockExistingPlayer.nationality).toBe("New");
      expect(mockExistingPlayer.height).toBe(180);
      expect(mockExistingPlayer.weight).toBe(75);
      expect(mockExistingPlayer.team).toBe("New Team");
      expect(mockExistingPlayer.league).toBe("New League");
      expect(mockExistingPlayer.position).toBe("ST");
      expect(mockExistingPlayer.number).toBe(10);
      expect(mockExistingPlayer.photoUrl).toBe("new.jpg");
      expect(mockExistingPlayer.coords.coordinates).toEqual([1, 10]);
    });
  });
});
