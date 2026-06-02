import { signal, WritableSignal } from '@angular/core';
import { TabsPage } from './tabs.page';
import { AuthService } from '../../core/services/abstract/auth.service';
import { ToastController } from '@ionic/angular/standalone';

describe('TabsPage Component', () => {
  let authServiceMock: Partial<AuthService>;
  let toastControllerMock: Partial<ToastController>;
  let isAuthenticatedMock: WritableSignal<boolean>;

  beforeEach(() => {
    // Inicializamos el Signal reactivo de control local para el test
    isAuthenticatedMock = signal(false);

    // Mock de AuthService adaptado estrictamente a las señales abstractas reales
    authServiceMock = {
      isAuthenticated: (() => isAuthenticatedMock()) as any,
      userProfile: (() => null) as any,
      isAdmin: (() => false) as any,
      isUser: (() => false) as any,
      logout: cy.stub().resolves(),
      getToken: cy.stub().resolves(null),
    };

    // Mock del ToastController de Ionic con una simulación del ciclo de vida resuelta
    toastControllerMock = {
      create: cy.stub().resolves({
        present: cy.stub().resolves(),
      } as any),
    };
  });

  // Función auxiliar para montar el componente inyectando los stubs correspondientes
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

      // Aseguramos que la lógica de Auth no interfiera con pestañas de libre acceso
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

    it('debe renderizar "My Squad" SIN el atributo "tab" para bloquear el enrutamiento nativo', () => {
      // Valida la directiva estructural @if (!authService.isAuthenticated()) del template
      cy.contains('ion-tab-button', 'My Squad')
        .should('exist')
        .and('not.have.attr', 'tab');
    });

    it('debe interceptar el clic en "My Squad" y disparar un Toast informativo al usuario', () => {
      cy.contains('ion-tab-button', 'My Squad').click();

      // Verifica los parámetros exactos requeridos por el método KISS de la clase
      cy.wrap(toastControllerMock.create).should('have.been.calledOnceWith', {
        message: 'Please log in or register to access this feature.',
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
      // Valida el bloque estructural @else del template reactivo
      cy.contains('ion-tab-button', 'My Squad')
        .should('exist')
        .and('have.attr', 'tab', 'my-team');
    });

    it('NO debe disparar el Toast informativo al hacer clic en "My Squad"', () => {
      cy.contains('ion-tab-button', 'My Squad').click();

      // El evento click nativo será manejado por el enrutador dinámico de las tabs, evitando el Toast
      cy.wrap(toastControllerMock.create).should('not.have.been.called');
    });
  });
});
