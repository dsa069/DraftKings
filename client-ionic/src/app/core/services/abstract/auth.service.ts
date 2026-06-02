import { HttpClient } from '@angular/common/http';
import {
  computed,
  effect,
  inject,
  Injectable,
  Signal,
  signal,
} from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  signOut,
  authState,
  createUserWithEmailAndPassword,
  deleteUser,
} from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable()
export abstract class AuthService {
  protected abstract apiUrl: string;
  protected http = inject(HttpClient);
  protected firebaseAuth = inject(Auth);

  // Definimos que existirá una señal, pero no la inicializamos aquí
  // para evitar el error de "used before initialization".
  public abstract readonly isAuthenticated: Signal<boolean>;

  // Usuario de Firebase (disponible para todos los hijos)
  protected readonly _user = toSignal(authState(this.firebaseAuth));

  // Estado global del perfil del usuario obtenido del backend
  protected readonly _userProfile = signal<User | null>(null);

  constructor() {
    // Efecto común para todos los backends: Sincronizar perfil al cambiar el usuario de Firebase o recargar la app
    effect(
      () => {
        const firebaseUser = this._user();

        if (!firebaseUser) {
          this._userProfile.set(null);
          return;
        }

        void this.restoreBackendProfile();
      },
      { allowSignalWrites: true }
    );
  }

  public readonly userProfile = this._userProfile.asReadonly();
  public readonly isAdmin = computed(
    () => this._userProfile()?.role === 'ADMIN'
  );
  public readonly isUser = computed(() => this._userProfile()?.role === 'USER');

  // 1. Lógica común: Login en Firebase
  async loginFirebase(email: string, pass: string): Promise<any> {
    return await signInWithEmailAndPassword(this.firebaseAuth, email, pass);
  }

  async registerFirebase(email: string, pass: string) {
    return await createUserWithEmailAndPassword(this.firebaseAuth, email, pass);
  }

  // 2. Lógica común: Logout
  async logout(): Promise<void> {
    this._userProfile.set(null);
    await signOut(this.firebaseAuth);
  }

  // 3. Lógica común: Obtener Token
  async getToken(): Promise<string | null> {
    const user = this.firebaseAuth.currentUser;
    return user ? await user.getIdToken() : null;
  }

  protected async restoreBackendProfile(): Promise<void> {
    try {
      const profile = await firstValueFrom(this.getProfile());
      this._userProfile.set(profile);
    } catch (error) {
      console.warn(
        'No se pudo restaurar el perfil del backend automáticamente',
        error
      );
    }
  }

  // 4. NUEVO: Lógica de Rollback (Borrar cuenta si el backend falla)
  async deleteCurrentUser(): Promise<void> {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      try {
        await deleteUser(user);
        console.log(
          '🗑️ Rollback ejecutado: Cuenta de Firebase eliminada por fallo en el Backend'
        );
      } catch (error) {
        console.error(
          '⚠️ Error crítico en Rollback: No se pudo eliminar de Firebase',
          error
        );
      }
    }
  }

  // Métodos que CADA backend debe implementar a su manera
  abstract verifyBackend(): Promise<void>;
  abstract registerBackend(extraData: any): Promise<any>;
  abstract getProfile(): Observable<User>;

  // Método orquestador opcional
  async login(email: string, pass: string): Promise<any> {
    await this.loginFirebase(email, pass);
    return await this.verifyBackend();
  }
}
