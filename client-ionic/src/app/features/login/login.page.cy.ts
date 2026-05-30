import { LoginPage } from './login.page';
import { AuthService } from '../../core/services/abstract/auth.service';
import { ConfigService } from '../../core/services/config.service';
import { NavController, ToastController } from '@ionic/angular';
import { signal, WritableSignal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('LoginPage Component - Test Suite Exhaustivo', () => {
  // 1. Mocks y Spies
  let authServiceMock: any;
  let configServiceMock: any;
  let navCtrlMock: Partial<NavController>;
  let toastCtrlMock: Partial<ToastController>;

  let toastPresentSpy: any;
  let selectedBackendMock: WritableSignal<string>;

  beforeEach(() => {
    // Espía para el Toast de Ionic
    toastPresentSpy = cy.stub().resolves();
    toastCtrlMock = {
      create: cy.stub().resolves({
        present: toastPresentSpy,
      } as any),
    };

    // Navegación
    navCtrlMock = {
      navigateRoot: cy.stub().resolves(true),
      navigateForward: cy.stub().resolves(true),
    };

    // ConfigService (Mockeando el Signal del backend activo)
    selectedBackendMock = signal('firebase');
    configServiceMock = {
      selectedBackend: selectedBackendMock,
      applyBackendChange: cy.stub().resolves(),
    };

    // AuthService
    authServiceMock = {
      loginFirebase: cy.stub().resolves({ user: { uid: '123' } }),
      verifyBackend: cy.stub().resolves(),
    };
  });

  // Función de montaje inyectando los providers globales y específicos
  const mountComponent = () => {
    cy.mount(LoginPage, {
      imports: [ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: NavController, useValue: navCtrlMock },
        { provide: ToastController, useValue: toastCtrlMock },
      ],
    }).then((wrapper) => {
      cy.wrap(wrapper.component).as('componentInstance');
    });
  };

  // 🛠️ CORRECCIÓN AQUÍ: Usamos búsqueda dinámica del form para evitar errores de undefined
  const fillLoginForm = (email: string, password: string) => {
    cy.get('@componentInstance').then((instance: any) => {
      // Soporta diferentes nomenclaturas comunes en el .ts (loginForm, form, authForm)
      const formGroup =
        instance.loginForm || instance.form || instance.authForm;
      expect(
        formGroup,
        'Se esperaba encontrar una instancia del FormGroup en el componente'
      ).to.exist;

      formGroup.patchValue({ email, password });
      formGroup.markAllAsTouched(); // Asegura que los validadores visuales de Ionic salten
      formGroup.updateValueAndValidity();
    });
  };

  // Función auxiliar para recuperar el FormGroup de forma segura en los tests
  const getSafeFormGroup = (instance: any) =>
    instance.loginForm || instance.form || instance.authForm;

  describe('1. Renderizado Inicial e Interfaz Base', () => {
    beforeEach(() => mountComponent());

    it('debe renderizar el header, subtítulo y formulario correctamente', () => {
      cy.get('.login-title').should('contain.text', 'DRAFTKINGS');
      cy.get('.login-subtitle').should(
        'contain.text',
        'Enter the arena. Manage your squad.'
      );

      cy.get('app-login-card').should('exist');
      cy.get('ion-input[formControlName="email"]').should('exist');
      cy.get('ion-input[formControlName="password"]').should('exist');
    });
  });

  describe('2. Interacciones Menores y Navegación', () => {
    beforeEach(() => mountComponent());

    it('debe volver a la pantalla de jugadores al hacer clic en el botón de retroceso', () => {
      cy.get('.circular-back-btn').click();
      cy.wrap(navCtrlMock.navigateRoot).should('have.been.calledOnceWith', [
        '/tabs/players',
      ]);
    });

    it('debe navegar a "Sign Up" al hacer clic en "Forgot?"', () => {
      cy.get('.forgot-link').click();
      cy.wrap(navCtrlMock.navigateForward).should('have.been.calledOnceWith', [
        '/sign-up',
      ]);
    });

    it('debe alternar el tipo de input (password a text) al hacer clic en el ojo', () => {
      cy.get('@componentInstance').then((instance: any) => {
        expect(instance.showPassword).to.be.false;
        instance.togglePasswordVisibility();
        expect(instance.showPassword).to.be.true;
      });
    });
  });

  describe('3. Validaciones del Formulario (FormGroup)', () => {
    beforeEach(() => mountComponent());

    it('debe iniciar como inválido', () => {
      cy.get('@componentInstance').then((instance: any) => {
        const formGroup = getSafeFormGroup(instance);
        expect(formGroup.valid).to.be.false;
      });
    });

    it('debe validar el formato del correo electrónico', () => {
      fillLoginForm('correo-invalido', 'ValidPass123');
      cy.get('@componentInstance').then((instance: any) => {
        const formGroup = getSafeFormGroup(instance);
        expect(formGroup.controls.email.valid).to.be.false;
      });

      fillLoginForm('coach@draftkings.com', 'ValidPass123');
      cy.get('@componentInstance').then((instance: any) => {
        const formGroup = getSafeFormGroup(instance);
        expect(formGroup.controls.email.valid).to.be.true;
      });
    });

    it('debe validar que la contraseña sea requerida', () => {
      fillLoginForm('coach@draftkings.com', ''); // Lo dejamos vacío
      cy.get('@componentInstance').then((instance: any) => {
        const formGroup = getSafeFormGroup(instance);
        expect(formGroup.controls.password.valid).to.be.false;
      });
    });
  });

  describe('4. Flujo Asíncrono: Login Exitoso (Mismo Backend)', () => {
    beforeEach(() => mountComponent());

    it('debe hacer login en Firebase, verificar Backend, mostrar Toast y navegar', () => {
      fillLoginForm('coach@draftkings.com', 'ValidPass123');

      // 🛠️ CORRECCIÓN AQUÍ: Evitamos buscar por 'form#loginFormId' (puede fallar por el shadow-dom o proyecciones de ng-content).
      // Es más seguro simular el click del usuario en el botón submit.
      cy.get('ion-button[type="submit"]').click({ force: true });

      cy.then(() => {
        cy.wrap(authServiceMock.loginFirebase).should(
          'have.been.calledOnceWith',
          'coach@draftkings.com',
          'ValidPass123'
        );

        cy.wrap(authServiceMock.verifyBackend).should('have.been.calledOnce');

        cy.wrap(toastCtrlMock.create).should('have.been.calledWithMatch', {
          message: 'Login successful!',
          color: 'success',
        });
        cy.wrap(toastPresentSpy).should('have.been.calledOnce');

        cy.wrap(navCtrlMock.navigateRoot).should('have.been.calledWith', [
          '/tabs/players',
        ]);

        cy.wrap(configServiceMock.applyBackendChange).should(
          'not.have.been.called'
        );
      });
    });
  });

  describe('5. Flujo Asíncrono: Login Exitoso (Con Cambio de Backend)', () => {
    beforeEach(() => mountComponent());

    it('debe hacer login, detectar cambio de entorno y solicitar recarga sin verificar el backend', () => {
      cy.get('@componentInstance').then((instance: any) => {
        instance.selectedBackend = 'bun';
      });

      fillLoginForm('coach@draftkings.com', 'ValidPass123');
      cy.get('ion-button[type="submit"]').click({ force: true });

      cy.then(() => {
        cy.wrap(authServiceMock.loginFirebase).should('have.been.calledOnce');

        cy.wrap(configServiceMock.applyBackendChange).should(
          'have.been.calledOnceWith',
          'bun'
        );

        cy.wrap(authServiceMock.verifyBackend).should('not.have.been.called');
        cy.wrap(toastCtrlMock.create).should('not.have.been.called');
        cy.wrap(navCtrlMock.navigateRoot).should('not.have.been.called');
      });
    });
  });

  describe('6. Flujo Asíncrono: Manejo de Errores', () => {
    beforeEach(() => mountComponent());

    it('debe capturar el error, imprimir en consola y mostrar Toast rojo de fallo', () => {
      authServiceMock.loginFirebase = cy
        .stub()
        .rejects(new Error('Invalid credentials'));

      cy.spy(console, 'error').as('consoleError');

      fillLoginForm('bad@coach.com', 'WrongPass');
      cy.get('ion-button[type="submit"]').click({ force: true });

      cy.then(() => {
        cy.get('@consoleError').should(
          'have.been.calledWith',
          'Login fallido:'
        );

        cy.wrap(toastCtrlMock.create).should('have.been.calledWithMatch', {
          message: 'Login failed. Please check your credentials.',
          color: 'danger',
        });
        cy.wrap(toastPresentSpy).should('have.been.calledOnce');

        cy.wrap(authServiceMock.verifyBackend).should('not.have.been.called');
        cy.wrap(navCtrlMock.navigateRoot).should('not.have.been.called');
      });
    });
  });
});
