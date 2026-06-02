import { ImportPlayersPage } from './import-players.page';
import { AuthService } from '../../core/services/abstract/auth.service';
import { PlayerService } from '../../core/services/abstract/player.service';
import { LocationService } from '../../core/services/location.service';
import { NavController } from '@ionic/angular';
import { Player } from '../../core/models/player.model';

describe('ImportPlayersPage Component - Test Suite Exhaustivo', () => {
  // 1. Mocks y Stubs
  let playerServiceMock: any;
  let locationServiceMock: any;
  let navCtrlMock: Partial<NavController>;
  let authServiceMock: any;

  // 2. Datos de Prueba
  const mockExternalPlayers: Player[] = [
    { id: '101', name: 'Haaland', position: 'ST' } as any,
    { id: '102', name: 'De Bruyne', position: 'CM' } as any,
  ];

  beforeEach(() => {
    // NavController Mock
    navCtrlMock = {
      navigateBack: cy.stub().resolves(true),
    };

    // PlayerService Mock
    playerServiceMock = {
      getExternalApiPlayers: cy.stub().resolves(mockExternalPlayers),
      importPlayers: cy.stub().resolves(),
    };

    // LocationService Mock
    locationServiceMock = {
      requestDeviceCurrentPosition: cy
        .stub()
        .resolves({ lat: 40.4167, lng: -3.7032 }), // Coordenadas de Madrid
    };

    authServiceMock = {
      isAuthenticated: () => true,
      isAdmin: () => false,
      isUser: () => true,
      userProfile: () => null,
      getToken: cy.stub().resolves('mock-jwt-token'),
    };
  });

  // 3. Función de Montaje
  const mountComponent = () => {
    cy.mount(ImportPlayersPage, {
      providers: [
        { provide: NavController, useValue: navCtrlMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: PlayerService, useValue: playerServiceMock },
        { provide: LocationService, useValue: locationServiceMock },
      ],
    }).then((wrapper) => {
      cy.wrap(wrapper.component).as('componentInstance');
    });
  };

  describe('1. Inicialización y Renderizado', () => {
    it('debe cargar los jugadores externos al inicializar (ngOnInit)', () => {
      mountComponent();

      // Verificamos que se llamó a la API sin parámetros
      cy.wrap(playerServiceMock.getExternalApiPlayers).should(
        'have.been.calledOnce'
      );
      cy.wrap(playerServiceMock.getExternalApiPlayers)
        .its('firstCall.args')
        .should('deep.equal', [undefined]);

      // Verificamos que el signal interno se llenó con los datos
      cy.get('@componentInstance').then((instance: any) => {
        expect(instance.externalPlayers()).to.deep.equal(mockExternalPlayers);
        expect(instance.isLoading()).to.be.false;
      });

      // Validamos que el componente hijo exista
      cy.get('app-player-list').should('exist');
    });

    it('debe mostrar un mensaje de error si la carga inicial falla', () => {
      // Forzamos un error en la carga
      playerServiceMock.getExternalApiPlayers = cy
        .stub()
        .rejects(new Error('Network Error'));
      mountComponent();

      cy.get('ion-note.error-box')
        .should('be.visible')
        .and('contain.text', 'Could not load data from API Football.');

      // El componente de lista no debe estar visible si hay un error (según tu @if @else)
      cy.get('app-player-list').should('not.exist');
    });
  });

  describe('2. Búsqueda y Filtrado (onSearchChange)', () => {
    beforeEach(() => {
      mountComponent();
      cy.wrap(playerServiceMock.getExternalApiPlayers).invoke('resetHistory'); // Limpiamos el contador del ngOnInit
    });

    it('debe llamar a la API si la longitud de la query es de 3 o más caracteres', () => {
      cy.get('@componentInstance').invoke('onSearchChange', 'Mes');
      cy.wrap(playerServiceMock.getExternalApiPlayers).should(
        'have.been.calledOnceWith',
        'Mes'
      );
    });

    it('NO debe llamar a la API si la longitud de la query es de 1 o 2 caracteres', () => {
      cy.get('@componentInstance').invoke('onSearchChange', 'Me');
      cy.wrap(playerServiceMock.getExternalApiPlayers).should(
        'not.have.been.called'
      );
    });

    it('debe recargar la lista completa si el texto de búsqueda se borra', () => {
      cy.get('@componentInstance').invoke('onSearchChange', '');
      cy.wrap(playerServiceMock.getExternalApiPlayers).should(
        'have.been.calledOnceWithExactly',
        undefined
      );
    });
  });

  describe('3. Flujo Asíncrono de Importación y GPS', () => {
    beforeEach(() => {
      // Congelamos el tiempo de Cypress para controlar el setTimeout de 1500ms
      cy.clock();
      mountComponent();
    });

    it('debe obtener la ubicación, inyectarla en los jugadores, importar, mostrar toast y navegar', () => {
      const selectedPlayers = [{ id: '101', name: 'Haaland', position: 'ST' }];

      // Simulamos la emisión del @Output (importSelected) desde el hijo
      cy.get('@componentInstance').invoke('handleImport', selectedPlayers);

      cy.then(() => {
        // 1. Verifica que pidió la ubicación
        cy.wrap(locationServiceMock.requestDeviceCurrentPosition).should(
          'have.been.calledOnce'
        );

        // 2. Verifica que inyectó las coordenadas (40.4167, -3.7032) en los jugadores
        cy.wrap(playerServiceMock.importPlayers).should(
          'have.been.calledWithMatch',
          [
            Cypress.sinon.match({
              id: '101',
              name: 'Haaland',
              latitude: 40.4167,
              longitude: -3.7032,
            }),
          ]
        );

        // 3. Verifica el Toast de éxito
        cy.get('@componentInstance').then((instance: any) => {
          expect(instance.toastMessage()).to.contain(
            'Successfully imported 1 players!'
          );
          expect(instance.showToast()).to.be.true;
        });

        // 4. Verificamos que AÚN no ha navegado porque hay un setTimeout de 1.5s
        cy.wrap(navCtrlMock.navigateBack).should('not.have.been.called');

        // Avanzamos el tiempo 1.5 segundos en Cypress
        cy.tick(1500);

        // 5. Ahora sí, verificamos que navegó
        cy.wrap(navCtrlMock.navigateBack).should(
          'have.been.calledOnceWith',
          '/tabs/players'
        );
      });
    });

    it('debe proteger contra fallo del GPS y asignar coordenadas (0, 0)', () => {
      // Forzamos que el LocationService devuelva null o lance un error controlado
      locationServiceMock.requestDeviceCurrentPosition = cy
        .stub()
        .resolves(null);

      const selectedPlayers = [{ id: '101', name: 'Haaland', position: 'ST' }];
      cy.get('@componentInstance').invoke('handleImport', selectedPlayers);

      cy.then(() => {
        // Verifica que inyectó (0, 0) como dicta la lógica por defecto de tu código
        cy.wrap(playerServiceMock.importPlayers).should(
          'have.been.calledWithMatch',
          [
            Cypress.sinon.match({
              latitude: 0,
              longitude: 0,
            }),
          ]
        );
      });
    });

    it('debe manejar errores en la API de importación mostrando un Toast rojo y cancelando la navegación', () => {
      playerServiceMock.importPlayers = cy
        .stub()
        .rejects(new Error('DB Timeout'));

      const selectedPlayers = [{ id: '101', name: 'Haaland' }];
      cy.get('@componentInstance').invoke('handleImport', selectedPlayers);

      cy.then(() => {
        cy.get('@componentInstance').then((instance: any) => {
          expect(instance.toastMessage()).to.equal(
            'Error importing players. Please try again.'
          );
          expect(instance.showToast()).to.be.true;
        });

        // Avanzamos el tiempo
        cy.tick(1500);

        // NUNCA debe haber navegado porque ocurrió un error
        cy.wrap(navCtrlMock.navigateBack).should('not.have.been.called');
      });
    });
  });
});
