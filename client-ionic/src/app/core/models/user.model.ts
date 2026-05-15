export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  //password?: string; // Solo para registro, no se debe enviar al frontend
}
