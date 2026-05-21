export interface User {
  id: string;
  firebaseUid: string; // Para vincular con Firebase Auth
  userName: string;
  email: string;
  role: 'ADMIN' | 'USER';
  //password?: string; // Solo para registro, no se debe enviar al frontend
}
