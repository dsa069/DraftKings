import { signal, WritableSignal } from '@angular/core';
import { Subject } from 'rxjs';
import { PlayersPage } from './players.page';
import { NavController } from '@ionic/angular';
import { PlayerService } from '../../../core/services/abstract/player.service';
import { AuthService } from '../../../core/services/abstract/auth.service';
import { TeamService } from '../../../core/services/abstract/team.service';
import { Player } from '../../../core/models/player.model';

describe('PlayersPage Component', () => {
  // 1. Mocks y Stubs de Servicios
  let navCtrlMock: Partial<NavController>;
  let playerServiceMock: Partial<PlayerService>;
  let authServiceMock: Partial<AuthService>;
  let teamServiceMock: Partial<TeamService>;

  // 2. Controladores de Reactividad y Asincronía
  let isAuthenticatedMock: WritableSignal<boolean>;
  let playerCreatedSub: Subject<any>;
  let playerUpdatedSub: Subject<any>;
  let playerDeletedSub: Subject<any>;

  // 3. Datos de prueba (Stubs)
  const mockPlayers: Player[] = [
    { id: '1', name: 'Lionel Messi', position: 'Forward' } as any,
    { id: '2', name: 'Emiliano Martinez', position: 'Goalkeeper' } as any,
  ];

  const mockUser = {
    uid: 'coach-10',
    email: 'scout@draftkings.com',
    role: 'USER',
  };

  beforeEach(() => {
    // Inicializamos el Signal reactivo que emula el estado de sesión
    isAuthenticatedMock = signal(false);

    // Inicializamos los Subjects para controlar las emisiones de RxJS
    playerCreatedSub = new Subject<any>();
    playerUpdatedSub = new Subject<any>();
    playerDeletedSub = new Subject<any>();

    // Mock del NavController de Ionic
    navCtrlMock = {
      navigateForward: cy.stub().resolves(true),
    };

    teamServiceMock = {
      clearTeam: cy.stub().resolves(),
    };

    // Mock de AuthService adaptado estrictamente a los miembros públicos de la clase abstracta
    authServiceMock = {
      isAuthenticated: (() => isAuthenticatedMock()) as any, // Envoltorio funcional para leer dinámicamente el WritableSignal
      userProfile: (() => mockUser) as any,
      isAdmin: (() => false) as any,
      isUser: (() => true) as any,
      getToken: cy.stub().resolves('mock-jwt-token'),
      logout: cy.stub().resolves(),
      deleteCurrentUser: cy.stub().resolves(),
    };

    // Mock del PlayerService
    playerServiceMock = {
      getPlayers: cy.stub().resolves(mockPlayers),
      playerCreated$: playerCreatedSub as any,
      playerUpdated$: playerUpdatedSub as any,
      playerDeleted$: playerDeletedSub as any,
    };
  });

  // Función para montar el componente usando la configuración global e inyectando los mocks locales
  const mountComponent = () => {
    cy.mount(PlayersPage, {
      providers: [
        { provide: NavController, useValue: navCtrlMock },
        { provide: PlayerService, useValue: playerServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: TeamService, useValue: teamServiceMock },
      ],
    }).then((mountResponse) => {
      // Guardamos la instancia real del componente bajo un alias para interactuar directamente si es necesario
      cy.wrap(mountResponse.component).as('componentInstance');
    });
  };

  describe('1. Ciclo de Vida: Estados de Carga y Error', () => {
    it('debe mostrar el Spinner de carga mientras la petición asíncrona está pendiente', () => {
      // Retrasamos artificialmente la promesa para capturar el estado intermedio en el template
      playerServiceMock.getPlayers = cy
        .stub()
        .callsFake(
          () => new Promise((resolve) => setTimeout(() => resolve([]), 500))
        );

      mountComponent();

      // Validaciones del renderizado condicional del Loading
      cy.get('ion-card.loading-container').should('exist');
      cy.get('ion-spinner[name="crescent"]').should('exist');
      cy.contains('ion-text', 'Loading Players...').should('exist');

      // La lista de jugadores no debe instanciarse en el DOM aún
      cy.get('app-player-list').should('not.exist');
    });

    it('debe capturar errores del servicio, ocultar el spinner y renderizar la nota de error de Ionic', () => {
      const errorMsg = 'Error de conexión con el servidor 500';
      playerServiceMock.getPlayers = cy.stub().rejects(new Error(errorMsg));
      cy.spy(console, 'error').as('consoleError');

      mountComponent();

      // Validamos la interacción reactiva con el template ante fallos de la API
      cy.get('ion-note.error-message')
        .should('exist')
        .and('have.attr', 'color', 'danger')
        .and('contain.text', errorMsg);

      cy.get('@consoleError').should('have.been.called');
      cy.get('ion-card.loading-container').should('not.exist');
    });
  });

  describe('2. Lógica de Mapeo de Datos (API Responses flexibles)', () => {
    it('debe mapear correctamente un arreglo directo de jugadores', () => {
      playerServiceMock.getPlayers = cy.stub().resolves(mockPlayers);
      mountComponent();

      cy.get('app-player-list').should('exist');
      cy.get('ion-note.error-message').should('not.exist');
    });

    it('debe mapear correctamente una respuesta estructurada en { data: [...] }', () => {
      playerServiceMock.getPlayers = cy.stub().resolves({ data: mockPlayers });
      mountComponent();

      cy.get('app-player-list').should('exist');
    });

    it('debe mapear correctamente una respuesta estructurada en { content: [...] } (Paginación Spring Boot)', () => {
      playerServiceMock.getPlayers = cy
        .stub()
        .resolves({ content: mockPlayers });
      mountComponent();

      cy.get('app-player-list').should('exist');
    });

    it('debe fallar de forma controlada si el formato no coincide mapeando el error de formato inválido', () => {
      playerServiceMock.getPlayers = cy
        .stub()
        .resolves({ payloadInvalido: 'bad data' });
      mountComponent();

      cy.get('ion-note.error-message').should(
        'contain.text',
        'Invalid API response format'
      );
    });
  });

  describe('3. Interacciones y Navegación de Rutas', () => {
    beforeEach(() => {
      mountComponent();
    });

    it('debe navegar al detalle del jugador cuando el componente hijo emite el evento playerClick', () => {
      cy.get('@componentInstance').then((instance: any) => {
        instance.goToPlayerDetail('player-99');
      });

      cy.wrap(navCtrlMock.navigateForward).should(
        'have.been.calledWith',
        '/player-detail/player-99'
      );
    });

    it('NO debe disparar la navegación si el identificador del jugador (playerId) es indefinido', () => {
      cy.get('@componentInstance').then((instance: any) => {
        instance.goToPlayerDetail(undefined);
      });

      cy.wrap(navCtrlMock.navigateForward).should('not.have.been.called');
    });
  });

  describe('4. UI Condicional de Autenticación (FAB Actions con AuthService)', () => {
    it('NO debe renderizar el botón flotante (ion-fab) ni sus acciones internas si el usuario es anónimo', () => {
      isAuthenticatedMock.set(false); // Estado desautenticado
      mountComponent();

      cy.get('ion-fab').should('not.exist');
    });

    it('debe renderizar el botón FAB y las opciones de administración si el usuario está autenticado', () => {
      isAuthenticatedMock.set(true); // Estado autenticado
      mountComponent();

      cy.get('ion-fab').should('exist');

      // Validamos el botón extendido "Add Player"
      cy.get('ion-button.extended-fab-btn')
        .eq(0)
        .within(() => {
          cy.get('ion-icon').should('have.attr', 'name', 'add');
          cy.get('.fab-text').should('contain.text', 'Add Player');
        });

      // Validamos el botón extendido "Import Players"
      cy.get('ion-button.import-btn').within(() => {
        cy.get('ion-icon').should(
          'have.attr',
          'name',
          'cloud-download-outline'
        );
        cy.get('.fab-text').should('contain.text', 'Import Players');
      });
    });

    it('debe quitar el foco (blur) del botón y navegar a /new-player al pulsar sobre agregar jugador', () => {
      isAuthenticatedMock.set(true);
      mountComponent();

      cy.contains('ion-button', 'Add Player').click();
      cy.wrap(navCtrlMock.navigateForward).should(
        'have.been.calledOnceWith',
        '/new-player'
      );
    });

    it('debe quitar el foco (blur) del botón y navegar a /import-players al pulsar sobre importar', () => {
      isAuthenticatedMock.set(true);
      mountComponent();

      cy.contains('ion-button', 'Import Players').click();
      cy.wrap(navCtrlMock.navigateForward).should(
        'have.been.calledOnceWith',
        '/import-players'
      );
    });
  });

  describe('5. Reactividad a Flujos Asíncronos Externos (RxJS Streams)', () => {
    beforeEach(() => {
      playerServiceMock.getPlayers = cy.stub().resolves(mockPlayers);
      mountComponent();
      // Reseteamos el historial para aislar las ejecuciones nativas iniciales (ngOnInit) de las provocadas por RxJS
      cy.wrap(playerServiceMock.getPlayers).invoke('resetHistory');
    });

    it('debe refrescar la grilla llamando a la API (loadPlayers) cuando se emite un evento playerCreated$', () => {
      playerCreatedSub.next(null);
      cy.wrap(playerServiceMock.getPlayers).should('have.been.calledOnce');
    });

    it('debe refrescar la grilla llamando a la API (loadPlayers) cuando se emite un evento playerUpdated$', () => {
      playerUpdatedSub.next(null);
      cy.wrap(playerServiceMock.getPlayers).should('have.been.calledOnce');
    });

    it('debe refrescar la grilla llamando a la API (loadPlayers) cuando se emite un evento playerDeleted$', () => {
      playerDeletedSub.next(null);
      cy.wrap(playerServiceMock.getPlayers).should('have.been.calledOnce');
    });
  });
});
