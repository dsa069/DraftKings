import { signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlayersNewsPage } from './players-news.page';
import { NewsService } from '../../core/services/abstract/news.service';
import { AuthService } from '../../core/services/abstract/auth.service';

describe('PlayersNewsPage - Component Testing', () => {
  // Señales reactivas para controlar el estado del componente durante los tests
  let mockIsAuthenticated: WritableSignal<boolean>;
  let mockIsLoading: WritableSignal<boolean>;
  let mockSelectedNews: WritableSignal<any>;

  // Stubs para espiar llamadas a métodos
  let getNewsByIdStub: sinon.SinonStub;

  beforeEach(() => {
    // 1. Inicializamos las señales en su estado por defecto antes de cada test
    mockIsAuthenticated = signal(true); // Usuario autenticado por defecto
    mockIsLoading = signal(false); // Sin cargar por defecto
    mockSelectedNews = signal(null); // Sin noticia seleccionada

    // 2. Preparamos el Stub del servicio
    // 1. Creamos el stub puro de Sinon y le decimos que resuelva la promesa
    getNewsByIdStub = cy.stub().resolves();

    // 2. Registramos el alias en Cypress envolviendo el stub
    cy.wrap(getNewsByIdStub).as('getNewsById');

    // 3. Mocks de los Servicios
    const mockNewsService = {
      selectedNews: mockSelectedNews,
      loading: mockIsLoading,
      getNewsById: getNewsByIdStub,
    };

    const mockAuthService = {
      isAuthenticated: mockIsAuthenticated,
    };

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: cy.stub().returns('999'), // ID de noticia simulado en la ruta
        },
      },
    };

    // 4. Montamos el componente inyectando nuestros Mocks
    cy.mount(PlayersNewsPage, {
      providers: [
        { provide: NewsService, useValue: mockNewsService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });
  });

  // --- PRUEBAS DE CICLO DE VIDA Y ASINCRONÍA --- //

  it('debe inicializar e invocar getNewsById con el ID de la ruta', () => {
    // Verificamos que el ciclo de vida ngOnInit haya ejecutado la petición
    cy.get('@getNewsById').should('have.been.calledOnceWith', '999');
  });

  // --- PRUEBAS DE RENDERIZADO Y ESTADO DE LA INTERFAZ --- //

  it('no debe mostrar contenido si el usuario NO está autenticado', () => {
    // Cambiamos el estado de autenticación a falso
    mockIsAuthenticated.set(false);

    // Forzamos un ciclo de detección de cambios de Angular en Cypress
    cy.tick(0); // Opcional si la vista reacciona instantáneamente a la señal

    // Verificamos que no exista el spinner, ni la tarjeta, ni el mensaje de error
    cy.get('ion-spinner').should('not.exist');
    cy.get('ion-card.news-content').should('not.exist');
    cy.contains('No se pudo encontrar el detalle').should('not.exist');

    // Verificamos que el header independiente sí se renderice
    cy.get('app-header-submenu')
      .should('exist')
      .and('have.attr', 'title', 'Player Detail');
  });

  it('debe mostrar el ion-spinner mientras isLoading() sea true', () => {
    mockIsLoading.set(true);

    cy.get('ion-spinner')
      .should('be.visible')
      .and('have.attr', 'name', 'crescent')
      .and('have.attr', 'color', 'primary');

    cy.get('ion-card.news-content').should('not.exist');
  });

  it('debe mostrar mensaje de "No se pudo encontrar" si no hay datos', () => {
    mockIsLoading.set(false);
    mockSelectedNews.set(null); // Simulamos que el endpoint no devolvió nada

    cy.contains('No se pudo encontrar el detalle de esta noticia.').should(
      'be.visible'
    );
    cy.get('ion-card').should('not.exist');
  });

  // --- PRUEBAS DE FLUJO EXITOSO (RENDERIZADO DE NOTICIA) --- //

  it('debe renderizar correctamente los detalles de una noticia (Interés Alto)', () => {
    // Inyectamos datos de prueba en la señal de la noticia
    const mockData = {
      titulo: 'Nueva táctica de juego implementada',
      fecha: '2023-10-15',
      interes: 'alta',
      jugador: 'Lionel Messi',
      etiquetas: ['Táctica', 'Entrenamiento', 'Exclusiva'],
      descripcion: 'El equipo ha comenzado a implementar un esquema 4-3-3...',
    };
    mockSelectedNews.set(mockData);

    // Validamos el Titulo
    cy.get('.headline').should('contain.text', mockData.titulo);

    // Validamos la Fecha
    cy.contains('.meta-item', mockData.fecha).should('be.visible');
    cy.get('ion-icon[name="calendar-outline"]').should('exist');

    // Validamos la Lógica del Badge de Interés (Alta -> High Interest)
    cy.get('.interest-badge').should('contain.text', 'High Interest');

    // Validamos el Jugador Relacionado
    cy.contains('.meta-item', `Related to: ${mockData.jugador}`).should(
      'be.visible'
    );
    cy.get('ion-icon[name="person-outline"]').should('exist');

    // Validamos la iteración dinámica (@for) de las etiquetas
    cy.get('.tag-badge').should('have.length', mockData.etiquetas.length);
    mockData.etiquetas.forEach((tag, index) => {
      cy.get('.tag-badge').eq(index).should('contain.text', tag);
    });

    // Validamos el cuerpo/descripción de la noticia
    cy.get('.article-content').should('contain.text', mockData.descripcion);
  });

  // --- PRUEBAS DE LÓGICA DE PLANTILLA (TERNA RIOS DE INTERÉS) --- //

  it('debe mapear correctamente el interés "media" a "Medium Interest"', () => {
    mockSelectedNews.set({
      titulo: 'Noticia regular',
      interes: 'media',
    });
    cy.get('.interest-badge').should('contain.text', 'Medium Interest');
  });

  it('debe mapear correctamente cualquier otro interés a "Low Interest"', () => {
    mockSelectedNews.set({
      titulo: 'Noticia menor',
      interes: 'baja', // O cualquier otro valor que no sea alta/media
    });
    cy.get('.interest-badge').should('contain.text', 'Low Interest');
  });
});
