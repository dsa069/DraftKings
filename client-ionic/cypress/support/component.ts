import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { mount } from '@cypress/angular';

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
    ...(config.providers ?? []),
  ];
  return mount(component, { ...config, providers });
});
