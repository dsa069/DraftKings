import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
  withHashLocation,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './app/core/interceptors/auth.interceptor';

import { PlayerService } from './app/core/services/abstract/player.service';
import { playerFactory } from './app/core/services/factory/player.factory';
import { ReviewService } from './app/core/services/abstract/review.service';
import { reviewFactory } from './app/core/services/factory/review.factory';
import { AuthService } from './app/core/services/abstract/auth.service';
import { authFactory } from './app/core/services/factory/auth.factory';
import { ConfigService } from './app/core/services/config.service';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withHashLocation(),
    ),
    provideHttpClient(),
    // 1. Inicializar Firebase
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    // 2. Registrar el Interceptor
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    // 3. Tus Factories actuales
    { provide: AuthService, useFactory: authFactory, deps: [ConfigService] },
    // REGISTRO DEL PATRÓN FACTORY/STRATEGY
    {
      provide: PlayerService, // Cuando un componente pida la clase abstracta...
      useFactory: playerFactory, // ...Angular ejecutará esta función...
      deps: [ConfigService], // ...pasándole lo que necesita.
    },
    {
      provide: ReviewService,
      useFactory: reviewFactory,
      deps: [ConfigService],
    },
    {
      provide: AuthService,
      useFactory: authFactory,
      deps: [ConfigService],
    },
  ],
});
