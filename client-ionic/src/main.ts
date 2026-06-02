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
import { defineCustomElements } from '@ionic/pwa-elements/loader';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';
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
import { teamFactory } from './app/core/services/factory/team.factory';
import { TeamService } from './app/core/services/abstract/team.service';
import { NewsService } from './app/core/services/abstract/news.service';
import { NewsFactory } from './app/core/services/factory/news.factory';

import { AuthSpringService } from './app/core/services/implementations/auth-spring.service';
import { AuthNodeService } from './app/core/services/implementations/auth-node.service';
import { PlayerSpringService } from './app/core/services/implementations/player-spring.service';
import { PlayerNodeService } from './app/core/services/implementations/player-node.service';
import { ReviewSpringService } from './app/core/services/implementations/review-spring.service';
import { ReviewNodeService } from './app/core/services/implementations/review-node.service';
import { TeamSpringService } from './app/core/services/implementations/team-spring.service';
import { TeamNodeService } from './app/core/services/implementations/team-node.service';
import { NewsSpringService } from './app/core/services/implementations/news-spring.service';
import { NewsNodeService } from './app/core/services/implementations/news-node.service';

console.log('🚀 Configuración cargada:', {
  produccion: environment.production,
  proyectoId: environment.firebaseConfig?.projectId,
  springApiUrl: environment.springApiUrl,
  nodeApiUrl: environment.nodeApiUrl ? '✅ Cargada' : '❌ No encontrada',
});

defineCustomElements(window);

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withHashLocation()
    ),
    provideHttpClient(),
    // 1. Inicializar Firebase
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    // 2. Registrar el Interceptor
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    // 3. Servicios concretos registrados en el DI (Strategy Pattern)
    AuthSpringService,
    AuthNodeService,
    PlayerSpringService,
    PlayerNodeService,
    ReviewSpringService,
    ReviewNodeService,
    TeamSpringService,
    TeamNodeService,
    NewsSpringService,
    NewsNodeService,

    // 4. Factories que resuelven la implementación según el backend seleccionado
    {
      provide: AuthService,
      useFactory: authFactory,
      deps: [ConfigService, AuthSpringService, AuthNodeService],
    },
    {
      provide: PlayerService,
      useFactory: playerFactory,
      deps: [ConfigService, PlayerSpringService, PlayerNodeService],
    },
    {
      provide: ReviewService,
      useFactory: reviewFactory,
      deps: [ConfigService, ReviewSpringService, ReviewNodeService],
    },
    {
      provide: TeamService,
      useFactory: teamFactory,
      deps: [ConfigService, TeamSpringService, TeamNodeService],
    },
    {
      provide: NewsService,
      useFactory: NewsFactory,
      deps: [ConfigService, NewsSpringService, NewsNodeService],
    },
  ],
});
