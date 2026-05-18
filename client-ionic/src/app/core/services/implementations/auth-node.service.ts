//Patron Strategy
import { Injectable, Signal, signal, inject } from '@angular/core';
import { AuthService } from '../abstract/auth.service';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs';

@Injectable()
export class AuthNodeService extends AuthService {
  protected apiUrl = 'http://localhost:3000';

  public override isAuthenticated: Signal<boolean> = signal(false); // Implementa tu lógica de autenticación aquí

  async verifyBackend(): Promise<void> {
    // Aquí iría la lógica para verificar el backend de Node.js
    // Por ejemplo, podrías hacer una llamada HTTP a tu API para confirmar que el usuario existe en tu base de datos.
    console.log('Verificando backend de Node.js...');

    // Simulación de verificación exitosa
  }

  async registerBackend(extraData: any) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }
}
