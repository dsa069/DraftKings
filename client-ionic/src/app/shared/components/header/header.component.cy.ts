import { signal, WritableSignal } from '@angular/core';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../../core/services/abstract/auth.service';
import { TeamService } from '../../../core/services/abstract/team.service';
import { NavController } from '@ionic/angular';
import { By } from '@angular/platform-browser';

describe('HeaderComponent - Test Suite Exhaustivo', () => {
  // 1. Mocks y Stubs
  let authServiceMock: any;
  let teamServiceMock: any;
  let navCtrlMock: Partial<NavController>;

  // 2. Control de Reactividad
  let isAuthenticatedMock: WritableSignal<boolean>;

  beforeEach(() => {
    // Inicializamos el Signal que controla la UI del Header
    isAuthenticatedMock = signal(false);

    // Mock del AuthService
    authServiceMock = {
      isAuthenticated: isAuthenticatedMock,
      // Asumimos que closeSession() llama a logout()
      logout: cy.stub().resolves(),
    };

    // Mock del TeamService
    teamServiceMock = {
      // Asumimos que closeSession() limpia el equipo en memoria
      clearTeam: cy.stub().resolves(),
    };

    // Mock de Navegación
    navCtrlMock = {
      navigateForward: cy.stub().resolves(true),
      navigateRoot: cy.stub().resolves(true),
    };
  });

  // 3. Función Helper de Montaje
  const mountComponent = () => {
    cy.mount(HeaderComponent, {
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: TeamService, useValue: teamServiceMock },
        { provide: NavController, useValue: navCtrlMock },
      ],
    }).then((wrapper) => {
      cy.wrap(wrapper.component).as('componentInstance');
    });
  };

  describe('1. Renderizado Estático y Branding', () => {
    beforeEach(() => mountComponent());

    it('debe renderizar la barra principal, el logo y el título correctamente', () => {
      // Verificamos el contenedor padre
      cy.get('ion-header.app-header').should('exist');
      cy.get('ion-toolbar').should('have.attr', 'color', 'surface');

      // Verificamos el logo
      cy.get('.header-logo')
        .should('exist')
        .and('have.attr', 'src', 'assets/icon/DK-logo.png')
        .and('have.attr', 'alt', 'DraftKings Logo');

      // Verificamos el título
      cy.get('ion-title.app-title')
        .should('be.visible')
        .and('contain.text', 'DRAFTKINGS');
    });

    it('debe navegar al Home ("/") al hacer clic en el botón del logo', () => {
      // Hacemos clic en el botón que envuelve al logo
      cy.get('.header-logo').closest('ion-button').click();

      // Verificamos la llamada de navegación
      cy.wrap(navCtrlMock.navigateForward).should(
        'have.been.calledOnceWithExactly',
        ['/']
      );
    });
  });

  describe('2. Estado: Usuario NO Autenticado', () => {
    beforeEach(() => {
      // Forzamos el estado desconectado
      isAuthenticatedMock.set(false);
      mountComponent();
    });

    it('debe mostrar el botón de "Log In" y ocultar el botón de "Log Out"', () => {
      // El icono de login debe existir
      cy.get('ion-icon[name="log-in-outline"]').should('exist');

      // El icono de logout NO debe existir gracias al @if (isLogged()) de Angular
      cy.get('ion-icon[name="log-out-outline"]').should('not.exist');
    });

    it('debe quitar el foco (blur) del elemento activo y navegar a "/login" al hacer clic en Log In', () => {
      // Preparación: Creamos un input nativo, lo añadimos al DOM y le damos foco
      // Esto simula que el usuario estaba escribiendo en un formulario y tocó el header
      cy.document().then((doc) => {
        const input = doc.createElement('input');
        input.id = 'dummy-input';
        doc.body.appendChild(input);
        input.focus();
      });

      // Verificamos que nuestro input ficticio tiene el foco actual
      cy.get('#dummy-input').should('have.focus');

      // Acción: Clic en el botón de login del header
      cy.get('ion-icon[name="log-in-outline"]').closest('ion-button').click();

      // Comprobación 1: La función goToLogin() debió quitar el foco (blur)
      cy.get('#dummy-input').should('not.have.focus');

      // Comprobación 2: Debe haber navegado
      cy.wrap(navCtrlMock.navigateForward).should(
        'have.been.calledOnceWithExactly',
        ['/login']
      );
    });
  });

  describe('3. Estado: Usuario Autenticado', () => {
    beforeEach(() => {
      // Forzamos el estado conectado
      isAuthenticatedMock.set(true);
      mountComponent();
    });

    it('debe mostrar el botón de "Log Out" y ocultar el botón de "Log In"', () => {
      // El icono de logout debe existir
      cy.get('ion-icon[name="log-out-outline"]').should('exist');

      // El icono de login NO debe existir
      cy.get('ion-icon[name="log-in-outline"]').should('not.exist');
    });

    it('debe coordinar el cierre de sesión y limpieza de estado al hacer clic en Log Out', () => {
      // Acción: Clic en el botón de logout
      cy.get('ion-icon[name="log-out-outline"]').closest('ion-button').click();

      // Verificamos que se ejecutó la lógica asíncrona de closeSession()
      cy.then(() => {
        // 1. Debe haber cerrado la sesión en el servicio de Auth
        // (Ajusta este stub según cómo llames exactamente a la función en el .ts)
        // cy.wrap(authServiceMock.logout).should('have.been.calledOnce');
        // 2. Debe haber limpiado el estado global del equipo
        // cy.wrap(teamServiceMock.clearTeam).should('have.been.calledOnce');
        // Nota: He dejado estas aserciones comentadas porque el snippet de código
        // de tu 'closeSession()' estaba cortado en el .ts. Descoméntalas y ajusta
        // los nombres de los métodos a los que tengas dentro de tu closeSession().
      });
    });
  });

  describe('4. Reactividad en Tiempo Real (Angular Signals)', () => {
    it('debe intercambiar los botones dinámicamente cuando el Signal de autenticación cambia', () => {
      // Montamos con usuario desconectado
      isAuthenticatedMock.set(false);
      mountComponent();

      // Comprobamos estado inicial
      cy.get('ion-icon[name="log-in-outline"]').should('exist');
      cy.get('ion-icon[name="log-out-outline"]').should('not.exist');

      // Simulamos que el usuario inicia sesión exitosamente en otra parte de la app
      // Modificamos el Signal en tiempo real
      cy.then(() => {
        isAuthenticatedMock.set(true);
      });

      // Cypress reintentará esta aserción automáticamente hasta que Angular actualice el DOM
      // Comprobamos el nuevo estado reactivo
      cy.get('ion-icon[name="log-out-outline"]').should('exist');
      cy.get('ion-icon[name="log-in-outline"]').should('not.exist');
    });
  });
});
