import { signal, WritableSignal } from '@angular/core';
import { SettingsPage } from './settings.page';
import { AuthService } from '../../../core/services/abstract/auth.service';
import { ConfigService } from '../../../core/services/config.service';
import { of, throwError } from 'rxjs';
import { User } from '../../../core/models/user.model';

describe('SettingsPage Component', () => {
  let authServiceMock: Partial<AuthService>;
  let configServiceMock: Partial<ConfigService>;

  // Variables para controlar reactivamente los Signals en los tests
  let isAuthenticatedMock: WritableSignal<boolean>;
  let userProfileMock: WritableSignal<User | null>;
  let selectedBackendMock: WritableSignal<string>;

  beforeEach(() => {
    // Inicialización de los Signals simulados para el estado del componente
    isAuthenticatedMock = signal(false);
    userProfileMock = signal<User | null>(null);
    selectedBackendMock = signal('bun');

    // Mock de AuthService adaptado estrictamente a los miembros de la clase abstracta
    authServiceMock = {
      isAuthenticated: (() => isAuthenticatedMock()) as any,
      userProfile: (() => userProfileMock()) as any,
      isAdmin: (() => userProfileMock()?.role === 'ADMIN') as any,
      isUser: (() => userProfileMock()?.role === 'USER') as any,
      getProfile: cy.stub().returns(of(null)), // Fallback inicial RxJS para el ngOnInit
      getToken: cy.stub().resolves('mock-jwt-token'),
      logout: cy.stub().resolves(),
      deleteCurrentUser: cy.stub().resolves(),
    };

    // Mock de ConfigService
    configServiceMock = {
      selectedBackend: (() => selectedBackendMock()) as any,
    };
  });

  // Función auxiliar para montar el componente de manera limpia inyectando los mocks
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
      // Configuramos el estado inicial para simular un usuario no registrado
      userProfileMock.set(null);
      isAuthenticatedMock.set(false);
      authServiceMock.getProfile = cy.stub().returns(of(null));

      mountComponent();
    });

    it('debe mostrar los valores por defecto para nombre y rol', () => {
      cy.get('.profile-name').should('contain.text', 'Anonymus');
      cy.get('.pro-badge ion-label').should('contain.text', 'Unregistered');
    });

    it('NO debe mostrar el correo electrónico si no hay perfil', () => {
      // Valida que la directiva estructural @if trabaje en concordancia con el Signal
      cy.get('.profile-email').should('not.exist');
    });

    it('NO debe mostrar la sección "Account" (Reset Password)', () => {
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
      firebaseUid: 'abc-123-uid-firebase',
      userName: 'ProGamer99',
      email: 'progamer@draftkings.com',
      role: 'ADMIN',
    };

    beforeEach(() => {
      // Sincronizamos tanto la emisión inicial del Observable de perfil como los Signals internos
      userProfileMock.set(mockUser);
      isAuthenticatedMock.set(true);
      authServiceMock.getProfile = cy.stub().returns(of(mockUser));

      mountComponent();
    });

    it('debe mapear correctamente los datos del perfil al template mediante las señales compartidas', () => {
      cy.get('.profile-name').should('contain.text', 'ProGamer99');
      cy.get('.profile-email')
        .should('exist')
        .and('contain.text', 'progamer@draftkings.com');
      cy.get('.pro-badge ion-label').should('contain.text', 'ADMIN');
    });

    it('debe mostrar la sección "Account" cuando hay un perfil válido en sesión', () => {
      cy.contains('.section-title', 'Account').should('exist');
      cy.contains('.item-title', 'Reset Password').should('exist');
      cy.contains('.item-subtitle', 'Update your security credentials').should(
        'exist'
      );

      // Valida que el botón sea interactivo y use los estilos nativos de Ionic
      cy.contains('ion-item', 'Reset Password').should(
        'have.attr',
        'detail',
        'true'
      );
    });
  });

  describe('Comportamiento de Señales Computadas (Computed Signals - System Info)', () => {
    it('debe mostrar la configuración y etiquetas correctas para Node.js', () => {
      selectedBackendMock.set('nodejs');
      mountComponent();

      cy.contains('.section-title', 'System').should('exist');
      cy.get('ion-item').contains('Backend Service').should('exist');

      // Validamos la resolución del Chip tecnológico
      cy.get('.tech-chip ion-label').should('contain.text', 'Node.js');
      cy.get('.tech-chip ion-icon').should('exist');
    });

    it('debe mostrar la configuración y etiquetas correspondientes para Spring Boot', () => {
      selectedBackendMock.set('springboot');
      mountComponent();

      cy.get('.tech-chip ion-label').should('contain.text', 'Spring Boot');
      cy.get('.tech-chip ion-icon').should('exist');
    });
  });

  describe('Manejo de Errores Asíncronos en ngOnInit', () => {
    beforeEach(() => {
      // Forzamos una desconexión o fallo crítico del servidor en el flujo RxJS
      authServiceMock.getProfile = cy
        .stub()
        .returns(throwError(() => new Error('Error de red')));

      // Espiamos el tracker de errores de la consola
      cy.spy(console, 'error').as('consoleError');
      mountComponent();
    });

    it('debe sobrevivir a un error de red del servicio y mantener la interfaz anónima en fallback', () => {
      // Verifica que el catch del flujo manejó la excepción de forma controlada
      cy.get('@consoleError').should(
        'have.been.calledWith',
        'Error cargando perfil'
      );

      // La interfaz gráfica se mantiene segura e íntegra en estado anónimo
      cy.get('.profile-name').should('contain.text', 'Anonymus');
      cy.get('.profile-email').should('not.exist');
    });
  });

  describe('Elementos de Interfaz y Bento Cards (Appearance & Language)', () => {
    beforeEach(() => {
      mountComponent();
    });

    it('debe renderizar la Bento Card de Apariencia con Dark Mode activo por defecto', () => {
      cy.get('.bento-col-left .card-subtitle').should(
        'contain.text',
        'Appearance'
      );
      cy.get('.bento-col-left .card-title').should('contain.text', 'Dark Mode');

      // Validación rigurosa de las propiedades del toggle nativo de Ionic
      cy.get('ion-toggle.custom-toggle')
        .should('exist')
        .and('have.attr', 'checked', 'true')
        .and('have.attr', 'mode', 'ios');
    });

    it('debe permitir el foco y la interacción (Click/Toggle) del usuario sobre el switch de Dark Mode', () => {
      cy.get('ion-toggle.custom-toggle').click();
      cy.get('ion-toggle.custom-toggle').should('have.class', 'ion-focused');
    });

    it('debe renderizar correctamente la Bento Card de selección idiomática', () => {
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
