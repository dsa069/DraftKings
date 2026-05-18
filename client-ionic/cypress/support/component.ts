import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { mount } from '@cypress/angular';
import { AuthService } from '../../src/app/core/services/abstract/auth.service';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from '../../src/environments/environment.prod';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';

// Agrega la declaración de tipo para el comando personalizado 'mount'
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add('mount', (component, config = {}) => {
  const providers = [
    provideRouter([]),
    provideIonicAngular(),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    AuthService,
    ...(config.providers ?? []),
  ];
  return mount(component, { ...config, providers });
});
