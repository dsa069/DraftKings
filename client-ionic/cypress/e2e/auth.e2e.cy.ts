import {
  clickIonButton,
  firebaseSignInUrl,
  getToastMessage,
  typeIntoIonInput,
  visitApp,
} from '../support/e2e-helpers';
import { adminProfile, signedInResponse } from './utils/data/user.data-test';

describe('Autenticación E2E', () => {
  beforeEach(() => {
    visitApp('/login');
  });

  it('muestra validación visual si el formulario de login está vacío', () => {
    // Escenario sad path: el formulario no puede enviarse sin credenciales.
    clickIonButton('Login');

    getToastMessage().should('contain.text', 'The entered email is not valid');
    cy.url().should('include', '/#/login');
  });

  it('muestra validación visual si el email del login no tiene formato válido', () => {
    // Escenario sad path: email inválido antes de tocar Firebase.
    typeIntoIonInput('ion-input[formControlName="email"]', 'correo-invalido');
    typeIntoIonInput('ion-input[formControlName="password"]', 'ValidPass123!');

    clickIonButton('Login');

    getToastMessage().should('contain.text', 'The entered email is not valid');
    cy.url().should('include', '/#/login');
  });

  it('muestra error si Firebase rechaza las credenciales del login', () => {
    // Escenario sad path: el login supera la validación local, pero Firebase responde error.
    cy.intercept('POST', firebaseSignInUrl, {
      statusCode: 400,
      body: {
        error: {
          message: 'INVALID_LOGIN_CREDENTIALS',
        },
      },
    }).as('firebaseSignIn');

    typeIntoIonInput(
      'ion-input[formControlName="email"]',
      'coach@draftkings.com'
    );
    typeIntoIonInput('ion-input[formControlName="password"]', 'WrongPass123!');

    clickIonButton('Login');

    cy.wait('@firebaseSignIn');
    getToastMessage().should(
      'contain.text',
      'Login failed. Please check your credentials.'
    );
    cy.url().should('include', '/#/login');
  });

  it('permite iniciar sesión, verificar backend y entrar en jugadores', () => {
    // Escenario happy path: Firebase autentica, el backend devuelve perfil y la app muestra el área privada.
    cy.get('app-login').then(($loginEl) => {
      cy.window().then((win) => {
        const loginCmp = (win as any).ng.getComponent($loginEl[0]);
        const authService = loginCmp.authService;

        authService.loginFirebase = cy.stub().resolves(signedInResponse);
        authService.verifyBackend = cy.stub().resolves();
        authService.isAuthenticated = () => true;
        authService.userProfile = () => adminProfile;
        authService.isAdmin = () => true;
        authService.isUser = () => false;
      });
    });

    cy.intercept('GET', '**/players', []).as('players');

    typeIntoIonInput(
      'ion-input[formControlName="email"]',
      'coach@draftkings.com'
    );
    typeIntoIonInput('ion-input[formControlName="password"]', 'ValidPass123!');

    clickIonButton('Login');

    cy.wait('@players');

    cy.url().should('include', '/#/tabs/players');
    cy.contains('ion-button.extended-fab-btn', 'Add Player').should('exist');
    getToastMessage().should('contain.text', 'Login successful!');
  });

  it('registra un usuario y sincroniza el perfil en el backend', () => {
    // Escenario happy path: alta completa sin cambio de backend.
    visitApp('/sign-up');

    cy.get('app-sign-up').then(($signUpEl) => {
      cy.window().then((win) => {
        const signUpCmp = (win as any).ng.getComponent($signUpEl[0]);
        const authService = signUpCmp.authService;

        authService.registerFirebase = cy.stub().resolves(signedInResponse);
        authService.registerBackend = cy.stub().resolves({
          id: '1',
          firebaseUid: 'firebase-admin-uid',
          userName: 'NewCoach',
          email: 'newcoach@draftkings.com',
          role: 'ADMIN',
        });
        authService.verifyBackend = cy.stub().resolves();
        authService.isAuthenticated = () => true;
        authService.userProfile = () => adminProfile;
        authService.isAdmin = () => true;
        authService.isUser = () => false;
      });
    });

    cy.intercept('GET', '**/players', []).as('players');

    typeIntoIonInput('ion-input[formControlName="userName"]', 'NewCoach');
    typeIntoIonInput(
      'ion-input[formControlName="email"]',
      'newcoach@draftkings.com'
    );
    typeIntoIonInput('ion-input[formControlName="password"]', 'ValidPass123!');
    typeIntoIonInput(
      'ion-input[formControlName="confirmPassword"]',
      'ValidPass123!'
    );

    clickIonButton('Enter the Draft');

    cy.wait('@players');

    cy.url().should('include', '/#/tabs/players');
    cy.contains('ion-button.extended-fab-btn', 'Add Player').should('exist');
    getToastMessage().should('contain.text', 'Registration successful!');
  });

  it('muestra error si el nombre de usuario es demasiado corto', () => {
    // Escenario sad path: el username no alcanza el mínimo de 3 caracteres.
    visitApp('/sign-up');

    typeIntoIonInput('ion-input[formControlName="userName"]', 'AB');
    typeIntoIonInput(
      'ion-input[formControlName="email"]',
      'newcoach@draftkings.com'
    );
    typeIntoIonInput('ion-input[formControlName="password"]', 'ValidPass123!');
    typeIntoIonInput(
      'ion-input[formControlName="confirmPassword"]',
      'ValidPass123!'
    );

    clickIonButton('Enter the Draft');

    getToastMessage().should(
      'contain.text',
      'The username must be at least 3 characters.'
    );
    cy.url().should('include', '/#/sign-up');
  });

  it('muestra error si el email de registro tiene formato inválido', () => {
    // Escenario sad path: el formato de email no es válido antes de tocar el backend.
    visitApp('/sign-up');

    typeIntoIonInput('ion-input[formControlName="userName"]', 'NewCoach');
    typeIntoIonInput('ion-input[formControlName="email"]', 'correo-invalido');
    typeIntoIonInput('ion-input[formControlName="password"]', 'ValidPass123!');
    typeIntoIonInput(
      'ion-input[formControlName="confirmPassword"]',
      'ValidPass123!'
    );

    clickIonButton('Enter the Draft');

    getToastMessage().should('contain.text', 'Invalid email format.');
    cy.url().should('include', '/#/sign-up');
  });

  it('muestra error si la contraseña no cumple la política de seguridad', () => {
    // Escenario sad path: la contraseña no tiene símbolo ni longitud suficiente para pasar el patrón.
    visitApp('/sign-up');

    typeIntoIonInput('ion-input[formControlName="userName"]', 'NewCoach');
    typeIntoIonInput(
      'ion-input[formControlName="email"]',
      'newcoach@draftkings.com'
    );
    typeIntoIonInput('ion-input[formControlName="password"]', 'Password1');
    typeIntoIonInput(
      'ion-input[formControlName="confirmPassword"]',
      'Password1'
    );

    clickIonButton('Enter the Draft');

    getToastMessage().should(
      'contain.text',
      'Password must be at least 8 characters, include 1 number and 1 symbol.'
    );
    cy.url().should('include', '/#/sign-up');
  });

  it('muestra error si las contraseñas no coinciden', () => {
    // Escenario sad path: el validador cruzado detecta mismatch.
    visitApp('/sign-up');

    typeIntoIonInput('ion-input[formControlName="userName"]', 'NewCoach');
    typeIntoIonInput(
      'ion-input[formControlName="email"]',
      'newcoach@draftkings.com'
    );
    typeIntoIonInput('ion-input[formControlName="password"]', 'ValidPass123!');
    typeIntoIonInput(
      'ion-input[formControlName="confirmPassword"]',
      'DifferentPass123!'
    );

    clickIonButton('Enter the Draft');

    getToastMessage().should('contain.text', 'Passwords do not match.');
    cy.url().should('include', '/#/sign-up');
  });

  it('muestra error si el registro falla después de crear la cuenta en Firebase', () => {
    // Escenario sad path: Firebase crea el usuario, pero el backend de sincronización falla.
    visitApp('/sign-up');

    cy.get('app-sign-up').then(($signUpEl) => {
      cy.window().then((win) => {
        const signUpCmp = (win as any).ng.getComponent($signUpEl[0]);
        const authService = signUpCmp.authService;

        authService.registerFirebase = cy.stub().resolves(signedInResponse);
        authService.registerBackend = cy
          .stub()
          .rejects(new Error('Sync failed'));
        authService.deleteCurrentUser = cy.stub().resolves();
      });
    });

    typeIntoIonInput('ion-input[formControlName="userName"]', 'NewCoach');
    typeIntoIonInput(
      'ion-input[formControlName="email"]',
      'newcoach@draftkings.com'
    );
    typeIntoIonInput('ion-input[formControlName="password"]', 'ValidPass123!');
    typeIntoIonInput(
      'ion-input[formControlName="confirmPassword"]',
      'ValidPass123!'
    );

    clickIonButton('Enter the Draft');

    getToastMessage().should(
      'contain.text',
      'Registration error. Please try again.'
    );
    cy.url().should('include', '/#/sign-up');
  });
});
