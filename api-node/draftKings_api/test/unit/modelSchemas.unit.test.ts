import mongoose from "mongoose";
import Player from "../../models/player";
import Review from "../../models/review";
import { User } from "../../models/user";

describe("Model schemas (Pruebas Unitarias)", () => {
  describe("Player model", () => {
    it("Debería aplicar defaults y validar un jugador mínimo válido", () => {
      const player = new Player({
        name: "Lamine Yamal",
        coords: {
          coordinates: [2.12, 41.38],
        },
      });

      expect(player.birthdate).toBeNull();
      expect(player.coords.type).toBe("Point");
      expect(player.created_at).toBeInstanceOf(Date);
      expect(player.validateSync()).toBeUndefined();
    });

    it("Debería devolver errores de validación cuando faltan campos obligatorios", () => {
      const player = new Player({});
      const validationError = player.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError?.errors.name).toBeDefined();
      expect(validationError?.errors["coords.coordinates"]).toBeDefined();
    });

    it("Debería transformar a JSON aplanando coordenadas y birthdate", () => {
      const birthdate = new Date("2007-07-13T00:00:00.000Z");
      const player = new Player({
        name: "Lamine Yamal",
        birthdate,
        coords: {
          coordinates: [2.12, 41.38],
        },
      });

      const json = player.toJSON();

      expect(json.id).toEqual(player._id);
      expect(json.longitude).toBe(2.12);
      expect(json.latitude).toBe(41.38);
      expect(json.birthdate).toBe("2007-07-13");
      expect(json).not.toHaveProperty("_id");
      expect(json).not.toHaveProperty("coords");
      expect(json).not.toHaveProperty("__v");
    });

    it("Debería conservar birthdate nulo cuando no se informa", () => {
      const player = new Player({
        name: "Sin Fecha",
        coords: {
          coordinates: [0, 0],
        },
      });

      const json = player.toJSON();

      expect(json.birthdate).toBeNull();
    });

    it("Debería omitir longitude y latitude si no hay coords", () => {
      const player = new Player({
        name: "Sin coords",
      });

      const json = player.toJSON();

      expect(json.longitude).toBeUndefined();
      expect(json.latitude).toBeUndefined();
    });
  });

  describe("Review model", () => {
    const userId = new mongoose.Types.ObjectId();
    const playerId = new mongoose.Types.ObjectId();

    it("Debería aplicar defaults y validar una reseña mínima válida", () => {
      const review = new Review({
        user: userId,
        player: playerId,
        author: "Tester",
        text: "Buen jugador",
        rating: 5,
        coords: {
          coordinates: [2.12, 41.38],
        },
      });

      expect(review.coords.type).toBe("Point");
      expect(review.created_at).toBeInstanceOf(Date);
      expect(review.validateSync()).toBeUndefined();
    });

    it("Debería devolver errores cuando faltan campos obligatorios", () => {
      const review = new Review({
        coords: {
          type: "Point",
        },
      });
      const validationError = review.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError?.errors.user).toBeDefined();
      expect(validationError?.errors.player).toBeDefined();
      expect(validationError?.errors.author).toBeDefined();
      expect(validationError?.errors.text).toBeDefined();
      expect(validationError?.errors.rating).toBeDefined();
    });

    it("Debería rechazar un texto demasiado largo y una nota fuera de rango", () => {
      const review = new Review({
        user: userId,
        player: playerId,
        author: "Tester",
        text: "x".repeat(1001),
        rating: 6,
        coords: {
          coordinates: [2.12, 41.38],
        },
      });

      const validationError = review.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError?.errors.text).toBeDefined();
      expect(validationError?.errors.rating).toBeDefined();
    });

    it("Debería transformar a JSON ocultando campos internos y aplanando coordenadas", () => {
      const review = new Review({
        user: userId,
        player: playerId,
        author: "Tester",
        text: "Gran partido",
        rating: 5,
        coords: {
          coordinates: [2.12, 41.38],
        },
      });

      const json = review.toJSON();

      expect(json.id).toEqual(review._id);
      expect(json.user_id).toEqual(userId);
      expect(json.longitude).toBe(2.12);
      expect(json.latitude).toBe(41.38);
      expect(json).not.toHaveProperty("_id");
      expect(json).not.toHaveProperty("coords");
      expect(json).not.toHaveProperty("user");
      expect(json).not.toHaveProperty("player");
    });

    it("Debería omitir longitude y latitude si no hay coords", () => {
      const review = new Review({
        user: userId,
        player: playerId,
        author: "Tester",
        text: "Sin coords",
        rating: 4,
      });

      const json = review.toJSON();

      expect(json.longitude).toBeUndefined();
      expect(json.latitude).toBeUndefined();
    });

    it("Debería omitir longitude y latitude si coords no incluye coordinates", () => {
      const review = new Review({
        user: userId,
        player: playerId,
        author: "Tester",
        text: "Coords incompletas",
        rating: 4,
        coords: {
          type: "Point",
        },
      });

      const json = review.toJSON();

      expect(json.longitude).toBeUndefined();
      expect(json.latitude).toBeUndefined();
    });
  });

  describe("User model", () => {
    it("Debería aplicar defaults al crear un usuario válido", () => {
      const user = new User({
        firebaseUid: "firebase-uid",
        email: "user@example.com",
      });

      expect(user.role).toBe("USER");
      expect(user.is_active).toBe(true);
      expect(user.blocked).toBe(false);
      expect(user.validateSync()).toBeUndefined();
    });

    it("Debería devolver errores cuando faltan firebaseUid o email", () => {
      const user = new User({ userName: "Tester" });
      const validationError = user.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError?.errors.firebaseUid).toBeDefined();
      expect(validationError?.errors.email).toBeDefined();
    });

    it("Debería exponer timestamps y mantener el schema configurado", () => {
      expect(User.schema.options.timestamps).toBe(true);
    });
  });
});
