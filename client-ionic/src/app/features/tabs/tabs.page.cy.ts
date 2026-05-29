import { signal, WritableSignal } from '@angular/core';
import { TabsPage } from './tabs.page';
import { AuthService } from '../../core/services/abstract/auth.service';
import { ToastController } from '@ionic/angular/standalone';

describe('TabsPage Component', () => {
  let authServiceMock: Partial<AuthService>;
  let toastControllerMock: Partial<ToastController>;
  let isAuthenticatedMock: WritableSignal<boolean>;

  beforeEach(() => {
    // Inicializamos el Signal reactivo
    isAuthenticatedMock = signal(false);

    // Mock del AuthService
    authServiceMock = {
      isAuthenticated: isAuthenticatedMock as any,
    };

    // Mock del ToastController
    toastControllerMock = {
      create: cy.stub().resolves({
        present: cy.stub().resolves(),
      } as any),
    };
  });

  const mountComponent = () => {
    cy.mount(TabsPage, {
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastController, useValue: toastControllerMock },
      ],
    });
  };

  describe('Renderizado e Interfaz Base (UI)', () => {
    beforeEach(() => {
      mountComponent();
    });

    it('debe renderizar la barra de navegación en la parte inferior', () => {
      cy.get('ion-tab-bar').should('exist').and('have.attr', 'slot', 'bottom');
    });

    it('debe mostrar la pestaña "Players" con su icono y texto correctos', () => {
      cy.get('ion-tab-button[tab="players"]').should('exist');
      cy.get('ion-tab-button[tab="players"] ion-icon').should(
        'have.attr',
        'name',
        'people-outline'
      );
      cy.get('ion-tab-button[tab="players"] ion-label').should(
        'contain.text',
        'Players'
      );
    });

    it('debe mostrar la pestaña "Settings" con su icono y texto correctos', () => {
      cy.get('ion-tab-button[tab="settings"]').should('exist');
      cy.get('ion-tab-button[tab="settings"] ion-icon').should(
        'have.attr',
        'name',
        'settings-outline'
      );
      cy.get('ion-tab-button[tab="settings"] ion-label').should(
        'contain.text',
        'Settings'
      );
    });
  });

  describe('Interacciones: Pestañas Públicas (Players y Settings)', () => {
    beforeEach(() => {
      mountComponent();
    });

    it('NO debe disparar el Toast informativo al hacer clic en "Players"', () => {
      cy.contains('ion-tab-button', 'Players').click();

      // Aseguramos que la lógica de Auth no interfiera con pestañas públicas
      cy.wrap(toastControllerMock.create).should('not.have.been.called');
    });

    it('NO debe disparar el Toast informativo al hacer clic en "Settings"', () => {
      cy.contains('ion-tab-button', 'Settings').click();

      cy.wrap(toastControllerMock.create).should('not.have.been.called');
    });
  });

  describe('Flujo de Estado: Usuario NO Autenticado', () => {
    beforeEach(() => {
      isAuthenticatedMock.set(false);
      mountComponent();
    });

    it('debe renderizar "My Squad" SIN el atributo "tab" para bloquear navegación nativa', () => {
      cy.contains('ion-tab-button', 'My Squad')
        .should('exist')
        .and('not.have.attr', 'tab');
    });

    it('debe interceptar el clic en "My Squad" y mostrar un Toast informativo', () => {
      cy.contains('ion-tab-button', 'My Squad').click();

      cy.wrap(toastControllerMock.create).should('have.been.calledOnceWith', {
        message: 'Please log in or register to build your squad.',
        duration: 3000,
        position: 'bottom',
        color: 'tertiary',
      });
    });
  });

  describe('Flujo de Estado: Usuario Autenticado', () => {
    beforeEach(() => {
      isAuthenticatedMock.set(true);
      mountComponent();
    });

    it('debe renderizar "My Squad" CON el atributo "tab=\'my-team\'" habilitando el router', () => {
      cy.contains('ion-tab-button', 'My Squad')
        .should('exist')
        .and('have.attr', 'tab', 'my-team');
    });

    it('NO debe disparar el Toast informativo al hacer clic en "My Squad"', () => {
      cy.contains('ion-tab-button', 'My Squad').click();

      // El evento click nativo será manejado por el enrutador de Ionic, no por el Toast
      cy.wrap(toastControllerMock.create).should('not.have.been.called');
    });
  });
});
