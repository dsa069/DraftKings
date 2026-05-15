import { Injectable, inject } from '@angular/core';
import { AuthService } from '../abstract/auth.service';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getIdToken,
  signOut,
} from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthSpringService extends AuthService {
  protected apiUrl = 'http://localhost:8080'; // URL de tu Gateway de Spring

  // Inyectamos Firebase SOLO para la estrategia de Spring
  private firebaseAuth = inject(Auth);

  async login(email: string, pass: string) {
    return await signInWithEmailAndPassword(this.firebaseAuth, email, pass);
  }

  async register(email: string, pass: string, extraData: any) {
    // 1. Registrar en Firebase
    const userCredential = await createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      pass,
    );

    // 2. Obtener el token recién creado
    const token = await getIdToken(userCredential.user, true);

    // 3. Sincronizar con tu backend (PostgreSQL) a través del Gateway
    // Usamos firstValueFrom para esperar a que el backend guarde al usuario
    await firstValueFrom(
      this.http.post(`${this.apiUrl}/api/auth/sync-user`, extraData, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    );

    return userCredential;
  }

  async getToken(): Promise<string | null> {
    const user = this.firebaseAuth.currentUser;
    return user ? await getIdToken(user) : null;
  }

  async logout(): Promise<void> {
    await signOut(this.firebaseAuth);
  }
}
