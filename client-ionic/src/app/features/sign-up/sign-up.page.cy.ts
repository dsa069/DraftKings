import { SignUpPage } from './sign-up.page';
import { AuthService } from '../../core/services/abstract/auth.service';
import { NavController, ToastController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('SignUpPage Component', () => {
  // 1. Mocks y Stubs de Servicios
  let authServiceMock: any;
  let navCtrlMock: Partial<NavController>;
  let toastCtrlMock: Partial<ToastController>;
  let toastPresentSpy: any;

  beforeEach(() => {
    // Inicializamos el espía para el present() del Toast
    toastPresentSpy = cy.stub().resolves();

    // Mock del ToastController de Ionic
    toastCtrlMock = {
      create: cy.stub().resolves({
        present: toastPresentSpy,
      } as any),
    };

    // Mock de Navegación
    navCtrlMock = {
      navigateRoot: cy.stub().resolves(true),
      navigateBack: cy.stub().resolves(true),
    };

    // Mock de Autenticación
    authServiceMock = {
      register: cy.stub().returns(of({ id: '123', email: 'test@test.com' })),
      registerFirebase: cy.stub().resolves({ user: { uid: '123' } }),
      registerBackend: cy.stub().resolves({}),
    };
  });

  // Función global para montar el componente de manera limpia
  const mountComponent = () => {
    cy.mount(SignUpPage, {
      imports: [ReactiveFormsModule], // Requerido si usa Formularios Reactivos
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: NavController, useValue: navCtrlMock },
        { provide: ToastController, useValue: toastCtrlMock },
      ],
    }).then((wrapper) => {
      cy.wrap(wrapper.component).as('componentInstance');
    });
  };

  describe('1. Renderizado Inicial e Interfaz Base', () => {
    beforeEach(() => mountComponent());

    it('debe renderizar el título, el formulario y los inputs correctamente', () => {
      cy.get('ion-title').should('contain.text', 'Sign Up');

      // Verificamos que existan los inputs principales
      cy.get('ion-input[formControlName="username"]').should('exist');
      cy.get('ion-input[formControlName="email"]').should('exist');
      cy.get('ion-input[formControlName="password"]').should('exist');
      cy.get('ion-input[formControlName="confirmPassword"]').should('exist');
    });

    it('el botón de submit debe estar deshabilitado por defecto (formulario inválido)', () => {
      cy.get('ion-button[type="submit"]')
        .should('exist')
        .and('have.attr', 'disabled');
    });
  });

  describe('2. Validaciones de Formulario Reactivo', () => {
    beforeEach(() => mountComponent());

    it('debe mostrar error si el email tiene un formato inválido', () => {
      cy.get('ion-input[formControlName="email"]').type('email-invalido');
      cy.get('ion-input[formControlName="email"]').blur(); // Desencadenar touched

      // Asumimos que tienes un ion-note o un span para los mensajes de error
      cy.get('.error-message')
        .should('be.visible')
        .and('contain.text', 'formato de correo inválido');

      cy.get('ion-button[type="submit"]').should('have.attr', 'disabled');
    });

    it('debe mostrar error si las contraseñas no coinciden (Custom Validator)', () => {
      cy.get('ion-input[formControlName="password"]').type('Password123!');
      cy.get('ion-input[formControlName="confirmPassword"]').type(
        'PasswordDistinta456'
      );
      cy.get('ion-input[formControlName="confirmPassword"]').blur();

      cy.get('.error-message')
        .should('be.visible')
        .and('contain.text', 'Las contraseñas no coinciden');

      cy.get('ion-button[type="submit"]').should('have.attr', 'disabled');
    });

    it('debe habilitar el botón de submit cuando todos los campos son válidos', () => {
      cy.get('ion-input[formControlName="username"]').type('TestUser');
      cy.get('ion-input[formControlName="email"]').type('test@draftkings.com');
      cy.get('ion-input[formControlName="password"]').type('ValidPass123!');
      cy.get('ion-input[formControlName="confirmPassword"]').type(
        'ValidPass123!'
      );

      // El botón ya no debe tener el atributo disabled
      cy.get('ion-button[type="submit"]').should('not.have.attr', 'disabled');
    });
  });

  describe('3. Flujo Asíncrono: Registro Exitoso', () => {
    beforeEach(() => mountComponent());

    it('debe llamar al AuthService, mostrar spinner, notificar éxito y navegar', () => {
      // 1. Llenamos el formulario
      cy.get('ion-input[formControlName="username"]').type('TestUser');
      cy.get('ion-input[formControlName="email"]').type('test@draftkings.com');
      cy.get('ion-input[formControlName="password"]').type('ValidPass123!');
      cy.get('ion-input[formControlName="confirmPassword"]').type(
        'ValidPass123!'
      );

      // 2. Interceptamos el register para que demore y podamos ver el Loading state
      authServiceMock.register = cy
        .stub()
        .returns(
          new Cypress.Promise((resolve) =>
            setTimeout(() => resolve({ id: '1' }), 300)
          )
        );

      // 3. Enviamos el formulario
      cy.get('ion-button[type="submit"]').click();

      // 4. Verificamos el estado "Cargando"
      cy.get('@componentInstance').its('isLoading').should('equal', true);
      cy.get('ion-spinner').should('exist'); // Suponiendo que muestras un spinner en el botón o vista

      // 5. Verificamos que el servicio fue llamado con los datos correctos
      cy.wrap(authServiceMock.register).should(
        'have.been.calledOnceWith',
        Cypress.sinon.match({
          email: 'test@draftkings.com',
          username: 'TestUser',
          password: 'ValidPass123!',
        })
      );

      // 6. Verificamos el resultado posterior a la promesa
      cy.then(() => {
        // El loader desaparece
        cy.get('@componentInstance').its('isLoading').should('equal', false);

        // Verifica que se creó el Toast de éxito
        cy.wrap(toastCtrlMock.create).should('have.been.calledOnce');
        cy.wrap(toastPresentSpy).should('have.been.calledOnce');

        // Verifica que el usuario es redirigido a la app
        cy.wrap(navCtrlMock.navigateRoot).should(
          'have.been.calledOnceWith',
          '/tabs/home'
        );
      });
    });
  });

  describe('4. Flujo Asíncrono: Manejo de Errores (Backend / Firebase)', () => {
    beforeEach(() => mountComponent());

    it('debe capturar el error, detener el spinner y mostrar un Toast de error', () => {
      // Simulamos que el backend rechaza el registro (ej. Email ya existe)
      authServiceMock.register = cy
        .stub()
        .returns(throwError(() => new Error('Email already in use')));

      // Espiamos la consola para asegurar que el catch block lo procesa
      cy.spy(console, 'error').as('consoleError');

      // Llenamos el form
      cy.get('ion-input[formControlName="username"]').type('Hacker');
      cy.get('ion-input[formControlName="email"]').type(
        'hacker@draftkings.com'
      );
      cy.get('ion-input[formControlName="password"]').type('Pass123!');
      cy.get('ion-input[formControlName="confirmPassword"]').type('Pass123!');

      cy.get('ion-button[type="submit"]').click();

      // Verificaciones
      cy.get('@consoleError').should('have.been.called');

      cy.get('@componentInstance').its('isLoading').should('equal', false);

      cy.wrap(toastCtrlMock.create).should(
        'have.been.calledOnceWith',
        Cypress.sinon.match({
          message: 'Email already in use',
          color: 'danger',
        })
      );

      // NO debe navegar a la app
      cy.wrap(navCtrlMock.navigateRoot).should('not.have.been.called');
    });
  });

  describe('5. Navegación Secundaria e Interacciones Menores', () => {
    beforeEach(() => mountComponent());

    it('debe navegar a la pantalla de Login al hacer clic en "Ya tengo una cuenta"', () => {
      cy.get('.login-link').click(); // Asumiendo que tienes un link para ir atrás
      cy.wrap(navCtrlMock.navigateBack).should(
        'have.been.calledOnceWith',
        '/login'
      );
    });

    it('debe alternar la visibilidad de la contraseña al hacer clic en el ícono del ojo', () => {
      // Asumiendo que usas el componente nativo type="password" y un botón de toggle
      cy.get('ion-input[formControlName="password"]').should(
        'have.attr',
        'type',
        'password'
      );

      cy.get('.toggle-password-btn').first().click(); // Haces click al ojo

      cy.get('ion-input[formControlName="password"]').should(
        'have.attr',
        'type',
        'text'
      );
    });
  });
});
