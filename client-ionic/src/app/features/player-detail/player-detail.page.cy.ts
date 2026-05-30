import { PlayerDetailPage } from './player-detail.page';
import { PlayerService } from '../../core/services/abstract/player.service';
import { ReviewService } from '../../core/services/abstract/review.service';
import { LocationService } from '../../core/services/location.service';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../core/services/abstract/auth.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('PlayerDetailPage Component - Test Suite Exhaustivo', () => {
  // 1. Declaración de Mocks
  let playerServiceMock: Partial<PlayerService>;
  let reviewServiceMock: Partial<ReviewService>;
  let locationServiceMock: Partial<LocationService>;
  let navCtrlMock: Partial<NavController>;
  let authServiceMock: Partial<AuthService>;

  // 2. Datos de Prueba
  const mockPlayer = {
    id: '1',
    name: 'Lionel Messi',
    position: 'Forward',
    photoUrl: 'https://example.com/messi.jpg',
  };

  const mockReviews = [
    {
      id: '101',
      text: 'Excelente jugador',
      rating: 5,
      playerId: '1',
      isEditing: false,
    },
    {
      id: '102',
      text: 'Muy buen regate',
      rating: 4,
      playerId: '1',
      isEditing: false,
    },
  ];

  beforeEach(() => {
    // Mock de Navegación
    navCtrlMock = {
      navigateRoot: cy.stub().resolves(true),
      navigateForward: cy.stub().resolves(true),
      back: cy.stub(),
    };

    // Mock del Servicio de Jugadores (Por defecto resuelve con éxito)
    playerServiceMock = {
      getPlayerById: cy.stub().resolves(mockPlayer),
      deletePlayer: cy.stub().resolves(),
    };

    // Mock del Servicio de Reseñas
    reviewServiceMock = {
      getReviewsByPlayer: cy.stub().resolves([...mockReviews]), // Pasamos clon para aislar mutaciones
      deleteReview: cy.stub().resolves(),
      createReview: cy.stub().resolves(),
      updateReview: cy.stub().resolves(),
    };

    locationServiceMock = {};
    authServiceMock = {
      isAuthenticated: (() => true) as any,
      isAdmin: (() => true) as any,
      userProfile: (() => ({ userName: 'Coach' })) as any,
    };
  });

  // 3. Función Helper de Montaje Dinámico
  const mountComponent = (routeId: string | null = '1') => {
    cy.mount(PlayerDetailPage, {
      imports: [BrowserAnimationsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: cy.stub().returns(routeId) } },
          },
        },
        { provide: NavController, useValue: navCtrlMock },
        { provide: PlayerService, useValue: playerServiceMock },
        { provide: ReviewService, useValue: reviewServiceMock },
        { provide: LocationService, useValue: locationServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).then((wrapper) => {
      // Exponemos la instancia para evaluar Signals en la lógica interna
      cy.wrap(wrapper.component).as('componentInstance');
    });
  };

  describe('1. Renderizado Condicional y Estados (Loading, Error, Success)', () => {
    it('debe mostrar el estado de carga (Spinner) mientras resuelve la promesa del jugador', () => {
      // Retrasamos intencionalmente la promesa para capturar el estado visual de carga
      let resolvePromise: Function;
      playerServiceMock.getPlayerById = cy.stub().returns(
        new Cypress.Promise((resolve) => {
          resolvePromise = resolve;
        })
      );

      mountComponent('1');

      // Verificamos el bloque @if (isLoading()) del HTML
      cy.get('ion-spinner[name="crescent"]').should('be.visible');
      cy.get('ion-text').should('contain.text', 'Loading Player Details...');

      // Resolvemos para limpiar
      cy.then(() => resolvePromise(mockPlayer));
    });

    it('debe mostrar un mensaje de error si el servicio falla o no devuelve datos', () => {
      playerServiceMock.getPlayerById = cy
        .stub()
        .rejects(new Error('Network Error'));

      // Montamos y espiamos que el componente maneje la excepción
      mountComponent('1');

      // Verificamos el bloque @else if (errorMessage())
      cy.get('.error-message').should('exist').and('be.visible');
    });

    it('debe renderizar el jugador correctamente al resolver la petición exitosamente', () => {
      mountComponent('1');

      // Verifica el componente hijo
      cy.get('app-header-submenu').should('exist');

      // Verifica la renderización del jugador (bloque @else if (player()))
      cy.get('.hero-card').should('exist');
      cy.get('.badge-position').should('contain.text', 'Forward');
      // Verificamos el texto exacto que tienes en tu HTML actual: '4,5 STARTS'
      cy.get('.badge-rating').should('contain.text', '4,5 STARTS');
    });
  });

  describe('2. Flujo Asíncrono: Eliminación del Jugador (Modal & API)', () => {
    beforeEach(() => mountComponent('1'));

    it('debe abrir el modal de borrado de jugador, poder cancelarlo y asegurar que no hay borrado', () => {
      cy.get('@componentInstance').then((instance: any) => {
        instance.onDeletePlayer();
      });

      // El modal de Ionic debe existir y renderizar el texto de confirmación
      cy.get('ion-modal.custom-modal').should('exist');
      cy.contains('h2', 'Delete Player?').should('be.visible');

      // Hacemos click en "Cancel"
      cy.contains('ion-button', 'Cancel').click({ force: true });

      // Verificamos que se cerró (el signal debería ser falso)
      cy.get('@componentInstance').then((instance: any) => {
        expect(instance.showConfirmModal()).to.be.false;
      });
      cy.wrap(playerServiceMock.deletePlayer).should('not.have.been.called');
    });

    it('debe confirmar la eliminación del jugador, llamar al servicio y cerrar el modal', () => {
      cy.get('@componentInstance').then((instance: any) => {
        instance.player.set(mockPlayer);
        instance.onDeletePlayer();
        return instance.confirmDeletePlayer();
      });

      cy.then(() => {
        cy.wrap(playerServiceMock.deletePlayer).should('have.been.calledOnce');
        cy.get('@componentInstance').then((instance: any) => {
          expect(instance.showConfirmModal()).to.be.false;
        });
      });
    });
  });

  describe('3. Sección de Comentarios (Reviews) y Sistema de Rating', () => {
    beforeEach(() => mountComponent('1'));

    it('debe actualizar reactivamente el signal de rating al hacer clic en las estrellas', () => {
      cy.get('@componentInstance').then((instance: any) => {
        // Creamos un Mock del evento del clic para probar que detiene la propagación (stopPropagation)
        const mockEvent = { stopPropagation: cy.stub() } as any;

        // 1. Asignamos 4 estrellas
        instance.updateNewRating(mockEvent, 4);
        expect(instance.newCommentRating()).to.equal(4);
        expect(mockEvent.stopPropagation).to.have.been.calledOnce;

        // 2. Si el usuario presiona sobre la MISMA estrella, el valor debe resetearse a 0
        instance.updateNewRating(mockEvent, 4);
        expect(instance.newCommentRating()).to.equal(0);
      });
    });

    it('debe eliminar un comentario de la base de datos y filtrar reactivamente el Array local (Signals)', () => {
      cy.get('@componentInstance').then((instance: any) => {
        // Sobreescribimos el estado local de comentarios con los mocks iniciales
        instance.comments.set([...mockReviews]);

        // 1. Desencadenamos el prompt de borrado para el review '101'
        instance.promptDeleteComment('101');

        // Verificamos que las signals internas estén listas para borrar
        expect(instance.showDeleteCommentModal()).to.be.true;
        expect(instance.commentToDeleteId()).to.equal('101');

        return instance.confirmDeleteComment();
      });

      // Promesa resuelta
      cy.then(() => {
        // Verifica que llamó al backend para borrar el '101'
        cy.wrap(reviewServiceMock.deleteReview).should(
          'have.been.calledOnceWith',
          '101'
        );

        cy.get('@componentInstance').then((instance: any) => {
          // Verifica la limpieza de estado
          expect(instance.showDeleteCommentModal()).to.be.false;
          expect(instance.commentToDeleteId()).to.be.null;

          // CRÍTICO: Verifica que se removió visual y lógicamente el comentario del Signal
          const remainingComments = instance.comments();
          expect(remainingComments.length).to.equal(1);
          expect(remainingComments[0].id).to.equal('102');
        });
      });
    });
  });
});
