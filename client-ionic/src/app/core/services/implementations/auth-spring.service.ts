import { Injectable, inject, computed } from '@angular/core';
import { AuthService } from '../abstract/auth.service';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getIdToken,
  signOut,
} from '@angular/fire/auth';
import { firstValueFrom, Observable, switchMap, from } from 'rxjs';
import { User } from '../../models/user.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { authState } from '@angular/fire/auth';

@Injectable()
export class AuthSpringService extends AuthService {
  protected apiUrl = 'http://localhost:8080/userms'; // URL de tu Gateway de Spring

  // Inyectamos Firebase SOLO para la estrategia de Spring
  private firebaseAuth = inject(Auth);

  readonly _user = toSignal(authState(this.firebaseAuth));

  // 2. Implementamos la señal abstracta de forma computada
  // Esto es independiente de la lógica interna; el componente solo verá true/false
  public override readonly isAuthenticated = computed(() => !!this._user());

  async loginFirebase(email: string, pass: string): Promise<any> {
    // 1. Autenticar con Firebase
    const userCredential = await signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      pass,
    );

    return userCredential;
  }

  async verifyBackend(): Promise<void> {
    // 1. Obtener el token de Firebase del usuario actual
    const token = await this.getToken();

    if (!token) throw new Error('No hay token disponible');

    try {
      // 2. Confirmar existencia en PostgreSQL llamando al nuevo endpoint
      // Si el usuario no existe en la DB, el backend devolverá un error (404 o 401)
      // y saltará al bloque 'catch'.
      await firstValueFrom(
        this.http.get(`${this.apiUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      console.log('Backend verificado: Usuario existe en PostgreSQL');
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
    return from(this.getToken()).pipe(
      // Convertimos la promesa del token a Observable
      switchMap((token) => {
        return this.http.get<User>(`${this.apiUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }),
    );
  }
}
