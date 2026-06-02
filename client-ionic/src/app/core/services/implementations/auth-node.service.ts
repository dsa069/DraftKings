//Patron Strategy
import { Injectable, Signal, computed } from '@angular/core';
import { AuthService } from '../abstract/auth.service';
import { User } from '../../models/user.model';
import { Observable, from, switchMap, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable()
export class AuthNodeService extends AuthService {
  protected apiUrl = environment.nodeApiUrl; // URL del backend de Node.js desde environment

  // Implementamos la señal de autenticación de forma computada
  // (similar a AuthSpringService)
  public override readonly isAuthenticated: Signal<boolean> = computed(
    () => !!this._user()
  );

  /**
   * Verifica si el usuario existe en el backend de Node.js.
   * Realiza una petición GET /api/user/profile usando el token de Firebase.
   * Si el usuario no existe → 401 Unauthorized → se lanza un error.
   */
  async verifyBackend(): Promise<void> {
    // 1. Obtener el token de Firebase del usuario actual
    const token = await this.getToken();

    if (!token) throw new Error('No hay token disponible');

    try {
      // 2. Confirmar existencia en MongoDB y guardar el perfil devuelto
      const userProfile = await firstValueFrom(
        this.http.get<User>(`${this.apiUrl}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      this._userProfile.set(userProfile);

      console.log('Backend verificado. Rol cargado:', userProfile.role);
    } catch (error) {
      this._userProfile.set(null);

      // Si el usuario existe en Firebase pero NO en la BD de Node, forzamos logout
      // para que no quede una sesión a medias.
      await this.logout();
      throw new Error(
        'El usuario no está registrado en el sistema local de Node.js.'
      );
    }
  }

  /**
   * Registra/sincroniza el usuario en el backend de Node.js.
   * Realiza una petición POST /api/user/sync con el userName en el body.
   * Este endpoint crea el usuario automáticamente si no existe (usa authorizeRequest con creación).
   *
   * @param extraData - Debe contener al menos { userName: string }
   */
  async registerBackend(extraData: any): Promise<any> {
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
      // Sincronización con MongoDB mediante POST /api/user/sync
      // El backend creará el usuario si no existe y actualizará el userName
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}/user/sync`, extraData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      );

      console.log('Usuario sincronizado con Node.js backend:', response);
      return response;
    } catch (error: any) {
      console.error('Error al sincronizar usuario:', error);
      throw new Error(
        `Error al registrarse en Node.js: ${
          error.error?.message || error.message
        }`
      );
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado.
   * Realiza una petición GET /api/user/profile con el token JWT.
   * Requiere que el usuario esté ya registrado.
   */
  getProfile(): Observable<User> {
    return from(this.getToken()).pipe(
      switchMap((token) => {
        if (!token) {
          throw new Error('No hay token disponible');
        }

        return this.http.get<User>(`${this.apiUrl}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      })
    );
  }
}
