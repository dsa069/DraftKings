import type { Test } from "supertest";

export type TestRole = "ADMIN" | "USER";

export interface AuthRequestOptions {
  token?: string;
  role?: TestRole;
  headers?: Readonly<Record<string, string>>;
}

const DEFAULT_TEST_TOKEN = "mock-token";

export const withAuth = <T extends Test>(
  testRequest: T,
  options: AuthRequestOptions = {},
): T => {
  const { token = DEFAULT_TEST_TOKEN, role, headers } = options;

  testRequest.set("Authorization", `Bearer ${token}`);

  if (role !== undefined) {
    testRequest.set("x-test-role", role);
  }

  if (headers !== undefined) {
    for (const [headerName, headerValue] of Object.entries(headers)) {
      testRequest.set(headerName, headerValue);
    }
  }

  return testRequest;
};

export const withAdminAuth = <T extends Test>(
  testRequest: T,
  token = "mock-token-admin",
): T => withAuth(testRequest, { token, role: "ADMIN" });

export const withUserAuth = <T extends Test>(
  testRequest: T,
  token = DEFAULT_TEST_TOKEN,
): T => withAuth(testRequest, { token, role: "USER" });
