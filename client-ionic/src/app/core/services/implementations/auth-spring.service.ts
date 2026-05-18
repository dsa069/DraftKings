import { Injectable, computed } from '@angular/core';
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

@Injectable()
export class AuthSpringService extends AuthService {
  protected apiUrl = 'http://localhost:8080/userms'; // URL de tu Gateway de Spring

  // 2. Implementamos la señal abstracta de forma computada
  // Esto es independiente de la lógica interna; el componente solo verá true/false
  public override readonly isAuthenticated = computed(() => !!this._user());

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

  async registerBackend(extraData: any) {
    const token = await this.getToken();
    if (!token) throw new Error('No hay sesión de Firebase para sincronizar');

    // Sincronización con PostgreSQL
    return await firstValueFrom(
      this.http.post(`${this.apiUrl}/api/auth/sync-user`, extraData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }),
    );
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
