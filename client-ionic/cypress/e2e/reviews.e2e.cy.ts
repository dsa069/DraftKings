import {
  clickIonButton,
  clearIonInput,
  openAccordion,
  typeIntoIonInput,
  visitApp,
} from '../support/e2e-helpers';
import { adminProfile, signedInResponse } from './utils/data/user.data-test';
import { playerDetail } from './utils/data/player.data-test';
import { reviewsFixture } from './utils/data/review.data-test';

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
  });

  it('muestra comentarios existentes y permite crear uno nuevo', () => {
    // Escenario happy path: abrir la sección de comentarios, ver el listado y añadir una nota nueva.
    openAccordion('Manager Comments');

    cy.contains('Excellent movement between lines.').should('be.visible');
    cy.contains('Can still improve pressing intensity.').should('be.visible');

    cy.intercept('POST', '**/players/1/reviews', (req) => {
      expect(req.body).to.include({
        author: 'TacticalGenius99 (ProGamer99)',
        text: 'Best player on the pitch tonight.',
        rating: 5,
        userId: '1',
      });

      req.reply({
        statusCode: 201,
        body: {
          id: 103,
          playerId: 1,
          userId: '1',
          author: 'TacticalGenius99 (ProGamer99)',
          text: 'Best player on the pitch tonight.',
          rating: 5,
          latitude: 40.4168,
          longitude: -3.7038,
        },
      });
    }).as('createReview');

    typeIntoIonInput(
      'ion-input[placeholder="TacticalGenius99"]',
      'TacticalGenius99'
    );
    typeIntoIonInput(
      'ion-textarea[placeholder="Write your analysis..."]',
      'Best player on the pitch tonight.'
    );
    clickIonButton('Post Comment');

    cy.wait('@createReview');
    cy.contains('TacticalGenius99 (ProGamer99)').should('be.visible');
    cy.contains('Best player on the pitch tonight.').should('be.visible');
  });

  it('no envía un comentario si autor o texto están vacíos', () => {
    // Escenario sad path: el componente corta la ejecución antes de llamar al backend.
    let createReviewCalled = false;
    cy.intercept('POST', '**/players/1/reviews', (req) => {
      createReviewCalled = true;
      req.reply({
        statusCode: 201,
        body: {},
      });
    }).as('createReview');

    openAccordion('Manager Comments');
    clickIonButton('Post Comment');

    cy.then(() => {
      expect(createReviewCalled).to.equal(false);
    });
    cy.contains('Excellent movement between lines.').should('be.visible');
  });

  it('permite editar y cancelar una edición de comentario', () => {
    // Escenario happy path + cancel: editar un comentario y luego revertirlo sin persistir cambios.
    let updateReviewCalled = false;
    cy.intercept('PUT', '**/reviews/101', (req) => {
      updateReviewCalled = true;
      expect(req.body).to.include({
        text: 'Updated tactical note',
        rating: 3,
      });

      req.reply({
        statusCode: 200,
        body: {
          ...reviewsFixture[0],
          text: 'Updated tactical note',
          rating: 3,
        },
      });
    }).as('updateReview');

    openAccordion('Manager Comments');

    cy.contains('.comment-item', 'Excellent movement between lines.')
      .find('ion-button.action-icon-btn.edit-color')
      .click({ force: true });

    cy.contains('ion-button', 'Save').should('be.visible');
    clearIonInput('ion-textarea.form-input');
    typeIntoIonInput('ion-textarea.form-input', 'Updated tactical note');
    clickIonButton('Cancel');

    cy.contains('Updated tactical note').should('not.exist');
    cy.contains('Excellent movement between lines.').should('be.visible');

    cy.contains('.comment-item', 'Excellent movement between lines.')
      .find('ion-button.action-icon-btn.edit-color')
      .click({ force: true });
    clearIonInput('ion-textarea.form-input');
    typeIntoIonInput('ion-textarea.form-input', 'Updated tactical note');
    cy.get('.confirm-edit-btn').click({ force: true });

    cy.wait('@updateReview');
    cy.then(() => {
      expect(updateReviewCalled).to.equal(true);
    });
    cy.contains('Updated tactical note').should('be.visible');
  });

  it('permite borrar un comentario con confirmación y cancelar el modal', () => {
    // Escenario sad path + happy path: el modal protege el borrado y luego confirma la eliminación.
    let deleteReviewCalled = false;
    cy.intercept('DELETE', '**/reviews/101', (req) => {
      deleteReviewCalled = true;
      req.reply({
        statusCode: 204,
        body: {},
      });
    }).as('deleteReview');

    openAccordion('Manager Comments');

    cy.contains('.comment-item', 'Excellent movement between lines.')
      .find('ion-button.action-icon-btn.delete-color')
      .click({ force: true });

    cy.contains('Delete Comment?').should('be.visible');
    cy.contains('ion-button', 'Cancel').click({ force: true });
    cy.contains('Delete Comment?').should('not.exist');

    cy.contains('.comment-item', 'Excellent movement between lines.')
      .find('ion-button.action-icon-btn.delete-color')
      .click({ force: true });
    cy.contains('ion-button', 'Delete').click({ force: true });

    cy.wait('@deleteReview');
    cy.then(() => {
      expect(deleteReviewCalled).to.equal(true);
    });
    cy.contains('Excellent movement between lines.').should('not.exist');
  });
});
