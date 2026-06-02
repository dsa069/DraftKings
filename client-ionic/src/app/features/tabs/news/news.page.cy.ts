import { signal, WritableSignal } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NewsPage } from './news.page';
import { NewsService } from '../../../core/services/abstract/news.service';
import { AuthService } from '../../../core/services/abstract/auth.service';
import { TeamService } from '../../../core/services/abstract/team.service';

describe('NewsPage - Component Testing', () => {
  // --- 1. SEÑALES REACTIVAS ---
  let mockIsAuthenticated: WritableSignal<boolean>;
  let mockIsLoading: WritableSignal<boolean>;

  // --- 2. STUBS ---
  let getNewsStub: sinon.SinonStub;
  let navNavigateForwardStub: sinon.SinonStub;
  let clearTeamStub: sinon.SinonStub;

  // Datos de prueba simulados
  const mockNewsData = [
    {
      id: '1',
      titulo: 'Lesión confirmada',
      fecha: '2023-10-20',
      interes: 'alta',
      jugador: 'Neymar Jr',
      etiquetas: ['Lesión', 'Baja'],
    },
    {
      id: '2',
      titulo: 'Renovación de contrato',
      fecha: '2023-10-21',
      interes: 'media',
      jugador: 'Pedri',
      etiquetas: ['Contrato', 'Finanzas'],
    },
    {
      id: '3',
      titulo: 'Cambio de dorsal',
      fecha: '2023-10-22',
      interes: 'baja',
      jugador: 'Gavi',
      etiquetas: ['Equipación'],
    },
  ];

  beforeEach(() => {
    // Inicializar el estado de las señales
    mockIsAuthenticated = signal(true);
    mockIsLoading = signal(false);

    // Crear y registrar stubs
    getNewsStub = cy.stub().resolves([]); // Por defecto resolvemos un array vacío
    navNavigateForwardStub = cy.stub();
    clearTeamStub = cy.stub().resolves();

    cy.wrap(getNewsStub).as('getNews');
    cy.wrap(navNavigateForwardStub).as('navigateForward');

    // Mocks de dependencias
    const mockAuthService = {
      isAuthenticated: mockIsAuthenticated,
    };

    const mockNewsService = {
      loading: mockIsLoading,
      getNews: getNewsStub,
    };

    const mockNavController = {
      navigateForward: navNavigateForwardStub,
      // En caso de que uses otro método de enrutamiento en onNewsItemClick,
      // lo agregamos genéricamente.
      navigateRoot: cy.stub(),
      navigateBack: cy.stub(),
    };

    const mockTeamService = {
      clearTeam: clearTeamStub,
    };

    // Montar el componente
    cy.mount(NewsPage, {
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: NewsService, useValue: mockNewsService },
        { provide: NavController, useValue: mockNavController },
        { provide: TeamService, useValue: mockTeamService },
      ],
    });
  });

  // =========================================================================
  // SECCIÓN A: SEGURIDAD Y CICLO DE VIDA
  // =========================================================================
  describe('Inicialización y Autenticación', () => {
    it('debe ejecutar getNews() al inicializarse', () => {
      // Verificamos que ngOnInit hizo la petición al backend
      cy.get('@getNews').should('have.been.calledOnce');
    });

    it('no debe mostrar el bloque principal si el usuario NO está autenticado', () => {
      mockIsAuthenticated.set(false);

      // La tarjeta que envuelve la lista y el título no debe existir
      cy.get('.news-card-content').should('not.exist');
    });
  });

  // =========================================================================
  // SECCIÓN B: ESTADOS DE CARGA Y VACÍO (EMPTY STATE)
  // =========================================================================
  describe('Estados de vista (Loading y Empty)', () => {
    it('debe mostrar el ion-spinner y ocultar la lista si isLoading() es true', () => {
      mockIsLoading.set(true);

      cy.get('ion-spinner')
        .should('be.visible')
        .and('have.attr', 'name', 'crescent');
      cy.get('ion-list.news-list').should('not.exist');
    });

    it('debe mostrar mensaje de "lista vacía" si el backend no devuelve noticias', () => {
      // Como el stub devuelve [] por defecto, probamos el bloque @empty
      mockIsLoading.set(false);

      cy.get('ion-list.news-list').should('exist');
      cy.get('ion-card.news-card').should('not.exist'); // Cero tarjetas

      // Asumiendo que el texto es un fallback del @empty block
      // Validamos que exista algún texto indicando que no hay data
      cy.get('ion-text').last().should('not.be.empty');
    });
  });

  // =========================================================================
  // SECCIÓN C: RENDERIZADO DE LA LISTA Y LÓGICA DE CLASES
  // =========================================================================
  describe('Renderizado de Tarjetas de Noticias', () => {
    beforeEach(() => {
      // Cambiamos el comportamiento del stub para devolver nuestros datos de prueba
      getNewsStub.resolves(mockNewsData);

      // Remontamos el componente para que el ngOnInit vuelva a ejecutarse con la data llena
      cy.mount(NewsPage, {
        providers: [
          {
            provide: AuthService,
            useValue: { isAuthenticated: mockIsAuthenticated },
          },
          {
            provide: NewsService,
            useValue: { loading: mockIsLoading, getNews: getNewsStub },
          },
          {
            provide: NavController,
            useValue: { navigateForward: navNavigateForwardStub },
          },
          {
            provide: TeamService,
            useValue: { clearTeam: clearTeamStub },
          },
        ],
      });
    });

    it('debe renderizar el número correcto de tarjetas', () => {
      cy.get('ion-card.news-card').should('have.length', mockNewsData.length);
    });

    it('debe aplicar la clase correcta y el texto "High Impact" para noticias de interés ALTA', () => {
      cy.get('ion-card.news-card')
        .eq(0)
        .should('have.class', 'high-impact') // ngClass validación
        .within(() => {
          cy.get('.card-title').should('contain.text', 'Lesión confirmada');
          cy.get('.badge-priority').should('contain.text', 'High Impact');
          cy.get('.player-name').should('contain.text', 'Neymar Jr');
          cy.get('.badge-tag').should('have.length', 2);
        });
    });

    it('debe aplicar la clase correcta y el texto "Medium" para noticias de interés MEDIA', () => {
      cy.get('ion-card.news-card')
        .eq(1)
        .should('have.class', 'medium-impact')
        .within(() => {
          cy.get('.badge-priority').should('contain.text', 'Medium');
        });
    });

    it('debe aplicar la clase correcta y el texto "Low Priority" para noticias de interés BAJA', () => {
      cy.get('ion-card.news-card')
        .eq(2)
        .should('have.class', 'low-priority')
        .within(() => {
          cy.get('.badge-priority').should('contain.text', 'Low Priority');
        });
    });
  });

  // =========================================================================
  // SECCIÓN D: INTERACCIONES DEL USUARIO
  // =========================================================================
  describe('Interacciones (Clics)', () => {
    beforeEach(() => {
      getNewsStub.resolves(mockNewsData);
      cy.mount(NewsPage, {
        providers: [
          {
            provide: AuthService,
            useValue: { isAuthenticated: mockIsAuthenticated },
          },
          {
            provide: NewsService,
            useValue: { loading: mockIsLoading, getNews: getNewsStub },
          },
          {
            provide: NavController,
            useValue: { navigateForward: navNavigateForwardStub },
          },
          {
            provide: TeamService,
            useValue: { clearTeam: clearTeamStub },
          },
        ],
      });
    });

    it('debe invocar onNewsItemClick y navegar al hacer clic en una tarjeta', () => {
      // Hacemos clic en la primera tarjeta (Neymar Jr, ID: '1')
      cy.get('ion-card.news-card').first().click({ force: true });

      // Dependiendo de cómo hayas implementado la navegación internamente,
      // podrías espiar el método directamente. Aquí asumimos que usas NavController.
      // Puedes ajustar esta aserción si usas Router de Angular directamente.
      cy.get('@navigateForward').should('have.been.called');
    });
  });
});
