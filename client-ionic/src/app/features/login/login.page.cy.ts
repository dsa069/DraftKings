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
  });
});
