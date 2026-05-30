import Player from "../../models/player";
import Review from "../../models/review";
import { User } from "../../models/user";
import {
  modelPlayerInvalidSeed,
  modelPlayerMinimalSeed,
  modelPlayerMissingCoordsSeed,
  modelPlayerSeed,
  modelReviewPlayerId,
  modelReviewLongSeed,
  modelReviewMissingFieldsSeed,
  modelReviewUserId,
  modelReviewSeed,
  modelReviewWithoutCoordsSeed,
  modelUserMissingRequiredFieldsSeed,
  modelUserSeed,
} from "../utils/data/model.test.data";

describe("Model schemas (Pruebas Unitarias)", () => {
  describe("Player model", () => {
    it("Debería aplicar defaults y validar un jugador mínimo válido", () => {
      const player = new Player({
        ...modelPlayerMinimalSeed,
      });

      expect(player.birthdate).toBeNull();
      expect(player.coords.type).toBe("Point");
      expect(player.created_at).toBeInstanceOf(Date);
      expect(player.validateSync()).toBeUndefined();
    });

    it("Debería devolver errores de validación cuando faltan campos obligatorios", () => {
      const player = new Player(modelPlayerInvalidSeed);
      const validationError = player.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError?.errors.name).toBeDefined();
      expect(validationError?.errors["coords.coordinates"]).toBeDefined();
    });

    it("Debería transformar a JSON aplanando coordenadas y birthdate", () => {
      const birthdate = new Date("2007-07-13T00:00:00.000Z");
      const player = new Player({
        ...modelPlayerSeed,
        birthdate,
      });

      const json = player.toJSON();
      const serialized = json as unknown as Record<string, unknown>;

      expect(serialized.id).toEqual(player._id);
      expect(serialized.longitude).toBe(2.12);
      expect(serialized.latitude).toBe(41.38);
      expect(serialized.birthdate).toBe("2007-07-13");
      expect(serialized).not.toHaveProperty("_id");
      expect(serialized).not.toHaveProperty("coords");
      expect(serialized).not.toHaveProperty("__v");
    });

    it("Debería conservar birthdate nulo cuando no se informa", () => {
      const player = new Player({
        ...modelPlayerMinimalSeed,
      });

      const json = player.toJSON();
      const serialized = json as unknown as Record<string, unknown>;

      expect(serialized.birthdate).toBeNull();
    });

    it("Debería omitir longitude y latitude si no hay coords", () => {
      const player = new Player({
        ...modelPlayerMissingCoordsSeed,
      });

      const json = player.toJSON();
      const serialized = json as unknown as Record<string, unknown>;

      expect(serialized.longitude).toBeUndefined();
      expect(serialized.latitude).toBeUndefined();
    });
  });

  describe("Review model", () => {
    it("Debería aplicar defaults y validar una reseña mínima válida", () => {
      const review = new Review({
        ...modelReviewSeed,
      });

      expect(review.coords.type).toBe("Point");
      expect(review.created_at).toBeInstanceOf(Date);
      expect(review.validateSync()).toBeUndefined();
    });

    it("Debería devolver errores cuando faltan campos obligatorios", () => {
      const review = new Review({
        ...modelReviewMissingFieldsSeed,
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
        ...modelReviewLongSeed,
      });

      const validationError = review.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError?.errors.text).toBeDefined();
      expect(validationError?.errors.rating).toBeDefined();
    });

    it("Debería transformar a JSON ocultando campos internos y aplanando coordenadas", () => {
      const review = new Review({
        ...modelReviewSeed,
      });

      const json = review.toJSON();
      const serialized = json as unknown as Record<string, unknown>;

      expect(serialized.id).toEqual(review._id);
      expect(serialized.user_id).toEqual(modelReviewUserId);
      expect(serialized.longitude).toBe(2.12);
      expect(serialized.latitude).toBe(41.38);
      expect(serialized).not.toHaveProperty("_id");
      expect(serialized).not.toHaveProperty("coords");
      expect(serialized).not.toHaveProperty("user");
      expect(serialized).not.toHaveProperty("player");
    });

    it("Debería omitir longitude y latitude si no hay coords", () => {
      const review = new Review({
        ...modelReviewWithoutCoordsSeed,
      });

      const json = review.toJSON();
      const serialized = json as unknown as Record<string, unknown>;

      expect(serialized.longitude).toBeUndefined();
      expect(serialized.latitude).toBeUndefined();
    });

    it("Debería omitir longitude y latitude si coords no incluye coordinates", () => {
      const review = new Review({
        user: modelReviewUserId,
        player: modelReviewPlayerId,
        ...modelReviewMissingFieldsSeed,
      });

      const json = review.toJSON();
      const serialized = json as unknown as Record<string, unknown>;

      expect(serialized.longitude).toBeUndefined();
      expect(serialized.latitude).toBeUndefined();
    });
  });

  describe("User model", () => {
    it("Debería aplicar defaults al crear un usuario válido", () => {
      const user = new User({
        ...modelUserSeed,
      });

      expect(user.role).toBe("USER");
      expect(user.is_active).toBe(true);
      expect(user.blocked).toBe(false);
      expect(user.validateSync()).toBeUndefined();
    });

    it("Debería devolver errores cuando faltan firebaseUid o email", () => {
      const user = new User(modelUserMissingRequiredFieldsSeed);
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
