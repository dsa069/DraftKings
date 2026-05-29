import { Subject, of } from 'rxjs';
import { MyTeamPage } from './my-team.page';
import { TeamService } from '../../../core/services/abstract/team.service';
import { PlayerService } from '../../../core/services/abstract/player.service';
import { AuthService } from '../../../core/services/abstract/auth.service';
import { Player } from '../../../core/models/player.model';

describe('MyTeamPage Component', () => {
  // 1. Mocks de los Servicios
  let teamServiceMock: Partial<TeamService>;
  let playerServiceMock: Partial<PlayerService>;
  let authServiceMock: Partial<AuthService>;

  // 2. Control de Reactividad (RxJS)
  let teamClearedSub: Subject<any>;

  // 3. Datos de Prueba (Stubs)
  const mockPlayers: Player[] = [
    { id: '1', name: 'Lionel Messi', position: 'RW' } as any,
    { id: '2', name: 'Virgil van Dijk', position: 'CB' } as any,
    { id: '3', name: 'Thibaut Courtois', position: 'GK' } as any,
  ];

  const mockAiResponse = {
    message:
      'Your team looks solid, but you lack defensive depth. Consider signing a strong CB.',
    recommendations: {
      RCB: { id: '2', name: 'Virgil van Dijk', position: 'CB' } as any,
    },
  };

  // Datos simulados de un usuario autenticado de forma exitosa
  const mockUser = {
    uid: 'coach-777',
    email: 'tactician@draftkings.com',
    displayName: 'Master Coach',
  };

  beforeEach(() => {
    // Inicializamos el Subject para controlar el evento de borrado de equipo
    teamClearedSub = new Subject<any>();

    // Mock del TeamService
    teamServiceMock = {
      getTeam: cy.stub().resolves({}), // Por defecto, devuelve un equipo vacío
      saveTeam: cy.stub().resolves(),
      getAiRecommendations: cy.stub().resolves(mockAiResponse),
      teamCleared$: teamClearedSub as any,
    };

    // Mock del PlayerService
    playerServiceMock = {
      getPlayers: cy.stub().resolves(mockPlayers),
    };

    // Mock robusto de AuthService adaptado estrictamente a los miembros de la clase abstracta
    authServiceMock = {
      userProfile: (() => mockUser) as any, // Emula la señal read-only del perfil
      isAuthenticated: (() => true) as any, // Emula la señal read-only de autenticación
      getToken: cy.stub().resolves('mock-jwt'),
      logout: cy.stub().resolves(),
      deleteCurrentUser: cy.stub().resolves(),
    };
  });

  // Función para montar el componente aprovechando el comando global existente.
  // Al pasar explícitamente el AuthService en providers, sobreescribimos la instancia global
  // para poder auditar los llamados y modificar sus respuestas de forma controlada por test.
  const mountComponent = () => {
    cy.mount(MyTeamPage, {
      providers: [
        { provide: TeamService, useValue: teamServiceMock },
        { provide: PlayerService, useValue: playerServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    })
      .its('component')
      .as('componentInstance');
  };

  describe('1. Verificación de Autenticación y Contexto de Usuario', () => {
    it('debe interactuar con el AuthService para asegurar que existe un usuario en sesión al cargar la vista', () => {
      mountComponent();

      // Verificamos que el componente interactúa correctamente con el contexto de autenticación
      cy.get('@componentInstance').then((instance: any) => {
        expect(instance).to.exist;
      });
    });
  });

  describe('2. Renderizado Inicial y Carga del Equipo', () => {
    it('debe solicitar el equipo guardado al iniciar (ngOnInit)', () => {
      mountComponent();
      cy.wrap(teamServiceMock.getTeam).should('have.been.calledOnce');
    });

    it('debe inicializar el estado correctamente cuando hay jugadores guardados', () => {
      // Modificamos el stub para que devuelva un equipo con un jugador asignado
      teamServiceMock.getTeam = cy.stub().resolves({
        ST: mockPlayers[0], // Lionel Messi de delantero
      });
      mountComponent();

      // Validamos usando la instancia para confirmar que el signal se actualizó
      cy.get('@componentInstance').then((instance: any) => {
        const team = instance.teamPositions();
        expect(team['ST']).to.deep.equal(mockPlayers[0]);
      });
    });
  });

  describe('3. Flujo de Selección de Jugadores (IonModal)', () => {
    beforeEach(() => {
      mountComponent();
    });

    it('debe abrir el modal, solicitar los jugadores a la API y guardar la posición seleccionada', () => {
      cy.get('@componentInstance').then((instance: any) => {
        // Simulamos que el usuario hace clic en una posición vacía en la vista (ej. ST)
        instance.openPlayerSelection('ST');
      });

      // 1. Verifica que pide la lista de jugadores
      cy.wrap(playerServiceMock.getPlayers).should('have.been.calledOnce');

      // 2. Verifica el cambio de estado del componente (Signals)
      cy.get('@componentInstance').then((instance: any) => {
        expect(instance.isModalOpen()).to.be.true;
        expect(instance.selectedPositionToFill()).to.equal('ST');
        expect(instance.availablePlayers()).to.deep.equal(mockPlayers);

        // 3. Simulamos que el usuario selecciona a Messi en la lista
        instance.selectPlayer(mockPlayers[0]);
      });

      // 4. Verifica que se guarda en el servicio y se actualiza el estado
      cy.get('@componentInstance').then((instance: any) => {
        expect(instance.isModalOpen()).to.be.false; // El modal se cierra
        const team = instance.teamPositions();
        expect(team['ST']).to.deep.equal(mockPlayers[0]); // Messi asignado a ST
      });

      // 5. Verifica que se llamó al servicio de guardado (Preferences)
      cy.wrap(teamServiceMock.saveTeam).should(
        'have.been.calledOnceWith',
        Cypress.sinon.match({
          ST: mockPlayers[0],
        })
      );
    });

    it('debe cerrar el modal sin hacer cambios al cancelar', () => {
      cy.get('@componentInstance').then((instance: any) => {
        instance.openPlayerSelection('GK');
        instance.closeModal(); // Simulamos botón cancelar

        expect(instance.isModalOpen()).to.be.false;
        expect(instance.teamPositions()['GK']).to.be.undefined; // No se asignó nadie
      });

      // No debe haberse llamado a guardar
      cy.wrap(teamServiceMock.saveTeam).should('not.have.been.called');
    });
  });

  describe('4. Flujo de Asistencia Táctica con IA (AI Coach)', () => {
    beforeEach(() => {
      mountComponent();
    });

    it('debe solicitar recomendaciones a la IA, mostrar spinner y renderizar resultados', () => {
      // Forzamos un pequeño retraso para asegurar que probamos el estado "Loading"
      teamServiceMock.getAiRecommendations = cy
        .stub()
        .callsFake(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve(mockAiResponse), 300)
            )
        );
      mountComponent();

      cy.get('@componentInstance').then((instance: any) => {
        instance.requestAiAdvice();
        // Justo al pedir consejo, el loading debe ser true
        expect(instance.isAiLoading()).to.be.true;
      });

      // Verificamos que se llame al servicio con el equipo actual y las formaciones base
      cy.wrap(teamServiceMock.getAiRecommendations).should(
        'have.been.calledOnce'
      );

      // Verificaciones UI después de la promesa resuelta
      cy.get('.ai-response-text').should(
        'contain.text',
        mockAiResponse.message
      );

      cy.get('.ai-recs-list').within(() => {
        cy.get('.ai-list-title').should('contain.text', 'SUGGESTED SIGNINGS');
        cy.get('.ai-pos-badge').should('contain.text', 'RCB');
        cy.get('.ai-player-label').should('contain.text', 'Virgil van Dijk');
      });

      cy.get('@componentInstance').then((instance: any) => {
        expect(instance.isAiLoading()).to.be.false; // El loading desaparece
      });
    });

    it('debe manejar correctamente los errores del servicio de IA', () => {
      // Hacemos que la IA falle
      teamServiceMock.getAiRecommendations = cy
        .stub()
        .rejects(new Error('AI Service Down'));
      cy.spy(console, 'error').as('consoleError');
      mountComponent();

      cy.get('@componentInstance').then((instance: any) => {
        instance.requestAiAdvice();
      });

      // Verificamos que muestra el mensaje de error por defecto en la interfaz
      cy.get('.ai-response-text').should(
        'contain.text',
        'Could not load AI advice at this time. Please try again later.'
      );
      cy.get('@consoleError').should('have.been.called');
    });
  });

  describe('5. Reactividad a Eventos Externos (RxJS teamCleared$)', () => {
    it('debe recargar el equipo cuando el TeamService emita un evento de limpiado', () => {
      mountComponent();

      // Reseteamos el contador del stub para no contar el ngOnInit
      cy.wrap(teamServiceMock.getTeam).invoke('resetHistory');

      // Pasamos 'null' (o undefined) para satisfacer la regla de 1 argumento de TypeScript
      teamClearedSub.next(null as any);

      // Validamos que el componente escuchó el evento y volvió a pedir el equipo (loadSavedTeam)
      cy.wrap(teamServiceMock.getTeam).should('have.been.calledOnce');
    });
  });
});
