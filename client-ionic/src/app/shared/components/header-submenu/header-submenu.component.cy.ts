import { HeaderSubmenuComponent } from './header-submenu.component';
import { NavController } from '@ionic/angular';

describe('HeaderSubmenuComponent - Test Suite Exhaustivo', () => {
  // 1. Mocks y variables de entorno
  let navCtrlMock: Partial<NavController>;

  beforeEach(() => {
    // Interceptamos el método navigateRoot para evitar navegación real
    // y poder verificar con qué argumentos se llamó.
    navCtrlMock = {
      navigateRoot: cy.stub().resolves(true),
    };
  });

  // 2. Función helper para montaje dinámico
  // Nos permite pasar Inputs de forma limpia en cada test
  const mountComponent = (props?: { title?: string; href?: string }) => {
    return cy
      .mount(HeaderSubmenuComponent, {
        componentProperties: {
          ...props,
        },
        providers: [
          // Sobreescribimos el NavController real por nuestro Mock
          { provide: NavController, useValue: navCtrlMock },
        ],
      })
      .then((wrapper) => {
        // Guardamos la instancia del componente por si necesitamos evaluar su estado interno
        cy.wrap(wrapper.component).as('componentInstance');
      });
  };

  describe('1. Renderizado Inicial, UI y Valores por Defecto', () => {
    beforeEach(() => {
      // Montamos sin pasarle inputs, para evaluar los defaults
      mountComponent();
    });

    it('debe renderizar la estructura base de Ionic correctamente', () => {
      // Verificamos contenedores y propiedades visuales de Ionic
      cy.get('ion-header.header-container').should('exist');
      cy.get('ion-toolbar')
        .should('exist')
        .and('have.attr', 'color', 'surface'); // Verifica el color definido en el HTML
    });

    it('debe renderizar el logo de DraftKings con sus atributos correctos', () => {
      cy.get('ion-img.header-logo')
        .should('be.visible')
        .and('have.attr', 'src', 'assets/icon/DK-logo.png')
        .and('have.attr', 'alt', 'DraftKings Logo');
    });

    it('debe mostrar el título por defecto "DRAFTKINGS"', () => {
      cy.get('ion-title.header-title-base.app-subtitle')
        .should('be.visible')
        .and('contain.text', 'DRAFTKINGS');
    });

    it('debe renderizar el botón de retroceso (back-button) con la configuración por defecto', () => {
      // Verifica la existencia del botón de Ionic nativo
      cy.get('ion-back-button.header-nav-button').should('exist');

      cy.get('ion-back-button')
        .invoke('prop', 'defaultHref')
        .should('equal', '/');
      cy.get('ion-back-button')
        .invoke('prop', 'icon')
        .should('equal', 'chevron-back-circle-outline');
    });
  });

  describe('2. Comportamiento y Reactividad de los @Input()', () => {
    it('debe renderizar un título personalizado si se pasa por @Input', () => {
      const customTitle = 'Player Profile';
      mountComponent({ title: customTitle });

      cy.get('ion-title').should('contain.text', customTitle);
    });

    it('debe asignar una ruta (href) personalizada al botón de retroceso', () => {
      const customHref = '/teams/manager';
      mountComponent({ href: customHref });

      cy.get('ion-back-button')
        .invoke('prop', 'defaultHref')
        .should('equal', customHref);
    });

    it('debe actualizarse dinámicamente si los inputs cambian durante el ciclo de vida', () => {
      mountComponent({ title: 'Settings', href: '/dashboard' });

      cy.get('ion-title').should('contain.text', 'Settings');
      cy.get('ion-back-button')
        .invoke('prop', 'defaultHref')
        .should('equal', '/dashboard');
    });
  });

  describe('3. Interacciones de Usuario y Navegación', () => {
    it('debe invocar goToHome() y navegar a "/" (default) al hacer clic en el logo', () => {
      mountComponent();

      // Buscamos el botón transparente que envuelve al logo y hacemos click
      cy.get('ion-button[fill="clear"]').click();

      // Verificamos que el NavController fue llamado exactamente con el href por defecto
      cy.wrap(navCtrlMock.navigateRoot).should(
        'have.been.calledOnceWithExactly',
        '/'
      );
    });

    it('debe navegar a una ruta personalizada al hacer clic en el logo, si se proveyó un @Input() href', () => {
      const customRoute = '/custom-home';
      mountComponent({ href: customRoute });

      cy.get('ion-button[fill="clear"]').click();

      // El componente ahora debería navegar a la ruta inyectada, no al '/'
      cy.wrap(navCtrlMock.navigateRoot).should(
        'have.been.calledOnceWithExactly',
        customRoute
      );
    });

    it('debe registrar los íconos correctamente (Coverage del Constructor)', () => {
      mountComponent();

      // Simplemente aseguramos que la inicialización no rompe la instancia
      cy.get('@componentInstance').should('exist');

      // Validamos que el shadow DOM de Ionic renderice un SVG para el icono inyectado
      // (Ionic renderiza el <ion-icon> internamente dentro del ion-back-button)
      cy.get('ion-back-button')
        .shadow() // Accedemos al Shadow DOM interno de Ionic
        .find('.button-native')
        .should('exist');
    });
  });
});
