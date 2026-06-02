export const adminProfile = {
  id: '1',
  firebaseUid: 'firebase-admin-uid',
  userName: 'ProGamer99',
  email: 'coach@draftkings.com',
  role: 'ADMIN' as const,
};

export const registeredProfile = {
  id: '2',
  firebaseUid: 'firebase-user-uid',
  userName: 'FanScout7',
  email: 'fan@draftkings.com',
  role: 'USER' as const,
};

export const signedInResponse = {
  localId: 'firebase-admin-uid',
  email: 'coach@draftkings.com',
  displayName: 'ProGamer99',
  idToken: 'mock-id-token',
  registered: true,
  refreshToken: 'mock-refresh-token',
  expiresIn: '3600',
};
