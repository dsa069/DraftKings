//Patron Strategy
import { Injectable, computed } from '@angular/core';
import { AuthService } from '../abstract/auth.service';
import { firstValueFrom, Observable, switchMap, from } from 'rxjs';
import { User } from '../../models/user.model';
import { environment } from '../../../../environments/environment';

@Injectable()
export class AuthSpringService extends AuthService {
  protected apiUrl = environment.springApiUrl + '/userms'; // URL de tu Gateway de Spring

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
      throw new Error(
        'El usuario no está registrado en el sistema SpringBoot.',
      );
    }
  }

  async registerBackend(extraData: any) {
    const token = await this.getToken();
    if (!token) throw new Error('No hay sesión de Firebase para sincronizar');

    // Validar que se proporciona un userName
    if (
      !extraData ||
      !extraData.userName ||
      typeof extraData.userName !== 'string'
    ) {
      throw new Error('Se requiere un userName válido para registrarse');
    }

    try {
      // Sincronización con PostgreSQL
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}/api/auth/sync-user`, extraData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      console.log('Usuario sincronizado con SpringBoot backend:', response);
      return response;
    } catch (error) {
      console.error('Error al sincronizar con SpringBoot:', error);
      throw new Error('Error al sincronizar con el backend de SpringBoot');
    }
  }

  getProfile(): Observable<User> {
    return from(this.getToken()).pipe(
      // Convertimos la promesa del token a Observable
      switchMap((token) => {
        if (!token) {
          throw new Error('No hay token disponible');
        }

        return this.http.get<User>(`${this.apiUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }),
    );
  }
}
