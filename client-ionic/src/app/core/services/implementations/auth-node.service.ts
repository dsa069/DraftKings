//Patron Strategy
import { Injectable, Signal, signal, inject } from '@angular/core';
import { AuthService } from '../abstract/auth.service';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { authState } from '@angular/fire/auth';

@Injectable()
export class AuthNodeService extends AuthService {
  protected apiUrl = 'http://localhost:3000';

  private firebaseAuth = inject(Auth);

  readonly _user = toSignal(authState(this.firebaseAuth));

  public override isAuthenticated: Signal<boolean> = signal(false); // Implementa tu lógica de autenticación aquí

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
    // Aquí iría la lógica para verificar el backend de Node.js
    // Por ejemplo, podrías hacer una llamada HTTP a tu API para confirmar que el usuario existe en tu base de datos.
    console.log('Verificando backend de Node.js...');

    // Simulación de verificación exitosa
  }

  async register(email: string, pass: string, extraData: any) {}

  async getToken(): Promise<string | null> {
    return null;
  }

  async logout(): Promise<void> {}

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }
}
