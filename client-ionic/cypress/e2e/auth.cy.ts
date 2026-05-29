import {
  clickIonButton,
  firebaseDeleteUserUrl,
  firebaseSignInUrl,
  firebaseSignUpUrl,
  getToastMessage,
  typeIntoIonInput,
  visitApp,
} from '../support/e2e-helpers';

describe('Autenticación E2E', () => {
  const adminProfile = {
    id: '1',
    firebaseUid: 'firebase-admin-uid',
    userName: 'ProGamer99',
    email: 'coach@draftkings.com',
    role: 'ADMIN' as const,
  };

  const signedInResponse = {
    localId: 'firebase-admin-uid',
    email: 'coach@draftkings.com',
    displayName: 'ProGamer99',
    idToken: 'mock-id-token',
    registered: true,
    refreshToken: 'mock-refresh-token',
    expiresIn: '3600',
  };

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
    cy.intercept('POST', firebaseSignInUrl, signedInResponse).as(
      'firebaseSignIn'
    );
    cy.intercept('GET', '**/user/profile', adminProfile).as('userProfile');
    cy.intercept('GET', '**/players', []).as('players');

    typeIntoIonInput(
      'ion-input[formControlName="email"]',
      'coach@draftkings.com'
    );
    typeIntoIonInput('ion-input[formControlName="password"]', 'ValidPass123!');

    clickIonButton('Login');

    cy.wait('@firebaseSignIn');
    cy.wait('@userProfile');
    cy.wait('@players');

    cy.url().should('include', '/#/tabs/players');
    cy.contains('ion-button.extended-fab-btn', 'Add Player').should('exist');
    getToastMessage().should('contain.text', 'Login successful!');
  });

  it('registra un usuario y sincroniza el perfil en el backend', () => {
    // Escenario happy path: alta completa sin cambio de backend.
    visitApp('/sign-up');

    cy.intercept('POST', firebaseSignUpUrl, signedInResponse).as(
      'firebaseSignUp'
    );
    cy.intercept('POST', '**/user/sync', (req) => {
      expect(req.body).to.deep.equal({
        userName: 'NewCoach',
        role: 'ADMIN',
      });

      req.reply({
        statusCode: 201,
        body: {
          id: '1',
          firebaseUid: 'firebase-admin-uid',
          userName: 'NewCoach',
          email: 'newcoach@draftkings.com',
          role: 'ADMIN',
        },
      });
    }).as('syncUser');
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

    cy.wait('@firebaseSignUp');
    cy.wait('@syncUser');
    cy.wait('@players');

    cy.url().should('include', '/#/tabs/players');
    cy.contains('ion-button.extended-fab-btn', 'Add Player').should('exist');
    getToastMessage().should('contain.text', 'Registration successful!');
  });

  it('muestra error si el registro falla después de crear la cuenta en Firebase', () => {
    // Escenario sad path: Firebase crea el usuario, pero el backend de sincronización falla.
    cy.intercept('POST', firebaseSignUpUrl, signedInResponse).as(
      'firebaseSignUp'
    );
    cy.intercept('POST', '**/user/sync', {
      statusCode: 500,
      body: { message: 'Sync failed' },
    }).as('syncUser');
    cy.intercept('POST', firebaseDeleteUserUrl, {
      statusCode: 200,
      body: {},
    }).as('deleteUser');

    visitApp('/sign-up');

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

    cy.wait('@firebaseSignUp');
    cy.wait('@syncUser');
    cy.wait('@deleteUser');

    getToastMessage().should(
      'contain.text',
      'Registration error. Please try again.'
    );
    cy.url().should('include', '/#/sign-up');
  });
});
