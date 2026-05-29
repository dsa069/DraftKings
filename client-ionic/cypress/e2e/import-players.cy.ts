import { setIonInputHostValue, visitApp } from '../support/e2e-helpers';

describe('Importar jugadores E2E', () => {
  const externalPlayersFixture = [
    {
      id: '101',
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
      photoUrl: '',
    },
    {
      id: '102',
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
      photoUrl: '',
    },
    {
      id: '103',
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
      photoUrl: '',
    },
  ];

  const deviceLocation = {
    lat: 40.4167,
    lng: -3.7032,
  };

  beforeEach(() => {
    cy.intercept('GET', '**/players/external*', (req) => {
      const search = String(req.query['search'] ?? '').toLowerCase();

      const response = search
        ? externalPlayersFixture.filter((player) =>
            `${player.name} ${player.firstName} ${player.lastName}`
              .toLowerCase()
              .includes(search)
          )
        : externalPlayersFixture;

      req.reply(response);
    }).as('externalPlayers');

    visitApp('/import-players');

    cy.wait('@externalPlayers');
    cy.contains('.player-card', 'Lionel Messi').should('be.visible');
    cy.contains('.player-card', 'Erling Haaland').should('be.visible');

    cy.get('app-import-players').then(($host) => {
      cy.window().then((win) => {
        const cmp = (win as any).ng.getComponent($host[0]);

        const locationStub = cy.stub().resolves(deviceLocation);
        const navigateBackStub = cy.stub().resolves(true);

        cmp.locationService.requestDeviceCurrentPosition = locationStub;
        cmp.navCtrl.navigateBack = navigateBackStub;

        cy.wrap(locationStub).as('locationStub');
        cy.wrap(navigateBackStub).as('navigateBackStub');

        if ((win as any).ng?.applyChanges) {
          (win as any).ng.applyChanges(cmp);
        }
      });
    });
  });

  it('carga y filtra jugadores externos simulados', () => {
    // No tocamos API real: el endpoint externo se intercepta con datos de fixture.
    setIonInputHostValue(
      'app-import-players ion-input[placeholder="Search players..."]',
      'Messi'
    );

    cy.wait('@externalPlayers')
      .its('request.url')
      .should('include', 'search=Messi');

    cy.contains('.player-card', 'Lionel Messi').should('be.visible');
    cy.contains('.player-card', 'Erling Haaland').should('not.exist');

    setIonInputHostValue(
      'app-import-players ion-input[placeholder="Search players..."]',
      ''
    );

    cy.wait('@externalPlayers');
    cy.contains('.player-card', 'Jude Bellingham').should('be.visible');
  });

  it('muestra error si falla la carga de jugadores externos', () => {
    cy.get('app-import-players').then(($host) => {
      cy.window().then((win) => {
        const cmp = (win as any).ng.getComponent($host[0]);
        const loadStub = cy
          .stub()
          .rejects(new Error('External API unavailable'));

        cmp.playerService.getExternalApiPlayers = loadStub;

        if ((win as any).ng?.applyChanges) {
          (win as any).ng.applyChanges(cmp);
        }

        cy.wrap(loadStub).as('loadStub');
        cmp.loadExternalPlayers();
      });
    });

    cy.get('@loadStub').should('have.been.calledOnce');
    cy.get('ion-note.error-box')
      .should('be.visible')
      .and('contain.text', 'Could not load data from API Football.');
    cy.get('app-player-list').should('not.exist');
  });

  it('muestra error si falla la búsqueda de jugadores externos', () => {
    cy.get('app-import-players').then(($host) => {
      cy.window().then((win) => {
        const cmp = (win as any).ng.getComponent($host[0]);
        const searchStub = cy.stub().rejects(new Error('Search failed'));

        cmp.playerService.getExternalApiPlayers = searchStub;

        if ((win as any).ng?.applyChanges) {
          (win as any).ng.applyChanges(cmp);
        }

        cy.wrap(searchStub).as('searchStub');
        cmp.onSearchChange('Messi');
      });
    });

    cy.get('@searchStub').should('have.been.calledOnceWith', 'Messi');
    cy.get('ion-note.error-box')
      .should('be.visible')
      .and('contain.text', 'Could not load data from API Football.');
    cy.get('app-player-list').should('not.exist');
  });

  it('permite seleccionar e importar jugadores con coordenadas locales', () => {
    // El flujo de importación usa una ubicación stubbeada y un POST interceptado.
    cy.clock();

    cy.intercept('POST', '**/players/import', (req) => {
      expect(req.body).to.have.length(2);
      expect(req.body[0]).to.include({
        id: '101',
        name: 'Lionel Messi',
        latitude: deviceLocation.lat,
        longitude: deviceLocation.lng,
      });
      expect(req.body[1]).to.include({
        id: '102',
        name: 'Erling Haaland',
        latitude: deviceLocation.lat,
        longitude: deviceLocation.lng,
      });

      req.reply({
        statusCode: 201,
        body: {},
      });
    }).as('importPlayers');

    cy.get('app-player-list').then(($listHost) => {
      cy.window().then((win) => {
        const listCmp = (win as any).ng.getComponent($listHost[0]);
        listCmp.onPlayerClick(externalPlayersFixture[0]);
        listCmp.onPlayerClick(externalPlayersFixture[1]);

        if ((win as any).ng?.applyChanges) {
          (win as any).ng.applyChanges(listCmp);
        }
      });
    });

    cy.contains('ion-button.import-submit-btn', 'Import Selected (2)').should(
      'be.visible'
    );
    cy.contains('ion-button.import-submit-btn', 'Import Selected (2)').click({
      force: true,
    });

    cy.get('@locationStub').should('have.been.calledOnce');
    cy.wait('@importPlayers');

    cy.get('app-import-players').then(($host) => {
      cy.window().then((win) => {
        const cmp = (win as any).ng.getComponent($host[0]);

        expect(cmp.toastMessage()).to.equal('Successfully imported 2 players!');
        expect(cmp.showToast()).to.be.true;
      });
    });

    cy.tick(1500);

    cy.get('@navigateBackStub').should(
      'have.been.calledOnceWith',
      '/tabs/players'
    );
  });

  it('muestra error y no navega si falla la importación', () => {
    cy.clock();

    cy.get('app-import-players').then(($host) => {
      cy.window().then((win) => {
        const cmp = (win as any).ng.getComponent($host[0]);
        const importStub = cy.stub().rejects(new Error('Import failed'));

        cmp.playerService.importPlayers = importStub;

        if ((win as any).ng?.applyChanges) {
          (win as any).ng.applyChanges(cmp);
        }

        cy.wrap(importStub).as('importErrorStub');
      });
    });

    cy.get('app-player-list').then(($listHost) => {
      cy.window().then((win) => {
        const listCmp = (win as any).ng.getComponent($listHost[0]);
        listCmp.onPlayerClick(externalPlayersFixture[0]);
        listCmp.onPlayerClick(externalPlayersFixture[1]);

        if ((win as any).ng?.applyChanges) {
          (win as any).ng.applyChanges(listCmp);
        }
      });
    });

    cy.contains('ion-button.import-submit-btn', 'Import Selected (2)').click({
      force: true,
    });

    cy.get('@locationStub').should('have.been.calledOnce');
    cy.get('@importErrorStub').should('have.been.calledOnce');

    cy.get('app-import-players').then(($host) => {
      cy.window().then((win) => {
        const cmp = (win as any).ng.getComponent($host[0]);

        expect(cmp.toastMessage()).to.equal(
          'Error importing players. Please try again.'
        );
        expect(cmp.showToast()).to.be.true;
      });
    });

    cy.tick(1500);
    cy.get('@navigateBackStub').should('not.have.been.called');
  });
});
