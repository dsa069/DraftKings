import { signal, WritableSignal } from '@angular/core';
import { SettingsPage } from './settings.page';
import { AuthService } from '../../../core/services/abstract/auth.service';
import { ConfigService } from '../../../core/services/config.service';
import { of, throwError } from 'rxjs';
import { User } from '../../../core/models/user.model';

describe('SettingsPage Component', () => {
  let authServiceMock: Partial<AuthService>;
  let configServiceMock: Partial<ConfigService>;

  // 1. Añadimos la variable para controlar el signal del backend
  let selectedBackendMock: WritableSignal<string>;

  beforeEach(() => {
    // 2. Inicializamos el Signal
    selectedBackendMock = signal('bun');

    authServiceMock = {
      getProfile: cy.stub().returns(of(null)),
    };

    configServiceMock = {
      // 3. Pasamos el Signal casteado para evitar el error estricto de TypeScript
      selectedBackend: selectedBackendMock as any,
    };
  });

  // ... (mountComponent queda igual)

  // Función auxiliar para montar el componente de manera limpia
  const mountComponent = () => {
    cy.mount(SettingsPage, {
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    });
  };

  describe('Renderizado Inicial: Usuario Anónimo (Null Profile)', () => {
    beforeEach(() => {
      mountComponent();
    });

    it('debe mostrar los valores por defecto para nombre y rol', () => {
      // Valida la carga por defecto cuando el observable emite null
      cy.get('.profile-name').should('contain.text', 'Anonymus');
      cy.get('.pro-badge ion-label').should('contain.text', 'Unregistered');
    });

    it('NO debe mostrar el correo electrónico si no hay perfil', () => {
      // Evalúa la directiva @if (userProfile(); as user)
      cy.get('.profile-email').should('not.exist');
    });

    it('NO debe mostrar la sección "Account" (Reset Password)', () => {
      // Evalúa la directiva @if (userProfile()) para el contenedor de la cuenta
      cy.contains('.section-title', 'Account').should('not.exist');
      cy.contains('ion-label', 'Reset Password').should('not.exist');
    });

    it('debe renderizar el avatar con la imagen por defecto y el botón de editar', () => {
      cy.get('ion-avatar.profile-avatar ion-img')
        .should('exist')
        .and(
          'have.attr',
          'src',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuANaBxk5OEPxAUnBCdgYaIE6yODsc7JTgydpaGPtsY7Wyoog3opWuKH2IW9jzvtelU4OR1GNg_yWb6GB2ANFVRDqRnAWUTQLnTMwCuOtTh7ys353srUtxUJ0vv6DjUA0sHKYumwJF1I7XsaChGKpXkGoGhYQk_Y_dgWU7hZybiXYqZuRA9__Ov8oCtDLmzTjPmItsHVl0d1DWXlMUJ8zn3PPqDIlxRYOGdBpvxeIokxny0Io-MsuUvJEmvyfJcnICC96yY-Z2JnDQI'
        );

      cy.get('ion-avatar.profile-avatar ion-button.edit-btn')
        .should('exist')
        .find('ion-icon')
        .should('have.attr', 'name', 'pencil');
    });
  });

  describe('Flujo Dinámico: Usuario Autenticado', () => {
    const mockUser: User = {
      id: '123',
      firebaseUid: 'abc-123-uid-firebase', // <-- Propiedad agregada
      userName: 'ProGamer99',
      email: 'progamer@draftkings.com',
      role: 'ADMIN',
    };

    beforeEach(() => {
      // Interceptamos el servicio para emitir un usuario real
      authServiceMock.getProfile = cy.stub().returns(of(mockUser));
      mountComponent();
    });

    it('debe mapear correctamente los datos del observable al template', () => {
      cy.get('.profile-name').should('contain.text', 'ProGamer99');
      cy.get('.profile-email')
        .should('exist')
        .and('contain.text', 'progamer@draftkings.com');
      cy.get('.pro-badge ion-label').should('contain.text', 'ADMIN');
    });

    it('debe mostrar la sección "Account" cuando hay un perfil válido', () => {
      // La sección Account debería haberse habilitado gracias al @if
      cy.contains('.section-title', 'Account').should('exist');
      cy.contains('.item-title', 'Reset Password').should('exist');
      cy.contains('.item-subtitle', 'Update your security credentials').should(
        'exist'
      );

      // Valida que el botón sea interactivo y tenga detalle
      cy.contains('ion-item', 'Reset Password').should(
        'have.attr',
        'detail',
        'true'
      );
    });
  });

  describe('Comportamiento de Señales Computadas (Computed Signals - System Info)', () => {
    it('debe mostrar la configuración para Node.js', () => {
      selectedBackendMock.set('nodejs');
      mountComponent();

      // Valida la lógica de computed() para currentBackendLabel y currentBackendIcon
      cy.contains('.section-title', 'System').should('exist');
      cy.get('ion-item').contains('Backend Service').should('exist');

      // Valida el Chip tecnológico
      cy.get('.tech-chip ion-label').should('contain.text', 'Node.js');
      // Logo Node.js asume el string del icono en ionicons
      cy.get('.tech-chip ion-icon').should('exist');
    });

    it('debe mostrar la configuración para Spring Boot', () => {
      selectedBackendMock.set('springboot');
      mountComponent();

      cy.get('.tech-chip ion-label').should('contain.text', 'Spring Boot');
      // Validamos visualmente que cambie el icono (leafOutline)
      cy.get('.tech-chip ion-icon').should('exist');
    });
  });

  describe('Manejo de Errores Asíncronos en ngOnInit', () => {
    beforeEach(() => {
      // Simulamos una falla en la red o un error del backend
      authServiceMock.getProfile = cy
        .stub()
        .returns(throwError(() => new Error('Error de red')));
      // Espiamos la consola para confirmar que el componente manejó el error
      cy.spy(console, 'error').as('consoleError');
      mountComponent();
    });

    it('debe sobrevivir a un error del servicio y mantener la interfaz anónima intacta', () => {
      // Validamos que el bloque catch/error del subscribe funcionó
      cy.get('@consoleError').should(
        'have.been.calledWith',
        'Error cargando perfil'
      );

      // El UI debe quedarse en fallback
      cy.get('.profile-name').should('contain.text', 'Anonymus');
      cy.get('.profile-email').should('not.exist');
    });
  });

  describe('Elementos de Interfaz y Bento Cards (Appearance & Language)', () => {
    beforeEach(() => {
      mountComponent();
    });

    it('debe renderizar el Bento Card de Apariencia con Dark Mode activado por defecto', () => {
      cy.get('.bento-col-left .card-subtitle').should(
        'contain.text',
        'Appearance'
      );
      cy.get('.bento-col-left .card-title').should('contain.text', 'Dark Mode');

      // Validación del toggle de Ionic
      cy.get('ion-toggle.custom-toggle')
        .should('exist')
        .and('have.attr', 'checked', 'true')
        .and('have.attr', 'mode', 'ios');
    });

    it('debe permitir la interacción (Click/Toggle) con el botón de Dark Mode', () => {
      // Interactuamos con el componente nativo de Ionic simulando al usuario
      cy.get('ion-toggle.custom-toggle').click();
      cy.get('ion-toggle.custom-toggle').should('have.class', 'ion-focused');
    });

    it('debe renderizar el Bento Card de Lenguaje correctamente', () => {
      cy.get('.bento-col-right .card-subtitle').should(
        'contain.text',
        'Language'
      );
      cy.get('.bento-col-right .card-title').should('contain.text', 'English');
      cy.get('.bento-col-right ion-icon.dropdown-icon').should(
        'have.attr',
        'name',
        'chevron-down'
      );
    });
  });
});
