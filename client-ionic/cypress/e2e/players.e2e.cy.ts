import {
  clickIonButton,
  setIonInputHostValue,
  setIonSelectValue,
  typeIntoIonInput,
  visitApp,
} from '../support/e2e-helpers';
import {
  adminProfile,
  signedInResponse,
  registeredProfile,
} from './utils/data/user.data-test';
import { createdPlayer, playersFixture } from './utils/data/player.data-test';

describe('Jugadores E2E', () => {
  beforeEach(() => {
    visitApp('/login');

    cy.get('app-login').then(($loginEl) => {
      cy.window().then((win) => {
        const loginCmp = (win as any).ng.getComponent($loginEl[0]);
        const authService = loginCmp.authService;

        authService.loginFirebase = cy.stub().resolves(signedInResponse);
        authService.verifyBackend = cy.stub().resolves();
        authService.getToken = cy.stub().resolves('mock-jwt-token');
        authService.isAuthenticated = () => true;
        authService.userProfile = () => adminProfile;
        authService.isAdmin = () => true;
        authService.isUser = () => false;
      });
    });

    cy.intercept('GET', '**/players', playersFixture).as('players');

    typeIntoIonInput(
      'ion-input[formControlName="email"]',
      'coach@draftkings.com'
    );
    typeIntoIonInput('ion-input[formControlName="password"]', 'ValidPass123!');
    clickIonButton('Login');

    cy.wait('@players');

    cy.url().should('include', '/#/tabs/players');

    cy.get('app-players').then(($playersEl) => {
      cy.window().then((win) => {
        const playersCmp = (win as any).ng.getComponent($playersEl[0]);
        const authService = playersCmp.authService;

        authService.isAuthenticated = () => true;
        authService.isAdmin = () => true;
        authService.isUser = () => false;
        authService.userProfile = () => adminProfile;

        if ((win as any).ng?.applyChanges) {
          (win as any).ng.applyChanges(playersCmp);
        }
      });
    });

    cy.contains('ion-fab', 'Add Player').should('exist');
  });

  type AuthStateProfile = typeof adminProfile | typeof registeredProfile | null;

  const setAuthOnCurrentView = (
    hostSelector: string,
    authState: {
      isAuthenticated: boolean;
      isAdmin: boolean;
      isUser: boolean;
      profile: AuthStateProfile;
    }
  ) => {
    cy.get(hostSelector).then(($host) => {
      cy.window().then((win) => {
        const cmp = (win as any).ng.getComponent($host[0]);
        const authService = cmp.authService;

        authService.getToken = cy
          .stub()
          .resolves(authState.isAuthenticated ? 'mock-jwt-token' : null);
        authService.isAuthenticated = () => authState.isAuthenticated;
        authService.isAdmin = () => authState.isAdmin;
        authService.isUser = () => authState.isUser;
        authService.userProfile = () => authState.profile;

        if ((win as any).ng?.applyChanges) {
          (win as any).ng.applyChanges(cmp);
        }
      });
    });
  };

  const enableAdminAuthOnCurrentView = (hostSelector: string) => {
    setAuthOnCurrentView(hostSelector, {
      isAuthenticated: true,
      isAdmin: true,
      isUser: false,
      profile: adminProfile,
    });
  };

  it('permite buscar jugadores por nombre y limpiar la búsqueda', () => {
    // Escenario happy path: el filtro local reduce la lista en tiempo real.
    cy.url().should('include', '/#/tabs/players');
    cy.contains('.player-card', 'Lionel Messi').should('be.visible');

    setIonInputHostValue('ion-input[placeholder="Search players..."]', 'Messi');
    cy.contains('.player-card', 'Lionel Messi').should('be.visible');
    cy.contains('.player-card', 'Erling Haaland').should('not.exist');
    cy.contains('.player-card', 'Jude Bellingham').should('not.exist');

    setIonInputHostValue('ion-input[placeholder="Search players..."]', '');
    cy.contains('.player-card', 'Lionel Messi').should('be.visible');
    cy.contains('.player-card', 'Erling Haaland').should('be.visible');
  });

  it('muestra el estado sin resultados y permite restablecer la búsqueda', () => {
    // Escenario sad path: la búsqueda no coincide con ningún jugador.
    setIonInputHostValue(
      'ion-input[placeholder="Search players..."]',
      'NoExiste'
    );

    cy.contains('No players found matching your criteria').should('be.visible');

    setIonInputHostValue('ion-input[placeholder="Search players..."]', '');
    cy.contains('.player-card', 'Lionel Messi').should('be.visible');
  });

  it('muestra errores de validación si el formulario de alta está incompleto', () => {
    // Escenario sad path: no se pueden guardar jugadores sin completar campos requeridos.
    clickIonButton('Add Player');
    clickIonButton('Save Player');

    cy.contains('Required. Min 3 characters.').scrollIntoView().should('exist');
    cy.contains('Required (15-50).').scrollIntoView().should('exist');
    cy.contains('Required (1-99).').scrollIntoView().should('exist');
  });

  it('muestra errores de rango al crear un jugador con valores inválidos', () => {
    clickIonButton('Add Player');

    typeIntoIonInput('ion-input[formControlName="displayName"]', 'AB');
    typeIntoIonInput('ion-input[formControlName="firstName"]', 'A');
    typeIntoIonInput('ion-input[formControlName="lastName"]', 'B');
    typeIntoIonInput('ion-input[formControlName="age"]', '14');
    typeIntoIonInput('ion-input[formControlName="birthdate"]', '2000-01-01');
    typeIntoIonInput('ion-input[formControlName="nationality"]', 'S');
    typeIntoIonInput('ion-input[formControlName="height"]', '139');
    typeIntoIonInput('ion-input[formControlName="weight"]', '131');
    typeIntoIonInput('ion-input[formControlName="team"]', 'T');
    typeIntoIonInput('ion-input[formControlName="league"]', 'L');
    setIonSelectValue('ion-select[formControlName="position"]', 'fw');
    typeIntoIonInput('ion-input[formControlName="number"]', '0');

    cy.get('app-new-player').then(($newPlayerEl) => {
      cy.window().then((win) => {
        const newPlayerCmp = (win as any).ng.getComponent($newPlayerEl[0]);

        newPlayerCmp.onSavePlayer();
        if ((win as any).ng?.applyChanges) {
          (win as any).ng.applyChanges(newPlayerCmp);
        }
      });
    });

    cy.contains('Required. Min 3 characters.').scrollIntoView().should('exist');
    cy.contains('Required. Min 2 characters.').scrollIntoView().should('exist');
    cy.contains('Required (15-50).').scrollIntoView().should('exist');
    cy.contains('Required (140-230).').scrollIntoView().should('exist');
    cy.contains('Required (40-130).').scrollIntoView().should('exist');
    cy.contains('Required (1-99).').scrollIntoView().should('exist');
    cy.url().should('include', '/#/new-player');
  });

  describe('como admin', () => {
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

    it('permite ir a detalle desde la lista de jugadores', () => {
      // Escenario happy path: abrir el detalle y verificar la tarjeta principal.
      cy.intercept('GET', '**/players/1', playersFixture[0]).as('playerDetail');

      cy.contains('.player-card', 'Lionel Messi').click();
      cy.wait('@playerDetail');
      enableAdminAuthOnCurrentView('app-player-detail');

      cy.url().should('include', '/#/player-detail/1');
      cy.get('app-player-detail').should('contain.text', 'Lionel Messi');
      cy.get('app-player-detail').should(
        'contain.text',
        'Inter Miami • Argentina'
      );
      cy.get('app-player-detail').should('contain.text', 'fw');
      cy.get('app-player-detail').should('contain.text', 'Full Name');
      cy.get('app-player-detail').should('contain.text', 'Team');
      cy.get('app-player-detail').should('contain.text', 'Inter Miami');
    });

    it('permite editar un jugador existente desde el detalle', () => {
      // Escenario happy path del update: abrir detalle, editar y guardar.
      cy.intercept('GET', '**/players/1', playersFixture[0]).as('playerDetail');

      cy.contains('.player-card', 'Lionel Messi').click();
      cy.wait('@playerDetail');
      enableAdminAuthOnCurrentView('app-player-detail');

      clickIonButton('Edit Player');
      cy.url().should('include', '/#/new-player?id=1');

      cy.get('app-new-player').then(($newPlayerEl) => {
        cy.window().then((win) => {
          const newPlayerCmp = (win as any).ng.getComponent($newPlayerEl[0]);
          const updatePlayerStub = cy.stub().resolves({
            ...playersFixture[0],
            name: 'Lionel Messi Updated',
            number: 30,
          });

          cy.wrap(updatePlayerStub).as('updatePlayerStub');

          newPlayerCmp.playerService.updatePlayer = updatePlayerStub;
          newPlayerCmp.isEditMode = true;
          newPlayerCmp.editingPlayerId = '1';
          newPlayerCmp.playerForm.patchValue({
            displayName: 'Lionel Messi Updated',
            firstName: 'Lionel',
            lastName: 'Messi',
            age: 37,
            birthdate: '1987-06-24',
            nationality: 'Argentina',
            height: 170,
            weight: 72,
            team: 'Inter Miami',
            league: 'MLS',
            position: 'fw',
            number: 30,
          });
          newPlayerCmp.selectedLocation = {
            lat: 25.7617,
            lng: -80.1918,
          };

          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(newPlayerCmp);
          }
        });
      });

      clickIonButton('Save Player');

      cy.get('@updatePlayerStub').should('have.been.calledOnce');
      cy.url().should('include', '/#/player-detail/1');
    });

    it('muestra validaciones requeridas en edición al vaciar campos', () => {
      cy.intercept('GET', '**/players/1', playersFixture[0]).as('playerDetail');

      cy.contains('.player-card', 'Lionel Messi').click();
      cy.wait('@playerDetail');
      enableAdminAuthOnCurrentView('app-player-detail');

      clickIonButton('Edit Player');
      cy.url().should('include', '/#/new-player?id=1');

      cy.get('app-new-player').then(($newPlayerEl) => {
        cy.window().then((win) => {
          const newPlayerCmp = (win as any).ng.getComponent($newPlayerEl[0]);

          newPlayerCmp.playerForm.patchValue({
            displayName: '',
            firstName: '',
            lastName: '',
            age: '',
            birthdate: '',
            nationality: '',
            height: '',
            weight: '',
            team: '',
            league: '',
            position: '',
            number: '',
          });

          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(newPlayerCmp);
          }
        });
      });

      cy.get('app-new-player').then(($newPlayerEl) => {
        cy.window().then((win) => {
          const newPlayerCmp = (win as any).ng.getComponent($newPlayerEl[0]);

          newPlayerCmp.onSavePlayer();
          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(newPlayerCmp);
          }
        });
      });

      cy.contains('Required. Min 3 characters.')
        .scrollIntoView()
        .should('exist');
      cy.contains('Required. Min 2 characters.')
        .scrollIntoView()
        .should('exist');
      cy.contains('Required.').scrollIntoView().should('exist');
      cy.contains('Required (15-50).').scrollIntoView().should('exist');
      cy.contains('Required (140-230).').scrollIntoView().should('exist');
      cy.contains('Required (40-130).').scrollIntoView().should('exist');
      cy.contains('Required (1-99).').scrollIntoView().should('exist');
      cy.url().should('include', '/#/new-player?id=1');
    });

    it('muestra validaciones de rango en edición con valores fuera de límite', () => {
      cy.intercept('GET', '**/players/1', playersFixture[0]).as('playerDetail');

      cy.contains('.player-card', 'Lionel Messi').click();
      cy.wait('@playerDetail');
      enableAdminAuthOnCurrentView('app-player-detail');

      clickIonButton('Edit Player');
      cy.url().should('include', '/#/new-player?id=1');

      cy.get('app-new-player').then(($newPlayerEl) => {
        cy.window().then((win) => {
          const newPlayerCmp = (win as any).ng.getComponent($newPlayerEl[0]);

          newPlayerCmp.playerForm.patchValue({
            displayName: 'AB',
            firstName: 'A',
            lastName: 'B',
            age: 51,
            birthdate: '1987-06-24',
            nationality: 'S',
            height: 231,
            weight: 39,
            team: 'T',
            league: 'L',
            position: 'fw',
            number: 100,
          });

          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(newPlayerCmp);
          }
        });
      });

      cy.get('app-new-player').then(($newPlayerEl) => {
        cy.window().then((win) => {
          const newPlayerCmp = (win as any).ng.getComponent($newPlayerEl[0]);

          newPlayerCmp.onSavePlayer();
          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(newPlayerCmp);
          }
        });
      });

      cy.contains('Required. Min 3 characters.')
        .scrollIntoView()
        .should('exist');
      cy.contains('Required. Min 2 characters.')
        .scrollIntoView()
        .should('exist');
      cy.contains('Required (15-50).').scrollIntoView().should('exist');
      cy.contains('Required (140-230).').scrollIntoView().should('exist');
      cy.contains('Required (40-130).').scrollIntoView().should('exist');
      cy.contains('Required (1-99).').scrollIntoView().should('exist');
      cy.url().should('include', '/#/new-player?id=1');
    });

    it('permite eliminar un jugador y volver a la lista', () => {
      // Escenario sad path + happy path del delete: el modal protege el borrado y luego confirma la eliminación.
      cy.intercept('GET', '**/players/1', playersFixture[0]).as('playerDetail');

      cy.contains('.player-card', 'Lionel Messi').click();
      cy.wait('@playerDetail');
      enableAdminAuthOnCurrentView('app-player-detail');

      cy.get('app-player-detail').then(($detailEl) => {
        cy.window().then((win) => {
          const detailCmp = (win as any).ng.getComponent($detailEl[0]);
          const deletePlayerStub = cy.stub().resolves();

          cy.wrap(deletePlayerStub).as('deletePlayerStub');

          detailCmp.playerService.deletePlayer = deletePlayerStub;
          detailCmp.onDeletePlayer();

          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(detailCmp);
          }
        });
      });

      cy.contains('Delete Player?').should('be.visible');

      cy.get('app-player-detail').then(($detailEl) => {
        cy.window().then((win) => {
          const detailCmp = (win as any).ng.getComponent($detailEl[0]);

          detailCmp.confirmDeletePlayer();
          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(detailCmp);
          }
        });
      });

      cy.get('@deletePlayerStub').should('have.been.calledOnce');
      cy.url().should('include', '/#/tabs/players');
    });
  });

  describe('permisos de acceso', () => {
    it('permite crear pero no editar ni borrar como usuario registrado', () => {
      // Escenario de permisos: un usuario autenticado normal puede crear, pero no administrar detalles.
      setAuthOnCurrentView('app-players', {
        isAuthenticated: true,
        isAdmin: false,
        isUser: true,
        profile: registeredProfile,
      });

      cy.contains('ion-fab', 'Add Player').should('be.visible');

      clickIonButton('Add Player');
      cy.url().should('include', '/#/new-player');

      cy.go('back');
      cy.url().should('include', '/#/tabs/players');

      cy.intercept('GET', '**/players/1', playersFixture[0]).as(
        'userPlayerDetail'
      );
      cy.contains('.player-card', 'Lionel Messi').click();
      cy.wait('@userPlayerDetail');

      setAuthOnCurrentView('app-player-detail', {
        isAuthenticated: true,
        isAdmin: false,
        isUser: true,
        profile: registeredProfile,
      });

      cy.url().should('include', '/#/player-detail/1');
      cy.get('app-player-detail .edit-btn').should('not.exist');
      cy.get('app-player-detail .delete-btn').should('not.exist');
    });

    it('oculta crear, editar y borrar para un usuario no registrado', () => {
      // Escenario anónimo: no se muestra el acceso a alta y tampoco las acciones de administración.
      setAuthOnCurrentView('app-players', {
        isAuthenticated: false,
        isAdmin: false,
        isUser: false,
        profile: null,
      });

      cy.contains('ion-fab', 'Add Player').should('not.exist');

      cy.intercept('GET', '**/players/1', playersFixture[0]).as(
        'guestPlayerDetail'
      );
      cy.contains('.player-card', 'Lionel Messi').click();
      cy.wait('@guestPlayerDetail');

      setAuthOnCurrentView('app-player-detail', {
        isAuthenticated: false,
        isAdmin: false,
        isUser: false,
        profile: null,
      });

      cy.url().should('include', '/#/player-detail/1');
      cy.get('app-player-detail .edit-btn').should('not.exist');
      cy.get('app-player-detail .delete-btn').should('not.exist');
    });
  });

  describe('errores de operaciones', () => {
    it('muestra error al cargar el detalle de un jugador', () => {
      cy.intercept('GET', '**/players/1', {
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        body: {},
      }).as('playerDetailError');

      cy.contains('.player-card', 'Lionel Messi').click();
      cy.wait('@playerDetailError');

      cy.url().should('include', '/#/player-detail/1');
      cy.get('app-player-detail').should(
        'contain.text',
        'Error loading player details'
      );
      cy.get('ion-note.error-message').should('be.visible');
    });

    it('mantiene la pantalla de alta si falla la creación del jugador', () => {
      clickIonButton('Add Player');
      cy.url().should('include', '/#/new-player');

      let newPlayerCmp: any;
      cy.get('app-new-player').then(($newPlayerEl) => {
        cy.window().then((win) => {
          newPlayerCmp = (win as any).ng.getComponent($newPlayerEl[0]);
          const createStub = cy.stub().rejects(new Error('Create failed'));
          const rollbackStub = cy.stub().resolves();

          cy.wrap(createStub).as('createErrorStub');
          cy.wrap(rollbackStub).as('createRollbackStub');

          newPlayerCmp.playerService.createPlayer = createStub;
          newPlayerCmp.photoService.currentPhotoPreview = () => null;
          newPlayerCmp.photoService.rollbackLastUpload = rollbackStub;
          newPlayerCmp.playerForm.patchValue({
            displayName: 'Failed Create',
            firstName: 'Failed',
            lastName: 'Create',
            age: 25,
            birthdate: '2000-01-01',
            nationality: 'Spain',
            height: 180,
            weight: 75,
            team: 'Test FC',
            league: 'Test League',
            position: 'fw',
            number: 11,
          });
          newPlayerCmp.selectedLocation = {
            lat: 40.4168,
            lng: -3.7038,
          };

          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(newPlayerCmp);
          }
        });
      });

      cy.then(() => newPlayerCmp.onSavePlayer());

      cy.get('@createErrorStub').should('have.been.calledOnce');
      cy.get('@createRollbackStub').should('have.been.calledOnce');
      cy.url().should('include', '/#/new-player');
      cy.url().should('not.include', '/player-detail/');
    });

    it('muestra un error si falla la actualización del jugador', () => {
      cy.intercept('GET', '**/players/1', playersFixture[0]).as('playerDetail');

      cy.contains('.player-card', 'Lionel Messi').click();
      cy.wait('@playerDetail');
      enableAdminAuthOnCurrentView('app-player-detail');

      clickIonButton('Edit Player');
      cy.url().should('include', '/#/new-player?id=1');

      let newPlayerCmp: any;
      cy.get('app-new-player').then(($newPlayerEl) => {
        cy.window().then((win) => {
          newPlayerCmp = (win as any).ng.getComponent($newPlayerEl[0]);
          const updateRollbackStub = cy.stub().resolves();
          const updateStub = cy.stub().rejects(new Error('Update failed'));

          cy.wrap(updateStub).as('updateErrorStub');
          cy.wrap(updateRollbackStub).as('updateRollbackStub');

          newPlayerCmp.playerService.updatePlayer = updateStub;
          newPlayerCmp.photoService.currentPhotoPreview = () => null;
          newPlayerCmp.photoService.rollbackLastUpload = updateRollbackStub;
          newPlayerCmp.playerForm.patchValue({
            displayName: 'Lionel Messi Updated',
            firstName: 'Lionel',
            lastName: 'Messi',
            age: 37,
            birthdate: '1987-06-24',
            nationality: 'Argentina',
            height: 170,
            weight: 72,
            team: 'Inter Miami',
            league: 'MLS',
            position: 'fw',
            number: 30,
          });
          newPlayerCmp.selectedLocation = {
            lat: 25.7617,
            lng: -80.1918,
          };

          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(newPlayerCmp);
          }
        });
      });

      cy.then(() => newPlayerCmp.onSavePlayer());

      cy.get('@updateErrorStub').should('have.been.calledOnce');
      cy.get('@updateRollbackStub').should('have.been.calledOnce');
      cy.url().should('include', '/#/new-player?id=1');
      cy.url().should('not.include', '/player-detail/1');
    });

    it('muestra error al borrar un jugador y no vuelve a la lista', () => {
      cy.intercept('GET', '**/players/1', playersFixture[0]).as('playerDetail');

      cy.contains('.player-card', 'Lionel Messi').click();
      cy.wait('@playerDetail');
      enableAdminAuthOnCurrentView('app-player-detail');

      cy.get('app-player-detail').then(($detailEl) => {
        cy.window().then((win) => {
          const detailCmp = (win as any).ng.getComponent($detailEl[0]);
          const deleteStub = cy.stub().rejects(new Error('Delete failed'));

          cy.wrap(deleteStub).as('deleteErrorStub');

          detailCmp.playerService.deletePlayer = deleteStub;
          detailCmp.onDeletePlayer();

          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(detailCmp);
          }
        });
      });

      cy.contains('Delete Player?').should('be.visible');

      cy.get('app-player-detail').then(($detailEl) => {
        cy.window().then((win) => {
          const detailCmp = (win as any).ng.getComponent($detailEl[0]);

          cy.then(() => detailCmp.confirmDeletePlayer());

          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(detailCmp);
          }
        });
      });

      cy.get('@deleteErrorStub').should('have.been.calledOnce');
      cy.get('app-player-detail').then(($detailEl) => {
        cy.window().then((win) => {
          const detailCmp = (win as any).ng.getComponent($detailEl[0]);
          expect(detailCmp.errorMessage()).to.equal(
            'Error al eliminar el jugador'
          );
        });
      });
      cy.url().should('include', '/#/player-detail/1');
    });
  });
});
