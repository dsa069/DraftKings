import {
  clickIonButton,
  typeIntoIonInput,
  visitApp,
} from '../support/e2e-helpers';
import {
  adminProfile,
  registeredProfile,
  signedInResponse,
} from './utils/data/user.data-test';
import { playerDetail } from './utils/data/player.data-test';
import {
  commentLocationCoords,
  reviewsFixture,
} from './utils/data/review.data-test';

type AuthStateProfile = typeof adminProfile | typeof registeredProfile | null;

describe('Comentarios E2E', () => {
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

    cy.intercept('GET', '**/players', [playerDetail]).as('players');

    typeIntoIonInput(
      'ion-input[formControlName="email"]',
      'coach@draftkings.com'
    );
    typeIntoIonInput('ion-input[formControlName="password"]', 'ValidPass123!');
    clickIonButton('Login');

    cy.wait('@players');

    cy.intercept('GET', '**/players/1', playerDetail).as('playerDetail');
    cy.intercept('GET', '**/players/1/reviews', reviewsFixture).as('reviews');

    cy.contains('.player-card', 'Lionel Messi').click();
    cy.wait('@playerDetail');
    cy.wait('@reviews');

    cy.get('app-player-detail').then(($host) => {
      cy.window().then((win) => {
        const cmp = (win as any).ng.getComponent($host[0]);
        const authService = cmp.authService;

        authService.isAuthenticated = () => true;
        authService.isAdmin = () => true;
        authService.isUser = () => false;
        authService.userProfile = () => adminProfile;

        // Update the component's captured signal references
        if ('isAuthenticated' in cmp) {
          cmp.isAuthenticated = () => true;
        }
        if ('isAdmin' in cmp) {
          cmp.isAdmin = () => true;
        }

        if ((win as any).ng?.applyChanges) {
          (win as any).ng.applyChanges(cmp);
        }
      });
    });
  });

  const getDetailComponent = () =>
    cy
      .get('app-player-detail')
      .then(($host) =>
        cy.window().then((win) => (win as any).ng.getComponent($host[0]))
      );

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

        // Update the component's captured signal references
        if ('isAuthenticated' in cmp) {
          cmp.isAuthenticated = () => authState.isAuthenticated;
        }
        if ('isAdmin' in cmp) {
          cmp.isAdmin = () => authState.isAdmin;
        }

        if ((win as any).ng?.applyChanges) {
          (win as any).ng.applyChanges(cmp);
        }
      });
    });
  };

  it('muestra comentarios existentes y permite crear uno nuevo', () => {
    getDetailComponent().then((cmp: any) => {
      expect(cmp.comments()).to.have.length(2);
      expect(cmp.comments()[0].text).to.equal(
        'Can still improve pressing intensity.'
      );
      expect(cmp.comments()[1].text).to.equal(
        'Excellent movement between lines.'
      );
    });

    cy.get('app-player-detail').then(($host) => {
      cy.window().then((win) => {
        const cmp = (win as any).ng.getComponent($host[0]);
        const createStub = cy.stub().resolves({
          id: 103,
          playerId: 1,
          userId: '1',
          author: 'TacticalGenius99 (ProGamer99)',
          text: 'Best player on the pitch tonight.',
          rating: 5,
          latitude: commentLocationCoords.lat,
          longitude: commentLocationCoords.lng,
        });
        const locationStub = cy.stub().resolves(commentLocationCoords);

        cmp.reviewService.createReview = createStub;
        cmp.locationService.requestDeviceCurrentPosition = locationStub;
        cmp.newCommentAuthor.set('TacticalGenius99');
        cmp.newCommentText.set('Best player on the pitch tonight.');
        cmp.newCommentRating.set(5);

        cy.wrap(createStub).as('createReviewStub');
        cy.wrap(locationStub).as('locationStub');

        if ((win as any).ng?.applyChanges) {
          (win as any).ng.applyChanges(cmp);
        }

        return cmp.addComment();
      });
    });

    cy.get('@locationStub').should('have.been.calledOnce');
    cy.get('@createReviewStub').should('have.been.calledOnce');

    getDetailComponent().then((cmp: any) => {
      expect(cmp.comments()[0].text).to.equal(
        'Best player on the pitch tonight.'
      );
      expect(cmp.comments()[0].author).to.equal(
        'TacticalGenius99 (ProGamer99)'
      );
    });
  });

  it('no envía un comentario si autor o texto están vacíos', () => {
    cy.get('app-player-detail').then(($host) => {
      cy.window().then((win) => {
        const cmp = (win as any).ng.getComponent($host[0]);
        const createStub = cy.stub().resolves({});

        cmp.reviewService.createReview = createStub;
        cmp.newCommentAuthor.set('');
        cmp.newCommentText.set('');
        cmp.newCommentRating.set(5);

        cy.wrap(createStub).as('createEmptyReviewStub');

        if ((win as any).ng?.applyChanges) {
          (win as any).ng.applyChanges(cmp);
        }

        return cmp.addComment();
      });
    });

    cy.get('@createEmptyReviewStub').should('not.have.been.called');
    getDetailComponent().then((cmp: any) => {
      expect(cmp.comments()).to.have.length(2);
    });
  });

  it('permite editar y cancelar una edición de comentario', () => {
    cy.get('app-player-detail').then(($host) => {
      cy.window().then((win) => {
        const cmp = (win as any).ng.getComponent($host[0]);
        const updateStub = cy.stub().resolves({
          ...reviewsFixture[0],
          text: 'Updated tactical note',
          rating: 3,
        });

        cmp.reviewService.updateReview = updateStub;
        cy.wrap(updateStub).as('updateReviewStub');

        cmp.editComment(cmp.comments()[1]);
        expect(cmp.comments()[1].isEditing).to.be.true;

        cmp.editTempText.set('Updated tactical note');
        cmp.editTempRating.set(3);
        cmp.cancelEditComment(cmp.comments()[1]);

        expect(cmp.comments()[1].isEditing).to.be.false;
        expect(cmp.comments()[1].text).to.equal(
          'Excellent movement between lines.'
        );

        cmp.editComment(cmp.comments()[1]);
        cmp.editTempText.set('Updated tactical note');
        cmp.editTempRating.set(3);

        if ((win as any).ng?.applyChanges) {
          (win as any).ng.applyChanges(cmp);
        }

        return cmp.saveComment(cmp.comments()[1]);
      });
    });

    cy.get('@updateReviewStub').should('have.been.calledOnce');
    getDetailComponent().then((cmp: any) => {
      expect(cmp.comments()[1].text).to.equal('Updated tactical note');
      expect(cmp.comments()[1].isEditing).to.be.false;
    });
  });

  it('permite borrar un comentario con confirmación y cancelar el modal', () => {
    cy.get('app-player-detail').then(($host) => {
      cy.window().then((win) => {
        const cmp = (win as any).ng.getComponent($host[0]);
        const deleteStub = cy.stub().resolves();

        cmp.reviewService.deleteReview = deleteStub;
        cy.wrap(deleteStub).as('deleteReviewStub');

        cmp.promptDeleteComment(101);
        expect(cmp.showDeleteCommentModal()).to.be.true;
        expect(cmp.commentToDeleteId()).to.equal(101);

        cmp.cancelDeleteComment();
        expect(cmp.showDeleteCommentModal()).to.be.false;
        expect(cmp.commentToDeleteId()).to.be.null;

        cmp.promptDeleteComment(101);

        if ((win as any).ng?.applyChanges) {
          (win as any).ng.applyChanges(cmp);
        }

        return cmp.confirmDeleteComment();
      });
    });

    cy.get('@deleteReviewStub').should('have.been.calledOnce');
    getDetailComponent().then((cmp: any) => {
      expect(cmp.comments()).to.have.length(1);
      expect(cmp.comments()[0].text).to.equal(
        'Can still improve pressing intensity.'
      );
      expect(cmp.showDeleteCommentModal()).to.be.false;
    });
  });

  describe('permisos de acceso', () => {
    it('permite crear comentarios a un usuario registrado pero oculta editar y eliminar', () => {
      setAuthOnCurrentView('app-player-detail', {
        isAuthenticated: true,
        isAdmin: false,
        isUser: true,
        profile: registeredProfile,
      });

      cy.contains('ion-button', 'Post Comment').should('exist');
      cy.get('app-player-detail .action-icon-btn.edit-color').should(
        'not.exist'
      );
      cy.get('app-player-detail .action-icon-btn.delete-color').should(
        'not.exist'
      );

      cy.get('app-player-detail').then(($host) => {
        cy.window().then((win) => {
          const cmp = (win as any).ng.getComponent($host[0]);
          const createStub = cy.stub().resolves({
            id: 103,
            playerId: 1,
            userId: '2',
            author: 'FanScout7 (FanScout7)',
            text: 'Registered users can still add useful notes.',
            rating: 4,
            latitude: commentLocationCoords.lat,
            longitude: commentLocationCoords.lng,
          });
          const locationStub = cy.stub().resolves(commentLocationCoords);

          cmp.reviewService.createReview = createStub;
          cmp.locationService.requestDeviceCurrentPosition = locationStub;
          cmp.newCommentAuthor.set('FanScout7');
          cmp.newCommentText.set(
            'Registered users can still add useful notes.'
          );
          cmp.newCommentRating.set(4);

          cy.wrap(createStub).as('registeredCreateReviewStub');
          cy.wrap(locationStub).as('registeredLocationStub');

          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(cmp);
          }

          return cmp.addComment();
        });
      });

      cy.get('@registeredLocationStub').should('have.been.calledOnce');
      cy.get('@registeredCreateReviewStub').should('have.been.calledOnce');

      getDetailComponent().then((cmp: any) => {
        expect(cmp.comments()[0].text).to.equal(
          'Registered users can still add useful notes.'
        );
        expect(cmp.comments()[0].author).to.equal('FanScout7 (FanScout7)');
        expect(cmp.comments()).to.have.length(3);
      });
    });

    it('permite ver y crear comentarios como usuario no registrado, pero oculta editar y eliminar', () => {
      setAuthOnCurrentView('app-player-detail', {
        isAuthenticated: false,
        isAdmin: false,
        isUser: false,
        profile: null,
      });

      cy.contains('ion-button', 'Post Comment').should('exist');
      cy.get('app-player-detail .action-icon-btn.edit-color').should(
        'not.exist'
      );
      cy.get('app-player-detail .action-icon-btn.delete-color').should(
        'not.exist'
      );

      cy.get('app-player-detail').then(($host) => {
        cy.window().then((win) => {
          const cmp = (win as any).ng.getComponent($host[0]);
          const createStub = cy.stub().resolves({
            id: 104,
            playerId: 1,
            userId: '1',
            author: 'GuestAnalyst (Anonymous)',
            text: 'Anonymous users can also leave public notes.',
            rating: 3,
            latitude: commentLocationCoords.lat,
            longitude: commentLocationCoords.lng,
          });
          const locationStub = cy.stub().resolves(commentLocationCoords);

          cmp.reviewService.createReview = createStub;
          cmp.locationService.requestDeviceCurrentPosition = locationStub;
          cmp.newCommentAuthor.set('GuestAnalyst');
          cmp.newCommentText.set(
            'Anonymous users can also leave public notes.'
          );
          cmp.newCommentRating.set(3);

          cy.wrap(createStub).as('guestCreateReviewStub');
          cy.wrap(locationStub).as('guestLocationStub');

          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(cmp);
          }

          return cmp.addComment();
        });
      });

      cy.get('@guestLocationStub').should('have.been.calledOnce');
      cy.get('@guestCreateReviewStub').should('have.been.calledOnce');

      getDetailComponent().then((cmp: any) => {
        expect(cmp.comments()[0].text).to.equal(
          'Anonymous users can also leave public notes.'
        );
        expect(cmp.comments()[0].author).to.equal('GuestAnalyst (Anonymous)');
        expect(cmp.comments()).to.have.length(3);
      });
    });
  });

  describe('errores de comentarios', () => {
    it('mantiene la lista vacía si falla la carga de comentarios', () => {
      cy.window().then((win) => {
        const errorStub = cy.stub(win.console, 'error').as('consoleErrorStub');

        cy.get('app-player-detail').then(($host) => {
          const cmp = (win as any).ng.getComponent($host[0]);
          const loadReviewsStub = cy
            .stub()
            .rejects(new Error('Load reviews failed'));

          cmp.reviewService.getReviewsByPlayer = loadReviewsStub;
          cmp.comments.set([]);

          cy.wrap(loadReviewsStub).as('loadReviewsErrorStub');

          return cmp.loadReviews(1);
        });

        cy.get('@loadReviewsErrorStub').should('have.been.calledOnce');
        cy.get('@consoleErrorStub').should('have.been.calledOnce');
      });

      getDetailComponent().then((cmp: any) => {
        expect(cmp.comments()).to.have.length(0);
      });
    });

    it('no agrega un comentario si falla la creación', () => {
      cy.get('app-player-detail').then(($host) => {
        cy.window().then((win) => {
          const cmp = (win as any).ng.getComponent($host[0]);
          const createStub = cy
            .stub()
            .rejects(new Error('Create review failed'));
          const locationStub = cy.stub().resolves(commentLocationCoords);
          const errorStub = cy
            .stub(win.console, 'error')
            .as('consoleErrorStub');

          cmp.reviewService.createReview = createStub;
          cmp.locationService.requestDeviceCurrentPosition = locationStub;
          cmp.newCommentAuthor.set('BrokenCreator');
          cmp.newCommentText.set('This comment will fail.');
          cmp.newCommentRating.set(4);

          cy.wrap(createStub).as('createErrorStub');
          cy.wrap(locationStub).as('createLocationStub');
          cy.wrap(errorStub).as('createConsoleErrorStub');

          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(cmp);
          }

          return cmp.addComment();
        });
      });

      cy.get('@createLocationStub').should('have.been.calledOnce');
      cy.get('@createErrorStub').should('have.been.calledOnce');
      cy.get('@createConsoleErrorStub').should('have.been.calledOnce');

      getDetailComponent().then((cmp: any) => {
        expect(cmp.comments()).to.have.length(2);
        expect(cmp.newCommentAuthor()).to.equal('BrokenCreator');
        expect(cmp.newCommentText()).to.equal('This comment will fail.');
      });
    });

    it('no guarda cambios si falla la edición de un comentario', () => {
      cy.get('app-player-detail').then(($host) => {
        cy.window().then((win) => {
          const cmp = (win as any).ng.getComponent($host[0]);
          const updateStub = cy
            .stub()
            .rejects(new Error('Update review failed'));
          const errorStub = cy
            .stub(win.console, 'error')
            .as('consoleErrorStub');

          cmp.reviewService.updateReview = updateStub;
          cy.wrap(updateStub).as('updateErrorStub');
          cy.wrap(errorStub).as('updateConsoleErrorStub');

          cmp.editComment(cmp.comments()[1]);
          cmp.editTempText.set('Edited but broken');
          cmp.editTempRating.set(2);

          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(cmp);
          }

          return cmp.saveComment(cmp.comments()[1]);
        });
      });

      cy.get('@updateErrorStub').should('have.been.calledOnce');
      cy.get('@updateConsoleErrorStub').should('have.been.calledOnce');

      getDetailComponent().then((cmp: any) => {
        expect(cmp.comments()[1].text).to.equal(
          'Excellent movement between lines.'
        );
        expect(cmp.comments()[1].isEditing).to.be.true;
      });
    });

    it('mantiene el modal abierto si falla el borrado de un comentario', () => {
      cy.get('app-player-detail').then(($host) => {
        cy.window().then((win) => {
          const cmp = (win as any).ng.getComponent($host[0]);
          const deleteStub = cy
            .stub()
            .rejects(new Error('Delete review failed'));
          const errorStub = cy
            .stub(win.console, 'error')
            .as('consoleErrorStub');

          cmp.reviewService.deleteReview = deleteStub;
          cy.wrap(deleteStub).as('deleteErrorStub');
          cy.wrap(errorStub).as('deleteConsoleErrorStub');

          cmp.promptDeleteComment(101);

          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(cmp);
          }

          return cmp.confirmDeleteComment();
        });
      });

      cy.get('@deleteErrorStub').should('have.been.calledOnce');
      cy.get('@deleteConsoleErrorStub').should('have.been.calledOnce');

      getDetailComponent().then((cmp: any) => {
        expect(cmp.comments()).to.have.length(2);
        expect(cmp.showDeleteCommentModal()).to.be.true;
        expect(cmp.commentToDeleteId()).to.equal(101);
      });
    });
  });

  describe('errores por estado inválido', () => {
    it('no intenta crear un comentario si no hay jugador activo', () => {
      cy.get('app-player-detail').then(($host) => {
        cy.window().then((win) => {
          const cmp = (win as any).ng.getComponent($host[0]);
          const createStub = cy.stub();
          const locationStub = cy.stub();

          cmp.player.set(null);
          cmp.reviewService.createReview = createStub;
          cmp.locationService.requestDeviceCurrentPosition = locationStub;
          cmp.newCommentAuthor.set('NoPlayerUser');
          cmp.newCommentText.set('This should not be sent.');
          cmp.newCommentRating.set(4);

          cy.wrap(createStub).as('noPlayerCreateStub');
          cy.wrap(locationStub).as('noPlayerLocationStub');

          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(cmp);
          }

          return cmp.addComment();
        });
      });

      cy.get('@noPlayerCreateStub').should('not.have.been.called');
      cy.get('@noPlayerLocationStub').should('not.have.been.called');

      getDetailComponent().then((cmp: any) => {
        expect(cmp.comments()).to.have.length(2);
        expect(cmp.newCommentAuthor()).to.equal('NoPlayerUser');
        expect(cmp.newCommentText()).to.equal('This should not be sent.');
      });
    });

    it('mantiene el comentario pendiente si falla la geolocalización al crear', () => {
      cy.get('app-player-detail').then(($host) => {
        cy.window().then((win) => {
          const cmp = (win as any).ng.getComponent($host[0]);
          const createStub = cy.stub();
          const locationStub = cy
            .stub()
            .rejects(new Error('Geolocation unavailable'));
          const errorStub = cy
            .stub(win.console, 'error')
            .as('consoleErrorStub');

          cmp.reviewService.createReview = createStub;
          cmp.locationService.requestDeviceCurrentPosition = locationStub;
          cmp.newCommentAuthor.set('GeoFailUser');
          cmp.newCommentText.set('This comment will fail before save.');
          cmp.newCommentRating.set(5);

          cy.wrap(createStub).as('geoCreateStub');
          cy.wrap(locationStub).as('geoLocationStub');
          cy.wrap(errorStub).as('geoConsoleErrorStub');

          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(cmp);
          }

          return cmp.addComment();
        });
      });

      cy.get('@geoLocationStub').should('have.been.calledOnce');
      cy.get('@geoCreateStub').should('not.have.been.called');
      cy.get('@geoConsoleErrorStub').should('have.been.calledOnce');

      getDetailComponent().then((cmp: any) => {
        expect(cmp.comments()).to.have.length(2);
        expect(cmp.newCommentAuthor()).to.equal('GeoFailUser');
        expect(cmp.newCommentText()).to.equal(
          'This comment will fail before save.'
        );
      });
    });

    it('no guarda cambios si el comentario a editar no tiene id', () => {
      cy.get('app-player-detail').then(($host) => {
        cy.window().then((win) => {
          const cmp = (win as any).ng.getComponent($host[0]);
          const updateStub = cy.stub();
          const draftComment = {
            ...cmp.comments()[1],
            id: null,
            isEditing: true,
          };

          cmp.reviewService.updateReview = updateStub;
          cmp.editTempText.set('Should not update without id');
          cmp.editTempRating.set(1);

          cy.wrap(updateStub).as('missingIdUpdateStub');

          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(cmp);
          }

          return cmp.saveComment(draftComment);
        });
      });

      cy.get('@missingIdUpdateStub').should('not.have.been.called');

      getDetailComponent().then((cmp: any) => {
        expect(cmp.comments()[1].text).to.equal(
          'Excellent movement between lines.'
        );
        expect(cmp.comments()[1].isEditing).to.be.undefined;
      });
    });

    it('no borra nada si se confirma sin un comentario seleccionado', () => {
      cy.get('app-player-detail').then(($host) => {
        cy.window().then((win) => {
          const cmp = (win as any).ng.getComponent($host[0]);
          const deleteStub = cy.stub();

          cmp.reviewService.deleteReview = deleteStub;
          cmp.showDeleteCommentModal.set(true);
          cmp.commentToDeleteId.set(null);

          cy.wrap(deleteStub).as('missingIdDeleteStub');

          if ((win as any).ng?.applyChanges) {
            (win as any).ng.applyChanges(cmp);
          }

          return cmp.confirmDeleteComment();
        });
      });

      cy.get('@missingIdDeleteStub').should('not.have.been.called');

      getDetailComponent().then((cmp: any) => {
        expect(cmp.comments()).to.have.length(2);
        expect(cmp.showDeleteCommentModal()).to.be.true;
        expect(cmp.commentToDeleteId()).to.be.null;
      });
    });
  });
});
