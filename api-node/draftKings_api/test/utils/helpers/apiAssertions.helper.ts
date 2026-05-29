import type { Response } from "supertest";

export interface ApiErrorExpectation {
  status: number;
  message: string | RegExp;
}

export const expectApiError = (
  response: Response,
  expectation: ApiErrorExpectation,
): void => {
  expect(response.status).toBe(expectation.status);

  const responseMessage = String(response.body?.message ?? "");

  if (expectation.message instanceof RegExp) {
    expect(responseMessage).toMatch(expectation.message);
    return;
  }

  expect(responseMessage).toBe(expectation.message);
};

export const expectUnauthorized = (response: Response): void => {
  expectApiError(response, {
    status: 401,
    message: "Petición no autorizada",
  });
};

export const expectAdminForbidden = (response: Response): void => {
  expectApiError(response, {
    status: 403,
    message: "Acceso denegado. Se requieren privilegios de Administrador.",
  });
};
