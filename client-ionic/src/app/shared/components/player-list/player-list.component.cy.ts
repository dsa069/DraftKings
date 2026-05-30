import { PlayerListComponent } from './player-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Player } from '../../../core/models/player.model';

describe('PlayerListComponent - Test Suite Exhaustivo', () => {
  // 1. Datos Mock (Cubriendo diferentes fechas y atributos para probar el filtrado)
  const mockPlayers: Player[] = [
    {
      id: '1',
      name: 'Lionel Messi',
      firstName: 'Lionel',
      lastName: 'Messi',
      team: 'Inter Miami',
      league: 'MLS',
      position: 'Forward',
      photoUrl: 'https://img.com/messi.jpg',
      birthdate: '1987-06-24',
      latitude: 25.7617, // Coordenada añadida
      longitude: -80.1918, // Coordenada añadida
    },
    {
      id: '2',
      name: 'Cristiano Ronaldo',
      firstName: 'Cristiano',
      lastName: 'Ronaldo',
      team: 'Al Nassr',
      league: 'Saudi Pro League',
      position: 'Forward',
      photoUrl: '',
      created_at: '2023-01-15T10:00:00Z',
      latitude: 24.7136, // Coordenada añadida
      longitude: 46.6753, // Coordenada añadida
    },
    {
      id: '3',
      name: 'Kevin De Bruyne',
      firstName: 'Kevin',
      lastName: 'De Bruyne',
      team: 'Man City',
      league: 'Premier League',
      position: 'Midfielder',
      createdAt: '2021-08-20T10:00:00Z',
      latitude: 53.4808, // Coordenada añadida
      longitude: -2.2426, // Coordenada añadida
    },
  ];

  // 2. Helper de montaje dinámico
  const mountComponent = (props?: Partial<PlayerListComponent>) => {
    return cy
      .mount(PlayerListComponent, {
        imports: [BrowserAnimationsModule],
        componentProperties: {
          players: mockPlayers, // Input default
          ...props,
        },
      })
      .then((wrapper) => {
        // Espiamos todos los emisores de eventos
        cy.spy(wrapper.component.playerClick, 'emit').as('playerClickSpy');
        cy.spy(wrapper.component.importSelected, 'emit').as(
          'importSelectedSpy'
        );
        cy.spy(wrapper.component.searchChange, 'emit').as('searchChangeSpy');
        cy.spy(wrapper.component.playerSelectedComplete, 'emit').as(
          'playerCompleteSpy'
        );

        cy.wrap(wrapper.component).as('componentInstance');
      });
  };

  describe('1. Renderizado Inicial y Estados Base', () => {
    it('debe renderizar el contenedor principal, la barra de búsqueda y el botón de filtros', () => {
      mountComponent();
      cy.get('.main-container').should('exist');
      cy.get('.search-input').should('exist');
      cy.get('.filter-button').should('exist');
    });

    it('debe mostrar el estado de carga (Spinner) si loading es true y ocultar la lista si es necesario', () => {
      // Nota: Según tu HTML, el spinner convive con la lista, pero validamos que se muestre.
      mountComponent({ loading: true });
      cy.get('.loading-wrapper ion-spinner').should('be.visible');
      cy.get('.loading-wrapper p').should('contain.text', 'Processing data...');
    });

    it('debe mostrar el mensaje de "No players found" si se pasa un array vacío', () => {
      mountComponent({ players: [] });
      cy.get('.no-results-message').should('be.visible');
      cy.get('ion-list.player-list').should('not.exist');
    });

    it('debe renderizar correctamente los jugadores en modo "view" (Predeterminado)', () => {
      mountComponent();
      cy.get('.player-card').should('have.length', 3);

      // Verificar Avatar personalizado vs Placeholder
      cy.get('.player-card')
        .eq(0)
        .find('ion-img')
        .invoke('prop', 'src')
        .should('include', 'https://img.com/messi.jpg');
      cy.get('.player-card')
        .eq(1)
        .find('ion-img')
        .invoke('prop', 'src')
        .should(
          'include',
          'https://ionicframework.com/docs/img/demos/avatar.svg'
        );

      // Verificar que se renderizan las estrellas de rating (exclusivas del modo view)
      cy.get('.player-rating').should('have.length', 3);

      // En modo 'view', no debe haber checkboxes
      cy.get('.import-checkbox-icon').should('not.exist');
    });
  });

  describe('2. Buscador y Filtros (Lógica de Signals Computadas)', () => {
    beforeEach(() => mountComponent());

    it('debe filtrar la lista por nombre al escribir en el buscador y emitir el evento', () => {
      // Disparamos el evento ionChange simulando que el usuario escribe
      cy.get('.search-input').trigger('ionChange', {
        detail: { value: 'Ronaldo' },
      });

      // Verificamos el DOM
      cy.get('.player-card').should('have.length', 1);
      cy.get('.player-name').should('contain.text', 'Cristiano Ronaldo');

      // Verificamos el Output
      cy.get('@searchChangeSpy').should('have.been.calledWith', 'Ronaldo');

      // Verificamos que aparece el botón de limpiar y funciona
      cy.get('ion-button[slot="end"]')
        .find('ion-icon[name="close-outline"]')
        .click({ force: true });
      cy.get('.player-card').should('have.length', 3);
      cy.get('@searchChangeSpy').should('have.been.calledWith', ''); // Emitió vacío al limpiar
    });

    it('debe desplegar el panel de filtros y poblar dinámicamente los equipos y ligas únicos', () => {
      // Hacemos click en el botón de filtros
      cy.get('.filter-button').click();
      cy.get('.filters-panel').should('be.visible');

      // Verificamos que generó los arrays únicos en las Signals computadas
      cy.get('@componentInstance').then((instance: any) => {
        expect(instance.uniqueTeams()).to.deep.equal([
          'Al Nassr',
          'Inter Miami',
          'Man City',
        ]);
        expect(instance.uniqueLeagues()).to.deep.equal([
          'MLS',
          'Premier League',
          'Saudi Pro League',
        ]);
      });
    });

    it('debe aplicar filtros combinados (Equipo + Fecha) y mostrar el punto notificador de filtros activos', () => {
      // Abrimos panel
      cy.get('.filter-button').click();

      // Simulamos seleccionar equipo usando el evento nativo del ion-select
      cy.get('ion-select[placeholder="Select Team"]').trigger('ionChange', {
        detail: { value: 'Man City' },
      });

      cy.get('.player-name').contains('Kevin De Bruyne').should('exist');

      // El punto notificador (dot) debe aparecer en el botón principal
      cy.get('.filter-notification-dot').should('exist');

      // Comprobamos la lógica robusta de isDateInRange()
      // KDB fue creado el 2021-08-20. Si filtramos desde 2022-01-01, debería desaparecer.
      cy.get('@componentInstance').then((instance: any) => {
        instance.onDateChange({ detail: { value: '2022-01-01T00:00:00Z' } });
      });

      // No debería incluir a KDB porque su createdAt es anterior al filtro.
      cy.get('.no-results-message').should('be.visible');

      // Al limpiar la fecha, KDB vuelve a aparecer (porque sigue el filtro de equipo)
      cy.get('.date-picker-item')
        .parent()
        .parent()
        .find('.filter-clear-icon-btn')
        .click();
      cy.get('.player-card').should('have.length', 1);
    });
  });

  describe('3. Modo "View": Interacciones Básicas', () => {
    it('debe emitir los eventos de selección de jugador al hacer click en su tarjeta', () => {
      mountComponent({ mode: 'view' });

      // Clic en la tarjeta de Messi
      cy.get('.player-card').eq(0).click();

      // Emite el ID al output simple
      cy.get('@playerClickSpy').should('have.been.calledWith', '1');
      // Emite el objeto completo al output especializado
      cy.get('@playerCompleteSpy').should(
        'have.been.calledWith',
        mockPlayers[0]
      );
    });
  });

  describe('4. Modo "Import": Selección Múltiple y Botón de Acción', () => {
    beforeEach(() => mountComponent({ mode: 'import' }));

    it('debe renderizar la vista de importación (Checkboxes y Sin estrellas)', () => {
      cy.get('.import-checkbox-icon').should('have.length', 3);
      cy.get('.player-rating').should('not.exist');

      // Botón de importación no existe si no hay selecciones
      cy.get('.import-action-container').should('not.exist');
    });

    it('debe permitir seleccionar/deseleccionar múltiples jugadores y emitir el listado al confirmar', () => {
      // 1. Clic en Messi
      cy.get('.player-card').eq(0).click();

      // Verifica cambio visual (color y nombre del icono)
      cy.get('.player-card')
        .eq(0)
        .find('.import-checkbox-icon')
        .should('have.attr', 'name', 'checkbox')
        .and('have.class', 'ion-color-success');

      // Aparece el botón inferior con el contador (1)
      cy.get('.import-submit-btn').should(
        'contain.text',
        'Import Selected (1)'
      );

      // 2. Clic en Ronaldo
      cy.get('.player-card').eq(1).click();
      cy.get('.import-submit-btn').should(
        'contain.text',
        'Import Selected (2)'
      );

      // 3. Deseleccionar Messi (Clic de nuevo)
      cy.get('.player-card').eq(0).click();
      cy.get('.import-submit-btn').should(
        'contain.text',
        'Import Selected (1)'
      );

      // 4. Confirmar Importación (Clic en el botón de Importar)
      cy.get('.import-submit-btn').click();

      // Verifica el Output con el array de jugadores
      cy.get('@importSelectedSpy').should((spy: any) => {
        expect(spy).to.be.calledOnce;
        const emittedArray = spy.getCall(0).args[0];
        expect(emittedArray.length).to.equal(1);
        expect(emittedArray[0].name).to.equal('Cristiano Ronaldo');
      });
    });

    it('debe mantener la selección en el Map interno incluso si el jugador es ocultado por los filtros', () => {
      // Seleccionamos a Messi
      cy.get('.player-card').eq(0).click();

      // Filtramos para que solo quede Ronaldo
      cy.get('.search-input').trigger('ionChange', {
        detail: { value: 'Ronaldo' },
      });
      cy.get('.player-card').should('have.length', 1);

      // Verificamos que el botón de importar SIGUE mostrando (1) seleccionado,
      // validando la independencia entre visualización (filteredPlayers) y estado de selección (selectedPlayers)
      cy.get('.import-submit-btn').should(
        'contain.text',
        'Import Selected (1)'
      );
    });
  });
});
