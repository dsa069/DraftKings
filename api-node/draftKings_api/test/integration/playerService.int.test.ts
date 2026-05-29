import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { PlayerService } from "../../services/playerService";
import Player from "../../models/player";

describe("PlayerService (Pruebas de Integración con BD)", () => {
  let mongoServer: MongoMemoryServer;
  let playerService: PlayerService;

  // ============================================================================
  // CONFIGURACIÓN DE BASE DE DATOS EN MEMORIA
  // ============================================================================
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri);

    // Instanciamos el servicio que vamos a probar
    playerService = new PlayerService();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Limpiamos la colección antes de cada prueba
    await Player.deleteMany({});
  });

  // ============================================================================
  // SUITE DE PRUEBAS
  // ============================================================================

  describe("createPlayer()", () => {
    it("Debería crear un jugador y guardar correctamente el punto GeoJSON", async () => {
      const playerData = {
        name: "Lamine Yamal",
        firstName: "Lamine",
        lastName: "Yamal",
        age: 16,
        team: "FC Barcelona",
        latitude: 41.3809,
        longitude: 2.1228,
      };

      // Ejecutamos el método del servicio
      const result = await playerService.createPlayer(playerData);

      // Verificamos el retorno
      expect(result).toBeDefined();
      expect(result.name).toBe("Lamine Yamal");
      expect(result.team).toBe("FC Barcelona");

      // Verificamos que la lógica interna de transformación a GeoJSON funcionó bien en BD
      expect(result.coords.type).toBe("Point");
      expect(result.coords.coordinates[0]).toBe(2.1228); // [0] es Longitud
      expect(result.coords.coordinates[1]).toBe(41.3809); // [1] es Latitud

      // Verificamos que realmente se guardó en la base de datos
      const playerInDb = await Player.findById(result._id);
      expect(playerInDb).not.toBeNull();
      expect(playerInDb?.name).toBe("Lamine Yamal");
    });

    it("Debería guardar [0, 0] como coordenadas si no se envían latitude o longitude", async () => {
      const result = await playerService.createPlayer({
        name: "Jugador Sin Coordenadas",
      });

      expect(result.coords.coordinates[0]).toBe(0);
      expect(result.coords.coordinates[1]).toBe(0);
    });

    it("Debería crear un jugador con todos los campos opcionales y convertir birthdate", async () => {
      const playerData = {
        name: "Completo",
        firstName: "CompletoFirst",
        lastName: "CompletoLast",
        age: 25,
        team: "Equipo X",
        latitude: 10.1,
        longitude: 20.2,
        birthdate: "2000-01-02T00:00:00.000Z",
        nationality: "Pais",
        height: 180,
        weight: 75,
        number: 9,
        position: "ST",
        photoUrl: "http://example.com/photo.jpg",
        league: "Liga 1",
      };

      const result = await playerService.createPlayer(playerData);

      expect(result).toBeDefined();
      expect(result.name).toBe("Completo");
      expect(result.firstName).toBe("CompletoFirst");
      expect(result.lastName).toBe("CompletoLast");
      expect(result.birthdate).toBeInstanceOf(Date);
      expect(result.birthdate?.toISOString()).toBe(
        new Date(playerData.birthdate).toISOString(),
      );
      expect(result.number).toBe(9);
      expect(result.position).toBe("ST");
      expect(result.photoUrl).toBe("http://example.com/photo.jpg");
      expect(result.coords.coordinates[0]).toBeCloseTo(20.2);
      expect(result.coords.coordinates[1]).toBeCloseTo(10.1);
    });
  });

  describe("updatePlayerPartial()", () => {
    it("Debería actualizar los campos básicos de un jugador", async () => {
      // 1. Preparamos el terreno: Creamos un jugador en BD
      const player = await playerService.createPlayer({
        name: "Jugador Original",
        age: 20,
        team: "Equipo A",
      });

      // 2. Ejecutamos la actualización parcial
      const updateData = { age: 21, team: "Equipo B" };
      const result = await playerService.updatePlayerPartial(
        player._id.toString(),
        updateData,
      );

      // 3. Verificamos
      expect(result.age).toBe(21);
      expect(result.team).toBe("Equipo B");
      // El nombre no se tocó, debería seguir igual
      expect(result.name).toBe("Jugador Original");
    });

    it("Debería actualizar firstName y lastName cuando se envían", async () => {
      const player = await playerService.createPlayer({
        name: "Jugador Nombre",
        firstName: "Viejo",
        lastName: "ApellidoViejo",
      });

      const result = await playerService.updatePlayerPartial(
        player._id.toString(),
        { firstName: "Nuevo", lastName: "ApellidoNuevo" },
      );

      expect(result.firstName).toBe("Nuevo");
      expect(result.lastName).toBe("ApellidoNuevo");
      expect(result.name).toBe("Jugador Nombre");
    });

    it("Debería actualizar parcialmente las coordenadas sin perder la latitud/longitud anterior", async () => {
      // 1. Creamos jugador con coordenadas iniciales
      const player = await playerService.createPlayer({
        name: "Jugador GPS",
        latitude: 40.0,
        longitude: -3.0,
      });

      // 2. Actualizamos SOLO la latitud
      const updateData = { latitude: 45.0 };
      const result = await playerService.updatePlayerPartial(
        player._id.toString(),
        updateData,
      );

      // 3. Verificamos que la longitud inicial (-3.0) se mantuvo intacta
      expect(result.coords.coordinates[1]).toBe(45.0); // Nueva latitud
      expect(result.coords.coordinates[0]).toBe(-3.0); // Longitud conservada
    });

    it("Debería actualizar solo la longitud sin perder la latitud anterior", async () => {
      const player = await playerService.createPlayer({
        name: "Jugador GPS 2",
        latitude: 12.34,
        longitude: 56.78,
      });

      const result = await playerService.updatePlayerPartial(
        player._id.toString(),
        { longitude: 99.99 },
      );

      expect(result.coords.coordinates[0]).toBeCloseTo(99.99); // Longitud nueva
      expect(result.coords.coordinates[1]).toBeCloseTo(12.34); // Latitud conservada
    });

    it("Debería actualizar campos adicionales y permitir establecer birthdate a null", async () => {
      const player = await playerService.createPlayer({
        name: "ToUpdate",
        birthdate: "1990-05-05T00:00:00.000Z",
        nationality: "Old",
        height: 170,
        weight: 70,
      });

      const updateData = {
        birthdate: null,
        nationality: "NuevoPais",
        height: 175,
        weight: 72,
        photoUrl: "http://example.com/new.jpg",
        number: 11,
        position: "CM",
        league: "NewLeague",
      };

      const result = await playerService.updatePlayerPartial(
        player._id.toString(),
        updateData,
      );

      expect(result.birthdate).toBeNull();
      expect(result.nationality).toBe("NuevoPais");
      expect(result.height).toBe(175);
      expect(result.weight).toBe(72);
      expect(result.photoUrl).toBe("http://example.com/new.jpg");
      expect(result.number).toBe(11);
      expect(result.position).toBe("CM");
      expect(result.league).toBe("NewLeague");
    });

    it("Debería lanzar un error 'NOT_FOUND' si el ID del jugador no existe en BD", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      // Cuando probamos que una función asíncrona lanza un error en Jest, usamos .rejects.toThrow()
      await expect(
        playerService.updatePlayerPartial(fakeId, { name: "Fantasma" }),
      ).rejects.toThrow("NOT_FOUND");
    });
  });
});
