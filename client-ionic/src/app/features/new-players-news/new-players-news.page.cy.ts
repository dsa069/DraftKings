import { signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { NewPlayersNewsPage } from './new-players-news.page';
import { NewsService } from '../../core/services/abstract/news.service';
import { AuthService } from '../../core/services/abstract/auth.service';

describe('NewPlayersNewsPage - Component Testing', () => {
  // --- 1. SEÑALES Y SUJETOS REACTIVOS ---
  let mockIsAuthenticated: WritableSignal<boolean>;
  let mockIsAdmin: WritableSignal<boolean>;
  let mockIsLoading: WritableSignal<boolean>;
  let queryParamsSubject: BehaviorSubject<any>;

  // --- 2. STUBS ---
  let createNewsStub: sinon.SinonStub;
  let navBackStub: sinon.SinonStub;
  let toastCreateStub: sinon.SinonStub;
  let toastPresentStub: sinon.SinonStub;

  beforeEach(() => {
    // Inicializar señales por defecto (Usuario Autenticado y Administrador)
    mockIsAuthenticated = signal(true);
    mockIsAdmin = signal(true);
    mockIsLoading = signal(false);
    queryParamsSubject = new BehaviorSubject({}); // Sin parámetros por defecto

    // Crear stubs limpios
    createNewsStub = cy.stub().resolves();
    navBackStub = cy.stub();
    toastPresentStub = cy.stub().resolves();
    // toastController.create debe devolver un objeto con el método present()
    toastCreateStub = cy.stub().resolves({ present: toastPresentStub });

    cy.wrap(createNewsStub).as('createNews');
    cy.wrap(navBackStub).as('navBack');
    cy.wrap(toastCreateStub).as('toastCreate');
    cy.wrap(toastPresentStub).as('toastPresent');

    // --- 3. MOCKS DE SERVICIOS ---
    const mockAuthService = {
      isAuthenticated: mockIsAuthenticated,
      isAdmin: mockIsAdmin,
    };

    const mockNewsService = {
      loading: mockIsLoading,
      createNews: createNewsStub,
    };

    const mockActivatedRoute = {
      queryParams: queryParamsSubject.asObservable(),
    };

    const mockNavController = {
      back: navBackStub,
    };

    const mockToastController = {
      create: toastCreateStub,
    };

    // --- 4. MONTAR EL COMPONENTE ---
    cy.mount(NewPlayersNewsPage, {
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: NewsService, useValue: mockNewsService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: NavController, useValue: mockNavController },
        { provide: ToastController, useValue: mockToastController },
      ],
    }).then((wrapper) => {
      cy.wrap(wrapper.component).as('componentInstance');
    });
  });

  // =========================================================================
  // SECCIÓN A: SEGURIDAD Y RENDERIZADO CONDICIONAL
  // =========================================================================
  describe('Renderizado y Autenticación', () => {
    it('debe mostrar el formulario solo si el usuario está autenticado y es ADMIN', () => {
      cy.get('form').should('exist');
      cy.get('.header-title').should('contain.text', 'Create News');
    });

    it('no debe mostrar el lienzo principal si el usuario NO está autenticado', () => {
      mockIsAuthenticated.set(false);
      cy.get('.main-canvas').should('not.exist');
    });

    it('no debe mostrar el lienzo principal si el usuario autenticado NO es Admin', () => {
      mockIsAdmin.set(false);
      cy.get('.main-canvas').should('not.exist');
    });
  });

  // =========================================================================
  // SECCIÓN B: RECEPCIÓN DE PARÁMETROS (LINKED PLAYER)
  // =========================================================================
  describe('Lógica de Linked Player (QueryParams)', () => {
    it('debe mostrar input manual si no hay datos del jugador en la ruta', () => {
      cy.get('ion-input[name="jugador"]').should('exist');
      cy.get('.player-card').should('not.exist');
    });

    it('debe inicializar playerData y mostrar tarjeta si vienen queryParams', () => {
      // Emitimos nuevos parámetros como si la URL hubiera cambiado
      queryParamsSubject.next({
        nombre: 'Erling Haaland',
        posicion: 'Delantero',
      });

      cy.get('@componentInstance').then((instance: any) => {
        expect(instance.playerData).to.deep.include({
          name: 'Erling Haaland',
          position: 'Delantero',
        });
        expect(instance.formData.jugador).to.equal('Erling Haaland');
      });
    });

    it('debe limpiar el jugador vinculado al hacer clic en el botón cerrar', () => {
      cy.get('@componentInstance').then((instance: any) => {
        instance.playerData = {
          name: 'Jude Bellingham',
          position: 'Mediocampista',
          photoUrl: 'https://example.com/jude.jpg',
        };
        instance.formData.jugador = 'Jude Bellingham';
        instance.removeLinkedPlayer();
      });

      cy.get('.player-card').should('not.exist');
      cy.get('ion-input[name="jugador"]').should('exist');
    });
  });

  // =========================================================================
  // SECCIÓN C: LÓGICA DE ETIQUETAS (TAGS)
  // =========================================================================
  describe('Gestión de Etiquetas (Tags)', () => {
    it('debe agregar una etiqueta, añadir el prefijo "#" y quitar espacios', () => {
      cy.get('@componentInstance').then((instance: any) => {
        instance.currentTag = '  tactica nueva  ';
        instance.addTag();
        expect(instance.formData.etiquetas).to.deep.equal(['#tacticanueva']);
      });
    });

    it('debe permitir añadir hasta un máximo de 6 etiquetas y deshabilitar el input', () => {
      const tags = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete'];

      // Intentamos añadir 7 etiquetas
      cy.get('@componentInstance').then((instance: any) => {
        tags.forEach((tag) => {
          instance.currentTag = tag;
          instance.addTag();
        });

        expect(instance.formData.etiquetas).to.have.length(6);
        expect(instance.formData.etiquetas).to.deep.equal([
          '#uno',
          '#dos',
          '#tres',
          '#cuatro',
          '#cinco',
          '#seis',
        ]);
      });

      // El input de tag debería estar deshabilitado
      cy.get('ion-input[name="currentTag"]').should('have.attr', 'disabled');
    });

    it('debe eliminar una etiqueta al hacer clic en ella', () => {
      cy.get('@componentInstance').then((instance: any) => {
        instance.currentTag = 'Lesión';
        instance.addTag();
      });
      cy.get('.custom-chip').should('have.length', 1);

      // Clic en el chip para borrarlo
      cy.get('.custom-chip').click({ force: true });
      cy.get('.custom-chip').should('not.exist');
    });
  });

  // =========================================================================
  // SECCIÓN D: VALIDACIONES DEL FORMULARIO Y SUBMIT
  // =========================================================================
  describe('Validaciones y Envío del Formulario', () => {
    it('debe mostrar Toast de error si el nombre del jugador es muy corto (< 2)', () => {
      // Dejamos todo vacío y disparamos Submit
      cy.get('@componentInstance').then((instance: any) => {
        instance.formData.jugador = 'A';
        return instance.onSubmit();
      });

      cy.get('@toastCreate').should(
        'have.been.calledWithMatch',
        Cypress.sinon.match({
          message: 'Player name must be between 2 and 50 characters long.',
        })
      );
      cy.get('@toastPresent').should('have.been.called');
      cy.get('@createNews').should('not.have.been.called');
    });

    it('debe mostrar Toast de error si falta agregar etiquetas', () => {
      // Rellenamos el resto pero sin etiquetas
      cy.get('@componentInstance').then((instance: any) => {
        instance.formData.jugador = 'Leo Messi';
        instance.formData.titulo = 'Titulo válido';
        instance.formData.descripcion =
          'Esto es una descripción de prueba lo suficientemente larga.';
        return instance.onSubmit();
      });

      cy.get('@toastCreate').should(
        'have.been.calledWithMatch',
        Cypress.sinon.match({
          message: 'You must include between 1 and 6 tags.',
        })
      );
    });

    it('debe enviar el formulario correctamente, transformar la fecha y navegar atrás', () => {
      // Rellenar formulario válido
      cy.get('@componentInstance').then((instance: any) => {
        instance.formData.jugador = 'Leo Messi';
        instance.formData.interes = 'alta';
        instance.formData.titulo = 'Noticia Importante';
        instance.formData.descripcion =
          'Esta descripción es válida porque tiene más de veinte caracteres.';
        instance.currentTag = 'exclusiva';
        instance.addTag();
        return instance.onSubmit();
      });

      // Validar que se llamó al servicio con los datos bien mapeados
      cy.get('@createNews')
        .should('have.been.calledOnce')
        .then((spy: any) => {
          const payload = spy.args[0][0];
          expect(payload.jugador).to.equal('Leo Messi');
          expect(payload.interes).to.equal('alta');
          expect(payload.titulo).to.equal('Noticia Importante');
          expect(payload.etiquetas).to.deep.equal(['#exclusiva']);
          // La fecha debe venir convertida de YYYY-MM-DD a DD/MM/YYYY
          expect(payload.fecha).to.match(/^\d{2}\/\d{2}\/\d{4}$/);
        });

      // Validar navegación
      cy.get('@navBack').should('have.been.calledOnce');
    });

    it('debe mostrar Toast de error del servidor si la petición falla (catch block)', () => {
      // Simulamos que el backend falla
      createNewsStub.rejects(new Error('Backend Timeout'));

      // Rellenar formulario válido mínimo
      cy.get('@componentInstance').then((instance: any) => {
        instance.formData.jugador = 'Jugador X';
        instance.formData.titulo = 'Titulo de test';
        instance.formData.descripcion =
          'Texto descriptivo muy largo para que pase la validación.';
        instance.currentTag = 'tag';
        instance.addTag();
        return instance.onSubmit();
      });

      // Debería capturar el error y mostrar el Toast genérico
      cy.get('@toastCreate').should(
        'have.been.calledWithMatch',
        Cypress.sinon.match({
          message: 'Hubo un error en el servidor al publicar la noticia.',
        })
      );
      cy.get('@navBack').should('not.have.been.called');
    });
  });

  // =========================================================================
  // SECCIÓN E: ESTADO DE CARGA (LOADING)
  // =========================================================================
  describe('Estado Visual de Carga (Loading)', () => {
    it('debe deshabilitar el botón y mostrar spinner si isLoading() es true', () => {
      mockIsLoading.set(true);

      cy.get('ion-button.submit-btn').should('have.attr', 'disabled');
      cy.get('ion-button.submit-btn ion-spinner').should('exist');
      cy.get('ion-button.submit-btn ion-label').should('not.exist');
    });
  });
});
