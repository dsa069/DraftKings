import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, from, lastValueFrom } from 'rxjs';
import { AuthService } from '../services/abstract/auth.service';

// El Interceptor es el encargado de pegar ese "carnet" (Token) en cada sobre (petición HTTP) que envías al backend.
// Sin el interceptor, tus peticiones llegarían a Spring Boot de forma anónima, y Spring, al no ver el token,
// rechazaría la conexión con un error 401 Unauthorized, impidiéndote llegar a PostgreSQL.

// Si usaras Firestore o Realtime Database, utilizarías el SDK de Firebase directamente (collection(db, 'users')...).
// Ese SDK ya se encarga internamente de gestionar la sesión y enviar las credenciales a los servidores de Google de forma transparente.
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // Inyecta la clase abstracta. El Factory te dará Spring o Node según la config.
  private authService = inject(AuthService);

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return from(this.handleAccess(request, next));
  }

  private async handleAccess(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Promise<HttpEvent<any>> {
    // Le pedimos el token a la estrategia activa
    const token = await this.authService.getToken();

    if (token) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return lastValueFrom(next.handle(request));
  }
}
