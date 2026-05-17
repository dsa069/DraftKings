//Patron Strategy
import { Injectable, Signal } from '@angular/core';
import { AuthService } from '../abstract/auth.service';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs';

@Injectable()
export class AuthNodeService extends AuthService {
  protected apiUrl = 'http://localhost:3000';

  isAuthenticated = null as any; // Implementa tu lógica de autenticación aquí

  async login(email: string, pass: string) {}

  async register(email: string, pass: string, extraData: any) {}

  async getToken(): Promise<string | null> {
    return null;
  }

  async logout(): Promise<void> {}

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }
}
