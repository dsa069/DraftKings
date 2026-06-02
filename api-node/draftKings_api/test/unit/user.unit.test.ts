import { Request, Response } from "express";
import { syncUser } from "../../controllers/userController";
import { User } from "../../models/user";
import {
  alreadySyncedUser,
  ignoredSyncUserBody,
  originalSyncUser,
  unauthorizedSyncUserRequestUser,
  updatedSyncUser,
  validSyncUserBody,
} from "../utils/data/user.test.data";
import { createExpressMockContext } from "../utils/helpers/expressMock.helper";

// 1. Mockeamos el modelo User de Mongoose
jest.mock("../../models/user");

describe("UserController (Pruebas Unitarias)", () => {
  let mockRequest: Partial<Request> & {
    user?: { _id: string; userName?: string; role?: string };
    isNewUser?: boolean;
  };
  let mockResponse: Partial<Response>;
  let responseJsonMock: jest.Mock;
  let responseStatusMock: jest.Mock;

  beforeEach(() => {
    const ctx = createExpressMockContext<
      Partial<Request> & {
        user?: { _id: string; userName?: string; role?: string };
        isNewUser?: boolean;
      }
    >({ body: {} });
    mockRequest = ctx.req;
    mockResponse = ctx.res;
    responseJsonMock = ctx.jsonMock;
    responseStatusMock = ctx.statusMock;

    jest.clearAllMocks();
  });

  describe("syncUser", () => {
    it("Debería retornar 401 si req.user no existe (Fallo del middleware)", async () => {
      mockRequest.user = unauthorizedSyncUserRequestUser; // Simulamos que el middleware falló o no pasó

      await syncUser(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(401);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Petición no autorizada",
      });
    });

    it("Debería retornar 409 si el usuario ya está sincronizado (isNewUser=false)", async () => {
      mockRequest.user = alreadySyncedUser;
      mockRequest.isNewUser = false; // Usuario recurrente

      await syncUser(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(409);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Usuario ya sincronizado",
      });
    });

    it("Debería retornar 200 y el usuario original si no se envían datos actualizables en el body", async () => {
      mockRequest.user = originalSyncUser;
      mockRequest.isNewUser = true;
      mockRequest.body = ignoredSyncUserBody; // Datos que no son userName ni role

      await syncUser(mockRequest as Request, mockResponse as Response);

      // Como el updateData está vacío, devuelve req.user directamente
      expect(responseStatusMock).toHaveBeenCalledWith(200);
      expect(responseJsonMock).toHaveBeenCalledWith(mockRequest.user);
      // Aseguramos que NO llamó a la base de datos
      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("Debería retornar 200 y actualizar si se envían userName y role válidos", async () => {
      mockRequest.user = alreadySyncedUser;
      mockRequest.isNewUser = true;

      // Simulamos que Mongoose actualiza correctamente
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedSyncUser);

      mockRequest.body = validSyncUserBody;

      await syncUser(mockRequest as Request, mockResponse as Response);

      // Verificamos que Mongoose fue llamado con el _id, el objeto "updateData" limpio (.trim() aplicado) y { new: true }
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "id-valido",
        { userName: "Nuevo Nombre", role: "ADMIN" },
        { new: true },
      );
      expect(responseStatusMock).toHaveBeenCalledWith(200);
      expect(responseJsonMock).toHaveBeenCalledWith(updatedSyncUser);
    });
  });
});
