import { signal, WritableSignal } from '@angular/core';
import { Subject } from 'rxjs';
import { PlayersPage } from './players.page';
import { NavController } from '@ionic/angular';
import { PlayerService } from '../../../core/services/abstract/player.service';
import { AuthService } from '../../../core/services/abstract/auth.service';
import { Player } from '../../../core/models/player.model';

describe('PlayersPage Component', () => {
  // 1. Mocks y Stubs
  let navCtrlMock: Partial<NavController>;
  let playerServiceMock: Partial<PlayerService>;
  let authServiceMock: Partial<AuthService>;

  // 2. Controladores de Reactividad y Asincronía
  let isAuthenticatedMock: WritableSignal<boolean>;
  let playerCreatedSub: Subject<any>;
  let playerUpdatedSub: Subject<any>;
  let playerDeletedSub: Subject<any>;

  // Datos de prueba
  const mockPlayers: Player[] = [
    { id: '1', name: 'Lionel Messi', position: 'Forward' } as any,
    { id: '2', name: 'Emiliano Martinez', position: 'Goalkeeper' } as any,
  ];

  beforeEach(() => {
    // Inicializamos el Signal de Auth
    isAuthenticatedMock = signal(false);

    // Inicializamos los Subjects para controlar las emisiones de RxJS en los tests
    playerCreatedSub = new Subject<any>();
    playerUpdatedSub = new Subject<any>();
    playerDeletedSub = new Subject<any>();

    // Mock del NavController
    navCtrlMock = {
      navigateForward: cy.stub().resolves(true),
    };

    // Mock del AuthService
    authServiceMock = {
      isAuthenticated: isAuthenticatedMock as any,
    };

    // Mock del PlayerService
    playerServiceMock = {
      getPlayers: cy.stub().resolves(mockPlayers), // Por defecto retorna éxito
      playerCreated$: playerCreatedSub as any,
      playerUpdated$: playerUpdatedSub as any,
      playerDeleted$: playerDeletedSub as any,
    };
  });

  const mountComponent = () => {
    cy.mount(PlayersPage, {
      providers: [
        { provide: NavController, useValue: navCtrlMock },
        { provide: PlayerService, useValue: playerServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).then((mountResponse) => {
      // Guardamos la instancia del componente en un alias de Cypress
      cy.wrap(mountResponse.component).as('componentInstance');
    });
  };

  describe('Ciclo de Vida: Estados de Carga y Error', () => {
    it('debe mostrar el Spinner de carga mientras la petición asíncrona está pendiente', () => {
      // Retrasamos artificialmente la respuesta para capturar el UI de "Cargando"
      playerServiceMock.getPlayers = cy
        .stub()
        .callsFake(
          () => new Promise((resolve) => setTimeout(() => resolve([]), 500))
        );

      mountComponent();

      // Validamos el estado Loading
      cy.get('.loading-container').should('exist');
      cy.get('ion-spinner[name="crescent"]').should('exist');
      cy.contains('ion-text', 'Loading Players...').should('exist');

      // La lista no debe existir aún
      cy.get('app-player-list').should('not.exist');
    });

    it('debe capturar errores, ocultar el spinner y mostrar un mensaje de error en pantalla', () => {
      const errorMsg = 'Error de conexión con el servidor 500';
      playerServiceMock.getPlayers = cy.stub().rejects(new Error(errorMsg));
      // Espiamos el console.error para no llenar la consola del test innecesariamente, pero verificando que se usó
      cy.spy(console, 'error').as('consoleError');

      mountComponent();

      // Validamos que el UI muestre la nota de error de Ionic
      cy.get('ion-note.error-message')
        .should('exist')
        .and('have.attr', 'color', 'danger')
        .and('contain.text', errorMsg);

      cy.get('@consoleError').should('have.been.called');
      cy.get('.loading-container').should('not.exist'); // Spinner oculto
    });
  });

  describe('Lógica de Mapeo de Datos (API Responses flexibles)', () => {
    it('debe mapear correctamente un arreglo directo de jugadores', () => {
      playerServiceMock.getPlayers = cy.stub().resolves(mockPlayers);
      mountComponent();

      // Debería pasar la data al componente hijo <app-player-list>
      cy.get('app-player-list').should('exist');
      cy.get('.error-message').should('not.exist');
    });

    it('debe mapear correctamente una respuesta envuelta en { data: [...] }', () => {
      // Simulamos que el backend responde con objeto paginado/envuelto
      playerServiceMock.getPlayers = cy.stub().resolves({ data: mockPlayers });
      mountComponent();

      cy.get('app-player-list').should('exist');
    });

    it('debe mapear correctamente una respuesta envuelta en { content: [...] } (Ej: Spring Boot Pagination)', () => {
      playerServiceMock.getPlayers = cy
        .stub()
        .resolves({ content: mockPlayers });
      mountComponent();

      cy.get('app-player-list').should('exist');
    });

    it('debe fallar si el formato no coincide y mostrar error de formato inválido', () => {
      // Le pasamos un objeto sin las propiedades reconocidas (data, content, results, players)
      playerServiceMock.getPlayers = cy
        .stub()
        .resolves({ unknownProp: 'bad data' });
      mountComponent();

      cy.get('ion-note.error-message').should(
        'contain.text',
        'Invalid API response format'
      );
    });
  });

  describe('Interacciones y Navegación', () => {
    beforeEach(() => {
      mountComponent();
    });

    describe('Interacciones y Navegación', () => {
      beforeEach(() => {
        mountComponent();
      });

      it('debe navegar al detalle del jugador cuando el componente hijo emite el evento playerClick', () => {
        // Usamos el alias '@componentInstance' que creamos en mountComponent() para acceder a la instancia real
        cy.get('@componentInstance').then((instance: any) => {
          instance.goToPlayerDetail('player-99');
        });

        cy.wrap(navCtrlMock.navigateForward).should(
          'have.been.calledWith',
          '/player-detail/player-99'
        );
      });

      it('NO debe navegar si el playerId es indefinido', () => {
        cy.get('@componentInstance').then((instance: any) => {
          instance.goToPlayerDetail(undefined);
        });

        cy.wrap(navCtrlMock.navigateForward).should('not.have.been.called');
      });
    });

    it('NO debe navegar si el playerId es indefinido', () => {
      // Usamos el alias '@componentInstance' igual que en el test anterior
      cy.get('@componentInstance').then((instance: any) => {
        instance.goToPlayerDetail(undefined);
      });

      cy.wrap(navCtrlMock.navigateForward).should('not.have.been.called');
    });
  });

  describe('UI Condicional de Autenticación (FAB Actions)', () => {
    it('NO debe mostrar los botones flotantes de acción (FAB) si el usuario es anónimo', () => {
      isAuthenticatedMock.set(false);
      mountComponent();

      cy.get('ion-fab').should('not.exist');
    });

    it('debe mostrar el botón FAB extendido de agregar y de importar si el usuario está autenticado', () => {
      isAuthenticatedMock.set(true);
      mountComponent();

      cy.get('ion-fab').should('exist');

      // Validamos Botón "Add Player"
      cy.get('ion-button.extended-fab-btn')
        .eq(0)
        .within(() => {
          cy.get('ion-icon').should('have.attr', 'name', 'add');
          cy.get('.fab-text').should('contain.text', 'Add Player');
        });

      // Validamos Botón "Import Players"
      cy.get('ion-button.import-btn').within(() => {
        cy.get('ion-icon').should(
          'have.attr',
          'name',
          'cloud-download-outline'
        );
        cy.get('.fab-text').should('contain.text', 'Import Players');
      });
    });

    it('debe navegar correctamente a /new-player al hacer clic en Add Player', () => {
      isAuthenticatedMock.set(true);
      mountComponent();

      cy.contains('ion-button', 'Add Player').click();
      cy.wrap(navCtrlMock.navigateForward).should(
        'have.been.calledOnceWith',
        '/new-player'
      );
    });

    it('debe navegar correctamente a /import-players al hacer clic en Import Players', () => {
      isAuthenticatedMock.set(true);
      mountComponent();

      cy.contains('ion-button', 'Import Players').click();
      cy.wrap(navCtrlMock.navigateForward).should(
        'have.been.calledOnceWith',
        '/import-players'
      );
    });
  });

  describe('Reactividad y Observables (RxJS Streams)', () => {
    beforeEach(() => {
      // Hacemos que getPlayers responda de inmediato
      playerServiceMock.getPlayers = cy.stub().resolves(mockPlayers);
      mountComponent();
      // Limpiamos el contador de llamadas generado por ngOnInit / ionViewWillEnter
      cy.wrap(playerServiceMock.getPlayers).invoke('resetHistory');
    });

    it('debe volver a llamar a la API (loadPlayers) cuando se emite un evento playerCreated$', () => {
      // Pasamos 'null' para satisfacer el requerimiento de 1 argumento de Subject<any>
      playerCreatedSub.next(null);

      // Validamos que el componente reaccionó solicitando de nuevo los datos
      cy.wrap(playerServiceMock.getPlayers).should('have.been.calledOnce');
    });

    it('debe volver a llamar a la API (loadPlayers) cuando se emite un evento playerUpdated$', () => {
      playerUpdatedSub.next(null);
      cy.wrap(playerServiceMock.getPlayers).should('have.been.calledOnce');
    });

    it('debe volver a llamar a la API (loadPlayers) cuando se emite un evento playerDeleted$', () => {
      playerDeletedSub.next(null);
      cy.wrap(playerServiceMock.getPlayers).should('have.been.calledOnce');
    });
  });
});
