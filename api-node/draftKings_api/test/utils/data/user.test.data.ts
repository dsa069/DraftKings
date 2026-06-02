export type SyncUserRole = "ADMIN" | "USER";

export interface SyncUserAuthenticatedUser {
  _id: string;
  userName?: string;
  role?: SyncUserRole;
}

export interface SyncUserUpdateBody {
  userName?: string;
  role?: SyncUserRole;
  [key: string]: unknown;
}

export interface TestUserSeed {
  firebaseUid: string;
  email: string;
  userName: string;
  role: SyncUserRole;
}

export const unauthorizedSyncUserRequestUser = undefined;

export const alreadySyncedUser = {
  _id: "id-valido",
} satisfies SyncUserAuthenticatedUser;

export const originalSyncUser = {
  _id: "id-valido",
  userName: "Original",
} satisfies SyncUserAuthenticatedUser;

export const ignoredSyncUserBody = {
  campoInvalido: "ignórame",
} satisfies SyncUserUpdateBody;

export const validSyncUserBody = {
  userName: "   Nuevo Nombre   ",
  role: "ADMIN",
} satisfies SyncUserUpdateBody;

export const adminSyncUserBody = {
  userName: "NuevoNombre",
  role: "ADMIN",
} satisfies SyncUserUpdateBody;

export const blankSyncUserBody = {
  userName: "   ",
  role: "SUPERADMIN" as unknown as SyncUserRole,
} satisfies SyncUserUpdateBody;

export const updatedSyncUser = {
  _id: "id-valido",
  userName: "Nuevo Nombre",
  role: "ADMIN",
} satisfies SyncUserAuthenticatedUser;

export const testUserSeed = {
  firebaseUid: "testUid123",
  email: "test@example.com",
  userName: "UsuarioTest",
  role: "USER",
} satisfies TestUserSeed;
