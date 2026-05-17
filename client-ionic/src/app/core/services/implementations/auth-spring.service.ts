import { Injectable, inject } from '@angular/core';
import { AuthService } from '../abstract/auth.service';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getIdToken,
  signOut,
} from '@angular/fire/auth';
import { firstValueFrom, Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable()
export class AuthSpringService extends AuthService {
  protected apiUrl = 'http://localhost:8080/userms'; // URL de tu Gateway de Spring

  // Inyectamos Firebase SOLO para la estrategia de Spring
  private firebaseAuth = inject(Auth);

  async login(email: string, pass: string) {
    // 1. Autenticar con Firebase
    const userCredential = await signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      pass,
    );

    // 2. Obtener el token de Firebase
    const token = await getIdToken(userCredential.user);

    try {
      // 3. Confirmar existencia en PostgreSQL llamando al nuevo endpoint
      // Si el usuario no existe en la DB, el backend devolverá un error (404 o 401)
      // y saltará al bloque 'catch'.
      await firstValueFrom(
        this.http.get(`${this.apiUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      console.log('Login completo: Firebase y PostgreSQL confirmados');
      return userCredential;
    } catch (error) {
      // Si el usuario existe en Firebase pero NO en tu DB, forzamos el logout de Firebase
      // para que no quede una sesión a medias.
      await this.logout();
      throw new Error('El usuario no está registrado en el sistema local.');
    }
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
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json', // <--- AÑADE ESTA LÍNEA CRÍTICA
        },
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

  getProfile(): Observable<User> {
    // El Interceptor adjuntará automáticamente el token de Firebase
    return this.http.get<User>(`${this.apiUrl}/api/auth/me`);
  }
}
