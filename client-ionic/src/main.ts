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
import { HttpClient, provideHttpClient } from '@angular/common/http';

import { PlayerService } from './app/core/services/implementations/player.service';
import { playerFactory } from './app/core/services/factory/player.factory';
import { ReviewService } from './app/core/services/implementations/review.service';
import { reviewFactory } from './app/core/services/factory/review.factory';
import { AuthService } from './app/core/services/implementations/auth.service';
import { authFactory } from './app/core/services/factory/auth.factory';
import { ConfigService } from './app/core/services/config.service';

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
    // REGISTRO DEL PATRÓN FACTORY/STRATEGY
    {
      provide: PlayerService, // Cuando un componente pida la clase abstracta...
      useFactory: playerFactory, // ...Angular ejecutará esta función...
      deps: [HttpClient, ConfigService], // ...pasándole lo que necesita.
    },
    {
      provide: ReviewService,
      useFactory: reviewFactory,
      deps: [HttpClient, ConfigService],
    },
    {
      provide: AuthService,
      useFactory: authFactory,
      deps: [HttpClient, ConfigService],
    },
  ],
});
