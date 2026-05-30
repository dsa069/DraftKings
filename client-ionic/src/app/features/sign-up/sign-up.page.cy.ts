import { SignUpPage } from './sign-up.page';
import { AuthService } from '../../core/services/abstract/auth.service';
import { ConfigService } from '../../core/services/config.service';
import { NavController, ToastController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

describe('SignUpPage Component', () => {
  let authServiceMock: any;
  let configServiceMock: any;
  let navCtrlMock: Partial<NavController>;
  let toastCtrlMock: Partial<ToastController>;
  let toastPresentSpy: any;

  beforeEach(() => {
    toastPresentSpy = cy.stub().resolves();
    toastCtrlMock = {
      create: cy.stub().resolves({
        present: toastPresentSpy,
      } as any),
    };

    navCtrlMock = {
      navigateRoot: cy.stub().resolves(true),
      navigateBack: cy.stub().resolves(true),
    };

    configServiceMock = {
      selectedBackend: cy.stub().returns('node'),
      applyBackendChange: cy.stub(),
    };

    authServiceMock = {
      registerFirebase: cy.stub().resolves({ user: { uid: '123' } }),
      registerBackend: cy.stub().resolves({}),
      deleteCurrentUser: cy.stub().resolves(),
    };
  });

  const mountComponent = () => {
    cy.mount(SignUpPage, {
      imports: [ReactiveFormsModule],
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

  const setIonInputValue = (selector: string, value: string) => {
    cy.get(selector).trigger('ionInput', { detail: { value } });
    cy.get(selector).trigger('ionChange', { detail: { value } });
  };

  describe('1. Renderizado Inicial e Interfaz Base', () => {
    beforeEach(() => mountComponent());

    it('debe renderizar el formulario y los inputs correctamente', () => {
      cy.get('.hero-title').should('contain.text', 'Build Your');
      cy.get('app-login-card').should('exist');
      cy.get('ion-input[formControlName="userName"]').should('exist');
      cy.get('ion-input[formControlName="email"]').should('exist');
      cy.get('ion-input[formControlName="password"]').should('exist');
      cy.get('ion-input[formControlName="confirmPassword"]').should('exist');
    });

    it('el botón de submit debe estar deshabilitado por defecto (formulario inválido)', () => {
      cy.get('.login-button').should('have.attr', 'form', 'signUpFormId');
      cy.get('@componentInstance').its('signUpForm.invalid').should('be.true');
    });
  });

  describe('2. Validaciones de Formulario Reactivo', () => {
    beforeEach(() => mountComponent());

    it('debe mostrar toast si el email tiene un formato inválido', () => {
      setIonInputValue('ion-input[formControlName="userName"]', 'CoachTest');
      setIonInputValue('ion-input[formControlName="email"]', 'email-invalido');
      setIonInputValue('ion-input[formControlName="password"]', 'Password1!');
      setIonInputValue(
        'ion-input[formControlName="confirmPassword"]',
        'Password1!'
      );

      cy.get('form#signUpFormId').submit();

      cy.wrap(toastCtrlMock.create).should('have.been.calledWithMatch', {
        message: 'Invalid email format.',
        color: 'danger',
      });
    });

    it('debe mostrar error si las contraseñas no coinciden (Custom Validator)', () => {
      setIonInputValue('ion-input[formControlName="userName"]', 'CoachTest');
      setIonInputValue(
        'ion-input[formControlName="email"]',
        'test@draftkings.com'
      );
      setIonInputValue('ion-input[formControlName="password"]', 'Password1!');
      setIonInputValue(
        'ion-input[formControlName="confirmPassword"]',
        'Password2!'
      );

      cy.get('form#signUpFormId').submit();

      cy.wrap(toastCtrlMock.create).should('have.been.calledWithMatch', {
        message: 'Passwords do not match.',
        color: 'danger',
      });
    });

    it('debe habilitar el submit cuando todos los campos son válidos', () => {
      setIonInputValue('ion-input[formControlName="userName"]', 'TestUser');
      setIonInputValue(
        'ion-input[formControlName="email"]',
        'test@draftkings.com'
      );
      setIonInputValue(
        'ion-input[formControlName="password"]',
        'ValidPass123!'
      );
      setIonInputValue(
        'ion-input[formControlName="confirmPassword"]',
        'ValidPass123!'
      );

      cy.get('@componentInstance').its('signUpForm.valid').should('be.true');
    });
  });

  describe('3. Flujo Asíncrono: Registro Exitoso', () => {
    beforeEach(() => mountComponent());

    it('debe llamar al AuthService, notificar éxito y navegar', () => {
      setIonInputValue('ion-input[formControlName="userName"]', 'TestUser');
      setIonInputValue(
        'ion-input[formControlName="email"]',
        'test@draftkings.com'
      );
      setIonInputValue(
        'ion-input[formControlName="password"]',
        'ValidPass123!'
      );
      setIonInputValue(
        'ion-input[formControlName="confirmPassword"]',
        'ValidPass123!'
      );

      cy.get('form#signUpFormId').submit();

      cy.wrap(authServiceMock.registerFirebase).should(
        'have.been.calledOnceWith',
        'test@draftkings.com',
        'ValidPass123!'
      );
      cy.wrap(authServiceMock.registerBackend).should(
        'have.been.calledOnceWithMatch',
        { userName: 'TestUser', role: 'USER' }
      );
      cy.wrap(toastCtrlMock.create).should('have.been.calledWithMatch', {
        message: 'Registration successful!',
        color: 'success',
      });
      cy.wrap(navCtrlMock.navigateRoot).should(
        'have.been.calledOnceWith',
        '/tabs/players'
      );
    });
  });

  describe('4. Flujo Asíncrono: Manejo de Errores (Backend / Firebase)', () => {
    beforeEach(() => mountComponent());

    it('debe capturar el error y mostrar un Toast de error', () => {
      authServiceMock.registerFirebase = cy
        .stub()
        .rejects(new Error('Email already in use'));
      cy.spy(console, 'error').as('consoleError');

      setIonInputValue('ion-input[formControlName="userName"]', 'Hacker');
      setIonInputValue(
        'ion-input[formControlName="email"]',
        'hacker@draftkings.com'
      );
      setIonInputValue('ion-input[formControlName="password"]', 'Pass1234!');
      setIonInputValue(
        'ion-input[formControlName="confirmPassword"]',
        'Pass1234!'
      );

      cy.get('form#signUpFormId').submit();

      cy.get('@consoleError').should('have.been.called');
      cy.wrap(authServiceMock.deleteCurrentUser).should('have.been.calledOnce');
      cy.wrap(toastCtrlMock.create).should('have.been.calledWithMatch', {
        message: 'Registration error. Please try again.',
        color: 'danger',
      });
      cy.wrap(navCtrlMock.navigateRoot).should('not.have.been.called');
    });
  });

  describe('5. Navegación Secundaria e Interacciones Menores', () => {
    beforeEach(() => mountComponent());

    it('debe navegar a la pantalla de Login al hacer clic en Log In', () => {
      cy.get('.signup-link').click({ force: true });
      cy.wrap(navCtrlMock.navigateRoot).should(
        'have.been.calledOnceWith',
        '/login'
      );
    });

    it('debe alternar la visibilidad de la contraseña al hacer clic en el ícono del ojo', () => {
      cy.get('@componentInstance').then((instance: any) => {
        expect(instance.showPassword).to.be.false;
        instance.togglePasswordVisibility();
        expect(instance.showPassword).to.be.true;
      });
    });
  });
});
