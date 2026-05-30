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
      // Guardamos la instancia para comprobaciones internas si fuera necesario
      cy.wrap(wrapper.component).as('componentInstance');
    });
  };

  const fillLoginForm = (email: string, password: string) => {
    cy.get('@componentInstance').then((instance: any) => {
      expect(instance.loginForm).to.exist;
      instance.loginForm.patchValue({ email, password });
      instance.loginForm.updateValueAndValidity();
    });
  };

  describe('1. Renderizado Inicial e Interfaz Base', () => {
    beforeEach(() => mountComponent());

    it('debe renderizar el header, subtítulo y formulario correctamente', () => {
      cy.get('.login-title').should('contain.text', 'DRAFTKINGS');
      cy.get('.login-subtitle').should(
        'contain.text',
        'Enter the arena. Manage your squad.'
      );

      // Verifica el componente custom hijo
      cy.get('app-login-card').should('exist');

      // Verifica los inputs
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
      cy.get('@componentInstance').its('loginForm.valid').should('be.false');
    });

    it('debe validar el formato del correo electrónico', () => {
      fillLoginForm('correo-invalido', 'ValidPass123');
      cy.get('@componentInstance')
        .its('loginForm.controls.email.valid')
        .should('be.false');

      fillLoginForm('coach@draftkings.com', 'ValidPass123');
      cy.get('@componentInstance')
        .its('loginForm.controls.email.valid')
        .should('be.true');
    });

    it('debe validar que la contraseña sea requerida', () => {
      fillLoginForm('coach@draftkings.com', '');
      cy.get('@componentInstance')
        .its('loginForm.controls.password.valid')
        .should('be.false');
    });
  });

  describe('4. Flujo Asíncrono: Login Exitoso (Mismo Backend)', () => {
    beforeEach(() => mountComponent());

    it('debe hacer login en Firebase, verificar Backend, mostrar Toast y navegar', () => {
      fillLoginForm('coach@draftkings.com', 'ValidPass123');

      // Interceptamos el submit (ya sea porque le dimos submit al form o a través del componente hijo)
      cy.get('form#loginFormId').submit();

      // Verificamos la secuencia
      cy.then(() => {
        // 1. Llama a Firebase
        cy.wrap(authServiceMock.loginFirebase).should(
          'have.been.calledOnceWith',
          'coach@draftkings.com',
          'ValidPass123'
        );

        // 2. Como el backend es el mismo ('firebase' == 'firebase'), verifica el backend
        cy.wrap(authServiceMock.verifyBackend).should('have.been.calledOnce');

        // 3. Muestra mensaje de éxito
        cy.wrap(toastCtrlMock.create).should('have.been.calledWithMatch', {
          message: 'Login successful!',
          color: 'success',
        });
        cy.wrap(toastPresentSpy).should('have.been.calledOnce');

        // 4. Navega a la home
        cy.wrap(navCtrlMock.navigateRoot).should('have.been.calledWith', [
          '/tabs/players',
        ]);

        // 5. NO aplica cambio de backend
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
        // Simulamos que el usuario en el LoginCardComponent seleccionó un backend distinto ('bun')
        // mientras que el backend activo en el ConfigService sigue siendo 'firebase'
        instance.selectedBackend = 'bun';
      });

      fillLoginForm('coach@draftkings.com', 'ValidPass123');

      cy.get('form#loginFormId').submit();

      cy.then(() => {
        // 1. Llama a Firebase con credenciales correctas
        cy.wrap(authServiceMock.loginFirebase).should('have.been.calledOnce');

        // 2. Ejecuta applyBackendChange debido a que 'bun' !== 'firebase'
        cy.wrap(configServiceMock.applyBackendChange).should(
          'have.been.calledOnceWith',
          'bun'
        );

        // 3. SE DETIENE EL FLUJO AQUÍ. NO verifica backend, NO muestra toast, NO navega.
        cy.wrap(authServiceMock.verifyBackend).should('not.have.been.called');
        cy.wrap(toastCtrlMock.create).should('not.have.been.called');
        cy.wrap(navCtrlMock.navigateRoot).should('not.have.been.called');
      });
    });
  });

  describe('6. Flujo Asíncrono: Manejo de Errores', () => {
    beforeEach(() => mountComponent());

    it('debe capturar el error, imprimir en consola y mostrar Toast rojo de fallo', () => {
      // Forzamos a que Firebase rechace el login
      authServiceMock.loginFirebase = cy
        .stub()
        .rejects(new Error('Invalid credentials'));

      // Espiamos la consola para asegurar el catch
      cy.spy(console, 'error').as('consoleError');

      fillLoginForm('bad@coach.com', 'WrongPass');

      cy.get('form#loginFormId').submit();

      cy.then(() => {
        // Verificamos el log de error
        cy.get('@consoleError').should(
          'have.been.calledWith',
          'Login fallido:'
        );

        // Verificamos el Toast de error
        cy.wrap(toastCtrlMock.create).should('have.been.calledWithMatch', {
          message: 'Login failed. Please check your credentials.',
          color: 'danger', // Valor por defecto del toast de error en el componente
        });
        cy.wrap(toastPresentSpy).should('have.been.calledOnce');

        // Nos aseguramos que NO avanzó en el flujo
        cy.wrap(authServiceMock.verifyBackend).should('not.have.been.called');
        cy.wrap(navCtrlMock.navigateRoot).should('not.have.been.called');
      });
    });
  });
});
