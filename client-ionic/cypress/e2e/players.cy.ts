import {
  clickIonButton,
  clearIonInput,
  setIonSelectValue,
  typeIntoIonInput,
  visitApp,
} from '../support/e2e-helpers';

describe('Jugadores E2E', () => {
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

  const playersFixture = [
    {
      id: '1',
      name: 'Lionel Messi',
      firstName: 'Lionel',
      lastName: 'Messi',
      team: 'Inter Miami',
      league: 'MLS',
      position: 'fw',
      number: 10,
      nationality: 'Argentina',
      age: 37,
      height: 170,
      weight: 72,
      latitude: 25.7617,
      longitude: -80.1918,
      photoUrl: '',
    },
    {
      id: '2',
      name: 'Erling Haaland',
      firstName: 'Erling',
      lastName: 'Haaland',
      team: 'Manchester City',
      league: 'Premier League',
      position: 'fw',
      number: 9,
      nationality: 'Norway',
      age: 24,
      height: 194,
      weight: 88,
      latitude: 52.4862,
      longitude: -1.8904,
      photoUrl: '',
    },
    {
      id: '3',
      name: 'Jude Bellingham',
      firstName: 'Jude',
      lastName: 'Bellingham',
      team: 'Real Madrid',
      league: 'La Liga',
      position: 'mf',
      number: 5,
      nationality: 'England',
      age: 21,
      height: 186,
      weight: 75,
      latitude: 40.4168,
      longitude: -3.7038,
      photoUrl: '',
    },
  ];

  const createdPlayer = {
    id: '99',
    name: 'Vinicius Junior',
    firstName: 'Vinicius',
    lastName: 'Junior',
    age: 24,
    birthdate: '2000-07-12',
    nationality: 'Brazil',
    height: 176,
    weight: 73,
    team: 'Real Madrid',
    league: 'La Liga',
    position: 'fw',
    number: 7,
    latitude: 40.4168,
    longitude: -3.7038,
    photoUrl: undefined,
  };

  beforeEach(() => {
    visitApp('/login');

    cy.intercept(
      'POST',
      /https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:signInWithPassword\?key=.*/,
      signedInResponse
    ).as('firebaseSignIn');
    cy.intercept('GET', '**/user/profile', adminProfile).as('userProfile');
    cy.intercept('GET', '**/players', playersFixture).as('players');

    typeIntoIonInput(
      'ion-input[formControlName="email"]',
      'coach@draftkings.com'
    );
    typeIntoIonInput('ion-input[formControlName="password"]', 'ValidPass123!');
    clickIonButton('Login');

    cy.wait('@firebaseSignIn');
    cy.wait('@userProfile');
    cy.wait('@players');
  });

  it('permite buscar jugadores por nombre y limpiar la búsqueda', () => {
    // Escenario happy path: el filtro local reduce la lista en tiempo real.
    cy.url().should('include', '/#/tabs/players');
    cy.contains('.player-card', 'Lionel Messi').should('be.visible');

    typeIntoIonInput('ion-input[placeholder="Search players..."]', 'Messi');
    cy.contains('.player-card', 'Lionel Messi').should('be.visible');
    cy.contains('.player-card', 'Erling Haaland').should('not.exist');
    cy.contains('.player-card', 'Jude Bellingham').should('not.exist');

    clearIonInput('ion-input[placeholder="Search players..."]');
    cy.contains('.player-card', 'Lionel Messi').should('be.visible');
    cy.contains('.player-card', 'Erling Haaland').should('be.visible');
  });

  it('muestra el estado sin resultados y permite restablecer la búsqueda', () => {
    // Escenario sad path: la búsqueda no coincide con ningún jugador.
    typeIntoIonInput('ion-input[placeholder="Search players..."]', 'NoExiste');

    cy.contains('No players found matching your criteria').should('be.visible');

    clearIonInput('ion-input[placeholder="Search players..."]');
    cy.contains('.player-card', 'Lionel Messi').should('be.visible');
  });

  it('permite crear un jugador desde el formulario y navegar al detalle', () => {
    // Escenario happy path: el flujo de alta parte desde el botón admin de la pantalla de jugadores.
    cy.intercept('POST', '**/players', (req) => {
      expect(req.body).to.include({
        name: 'Vinicius Junior',
        firstName: 'Vinicius',
        lastName: 'Junior',
        team: 'Real Madrid',
        league: 'La Liga',
        position: 'fw',
        number: 7,
      });
      expect(req.body.latitude).to.be.a('number');
      expect(req.body.longitude).to.be.a('number');

      req.reply({
        statusCode: 201,
        body: createdPlayer,
      });
    }).as('createPlayer');

    clickIonButton('Add Player');

    cy.url().should('include', '/#/new-player');

    typeIntoIonInput(
      'ion-input[formControlName="displayName"]',
      'Vinicius Junior'
    );
    typeIntoIonInput('ion-input[formControlName="firstName"]', 'Vinicius');
    typeIntoIonInput('ion-input[formControlName="lastName"]', 'Junior');
    typeIntoIonInput('ion-input[formControlName="age"]', '24');
    typeIntoIonInput('ion-input[formControlName="birthdate"]', '2000-07-12');
    typeIntoIonInput('ion-input[formControlName="nationality"]', 'Brazil');
    typeIntoIonInput('ion-input[formControlName="height"]', '176');
    typeIntoIonInput('ion-input[formControlName="weight"]', '73');
    typeIntoIonInput('ion-input[formControlName="team"]', 'Real Madrid');
    typeIntoIonInput('ion-input[formControlName="league"]', 'La Liga');
    setIonSelectValue('ion-select[formControlName="position"]', 'fw');
    typeIntoIonInput('ion-input[formControlName="number"]', '7');

    clickIonButton('Save Player');

    cy.wait('@createPlayer');
    cy.url().should('include', '/#/player-detail/99');
  });

  it('muestra errores de validación si el formulario de alta está incompleto', () => {
    // Escenario sad path: no se pueden guardar jugadores sin completar campos requeridos.
    clickIonButton('Add Player');
    clickIonButton('Save Player');

    cy.contains('Required. Min 3 characters.').should('be.visible');
    cy.contains('Required (15-50).').should('be.visible');
    cy.contains('Required (1-99).').should('be.visible');
  });

  it('permite editar un jugador existente desde el detalle', () => {
    // Escenario happy path del update: abrir detalle, editar y guardar.
    cy.intercept('GET', '**/players/1', playersFixture[0]).as('playerDetail');
    cy.intercept('PUT', '**/players/1', (req) => {
      expect(req.body).to.include({
        name: 'Lionel Messi Updated',
        number: 30,
      });

      req.reply({
        statusCode: 200,
        body: {
          ...playersFixture[0],
          name: 'Lionel Messi Updated',
          number: 30,
        },
      });
    }).as('updatePlayer');

    cy.contains('.player-card', 'Lionel Messi').click();
    cy.wait('@playerDetail');

    clickIonButton('Edit Player');
    cy.url().should('include', '/#/new-player?id=1');

    clearIonInput('ion-input[formControlName="displayName"]');
    typeIntoIonInput(
      'ion-input[formControlName="displayName"]',
      'Lionel Messi Updated'
    );
    clearIonInput('ion-input[formControlName="number"]');
    typeIntoIonInput('ion-input[formControlName="number"]', '30');

    clickIonButton('Save Player');

    cy.wait('@updatePlayer');
    cy.url().should('include', '/#/player-detail/1');
  });

  it('permite eliminar un jugador y volver a la lista', () => {
    // Escenario sad path + happy path del delete: el modal protege el borrado y luego confirma la eliminación.
    cy.intercept('GET', '**/players/1', playersFixture[0]).as('playerDetail');
    cy.intercept('DELETE', '**/players/1', {
      statusCode: 204,
      body: {},
    }).as('deletePlayer');

    cy.contains('.player-card', 'Lionel Messi').click();
    cy.wait('@playerDetail');

    clickIonButton('Delete Player');
    cy.contains('Delete Player?').should('be.visible');

    cy.contains('ion-button', 'Cancel').click({ force: true });
    cy.contains('Delete Player?').should('not.exist');

    clickIonButton('Delete Player');
    cy.contains('ion-button', 'Delete').click({ force: true });

    cy.wait('@deletePlayer');
    cy.url().should('include', '/#/tabs/players');
  });
});
