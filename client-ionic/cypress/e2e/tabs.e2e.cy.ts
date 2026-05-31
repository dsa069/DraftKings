import { getToastMessage, visitApp } from '../support/e2e-helpers';

describe('Smoke de navegación de tabs', () => {
  beforeEach(() => {
    visitApp('/tabs/players');
  });

  it('navega entre Players y Settings desde la barra inferior', () => {
    // Smoke test: navegación básica sin depender de autenticación.
    cy.contains('ion-tab-button', 'Players').click({ force: true });
    cy.url().should('include', '/#/tabs/players');

    cy.contains('ion-tab-button', 'Settings').click({ force: true });
    cy.url().should('include', '/#/tabs/settings');
  });

  it('muestra el toast de acceso cuando My Squad no está disponible', () => {
    // Escenario anónimo: la app protege la vista de equipo con un aviso claro.
    cy.contains('ion-tab-button', 'My Squad').click({ force: true });

    getToastMessage().should(
      'contain.text',
      'Please log in or register to access this feature.'
    );
    cy.url().should('include', '/#/tabs/players');
  });
});
