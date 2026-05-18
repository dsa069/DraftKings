import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { Injectable, inject, Signal } from '@angular/core';

@Injectable()
export abstract class AuthService {
  protected abstract apiUrl: string; // Cada hijo dirá su URL
  protected http = inject(HttpClient);
  public abstract readonly isAuthenticated: Signal<boolean>;

  abstract loginFirebase(email: string, pass: string): Promise<any>;
  abstract verifyBackend(): Promise<void>;
  abstract register(email: string, pass: string, extraData?: any): Promise<any>;
  abstract getToken(): Promise<string | null>;
  abstract logout(): Promise<void>;
  abstract getProfile(): Observable<User>;

  // Orquestador para cuando NO hay cambio de backend
  async login(email: string, pass: string): Promise<any> {
    await this.loginFirebase(email, pass);
    return await this.verifyBackend();
  }

  getUser(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }
  // ... el resto de métodos CRUD aquí una sola vez
}
