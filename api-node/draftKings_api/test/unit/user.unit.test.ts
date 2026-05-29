import { Request, Response } from "express";
import { syncUser } from "../../controllers/userController";
import { User } from "../../models/user";

// 1. Mockeamos el modelo User de Mongoose
jest.mock("../../models/user");

describe("UserController (Pruebas Unitarias)", () => {
  let mockRequest: Partial<Request> & { user?: any; isNewUser?: boolean };
  let mockResponse: Partial<Response>;
  let responseJsonMock: jest.Mock;
  let responseStatusMock: jest.Mock;

  beforeEach(() => {
    responseJsonMock = jest.fn();
    responseStatusMock = jest.fn().mockReturnValue({ json: responseJsonMock });

    // Inicializamos un objeto Request base
    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: responseStatusMock,
      json: responseJsonMock,
    };

    jest.clearAllMocks();
  });

  describe("syncUser", () => {
    it("Debería retornar 401 si req.user no existe (Fallo del middleware)", async () => {
      mockRequest.user = undefined; // Simulamos que el middleware falló o no pasó

      await syncUser(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(401);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Petición no autorizada",
      });
    });

    it("Debería retornar 409 si el usuario ya está sincronizado (isNewUser=false)", async () => {
      mockRequest.user = { _id: "id-valido" };
      mockRequest.isNewUser = false; // Usuario recurrente

      await syncUser(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(409);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Usuario ya sincronizado",
      });
    });

    it("Debería retornar 200 y el usuario original si no se envían datos actualizables en el body", async () => {
      mockRequest.user = { _id: "id-valido", userName: "Original" };
      mockRequest.isNewUser = true;
      mockRequest.body = { campoInvalido: "ignórame" }; // Datos que no son userName ni role

      await syncUser(mockRequest as Request, mockResponse as Response);

      // Como el updateData está vacío, devuelve req.user directamente
      expect(responseStatusMock).toHaveBeenCalledWith(200);
      expect(responseJsonMock).toHaveBeenCalledWith(mockRequest.user);
      // Aseguramos que NO llamó a la base de datos
      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("Debería retornar 200 y actualizar si se envían userName y role válidos", async () => {
      mockRequest.user = { _id: "id-valido" };
      mockRequest.isNewUser = true;
      mockRequest.body = { userName: "   Nuevo Nombre   ", role: "ADMIN" };

      const mockUpdatedUser = {
        _id: "id-valido",
        userName: "Nuevo Nombre",
        role: "ADMIN",
      };

      // Simulamos que Mongoose actualiza correctamente
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedUser);

      await syncUser(mockRequest as Request, mockResponse as Response);

      // Verificamos que Mongoose fue llamado con el _id, el objeto "updateData" limpio (.trim() aplicado) y { new: true }
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "id-valido",
        { userName: "Nuevo Nombre", role: "ADMIN" },
        { new: true },
      );
      expect(responseStatusMock).toHaveBeenCalledWith(200);
      expect(responseJsonMock).toHaveBeenCalledWith(mockUpdatedUser);
    });
  });
});
