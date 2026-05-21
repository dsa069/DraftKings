export interface User {
  id: string;
  firebaseUid: string; // Para vincular con Firebase Auth
  userName: string;
  email: string;
  role: 'ADMIN' | 'USER';
  //password?: string; // Solo para registro, no se debe enviar al frontend
}
//* **En Node/Express/Mongoose:** Si guardas las referencias de forma bidireccional, añade el array en el esquema de usuario:

//  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]