export interface User {
  id: string;
  userName: string;
  email: string;
  role: 'ADMIN' | 'USER';
  //password?: string; // Solo para registro, no se debe enviar al frontend
}
