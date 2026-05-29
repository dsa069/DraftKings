import { NewPlayerPage } from './new-player.page'; // Ajusta la ruta si es necesario
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Servicios
import { PlayerService } from '../../core/services/abstract/player.service';
import { PhotoService } from '../../core/services/photo.service';
import { LocationService } from '../../core/services/location.service';

describe('NewPlayerPage Component - Test Suite Exhaustivo (Crear y Editar)', () => {
  // 1. Declaración de Mocks
  let playerServiceMock: any;
  let photoServiceMock: any;
  let locationServiceMock: any;
  let navCtrlMock: Partial<NavController>;

  // Datos de Prueba
  const mockExistingPlayer = {
    id: '99',
    displayName: 'Mbappé',
    firstName: 'Kylian',
    lastName: 'Mbappé Lottin',
    position: 'Forward',
    number: 9,
    hometown: { lat: 48.8566, lng: 2.3522, address: 'Paris, France' },
    photoUrl: 'https://example.com/mbappe.jpg',
  };

  beforeEach(() => {
    // NavController Mock
    navCtrlMock = {
      navigateForward: cy.stub().resolves(true),
      navigateBack: cy.stub().resolves(true),
    };

    // PlayerService Mock
    playerServiceMock = {
      getPlayerById: cy.stub().resolves(mockExistingPlayer),
      createPlayer: cy
        .stub()
        .resolves({ id: '100', displayName: 'New Player' }),
      updatePlayer: cy.stub().resolves({ ...mockExistingPlayer, number: 10 }),
    };

    // PhotoService Mock (Simulamos gestión local de fotos)
    photoServiceMock = {
      getStoredPhoto: cy.stub().resolves('base64_or_url_string_mock'),
      clearPreviewCache: cy.stub().resolves(),
      rollbackLastUpload: cy.stub().resolves(),
    };

    // LocationService Mock
    locationServiceMock = {
      getCurrentLocation: cy.stub().resolves({ lat: 40.4167, lng: -3.7032 }), // Madrid
    };
  });

  // 2. Función de Montaje Dinámica
  const mountComponent = (playerId: string | null = null) => {
    cy.mount(NewPlayerPage, {
      imports: [ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: cy.stub().returns(playerId) } },
          },
        },
        { provide: NavController, useValue: navCtrlMock },
        { provide: PlayerService, useValue: playerServiceMock },
        { provide: PhotoService, useValue: photoServiceMock },
        { provide: LocationService, useValue: locationServiceMock },
      ],
    }).then((wrapper) => {
      cy.wrap(wrapper.component).as('componentInstance');
    });
  };

  describe('1. Modo Creación: Interfaz, Validaciones y Flujo Feliz', () => {
    beforeEach(() => {
      mountComponent(null); // Pasamos null para forzar 'Crear Jugador'
    });

    it('debe iniciar en modo creación y el formulario debe ser inválido por defecto', () => {
      cy.get('@componentInstance').its('isEditMode').should('be.false');
      cy.get('@componentInstance').its('playerForm.valid').should('be.false');
    });

    it('debe mostrar errores de validación si los campos requeridos se tocan y se dejan vacíos', () => {
      // Forzamos el submit vacío
      cy.get('form').submit();

      // Verificamos que aparezcan las notas rojas (ion-note color="danger")
      cy.get('ion-note[color="danger"]')
        .should('be.visible')
        .and('contain.text', 'Required');

      // No debe llamar al servicio
      cy.wrap(playerServiceMock.createPlayer).should('not.have.been.called');
    });

    it('debe mostrar error específico si el número del jugador está fuera del rango (1-99)', () => {
      cy.get('ion-input[formControlName="number"]').type('100');
      cy.get('ion-input[formControlName="number"]').blur();

      cy.get('ion-note[color="danger"]').should(
        'contain.text',
        'Required (1-99)'
      );
      cy.get('@componentInstance')
        .its('playerForm.controls.number.valid')
        .should('be.false');
    });

    it('debe completar el flujo de creación exitosamente, limpiar caché y navegar', () => {
      // 1. Llenamos el formulario con datos válidos
      cy.get('ion-input[formControlName="displayName"]').type('Vinicius');
      cy.get('ion-input[formControlName="firstName"]').type('Vinicius');
      cy.get('ion-input[formControlName="lastName"]').type('Junior');

      // Asumiendo que usas ion-select o ion-input para posición
      cy.get('ion-select[formControlName="position"]').click();
      cy.get('ion-select-option[value="Forward"]').click(); // Ajusta según tus values

      cy.get('ion-input[formControlName="number"]').clear().type('7');

      // 2. Simulamos la recepción de un mapa (Location Output)
      cy.get('@componentInstance').then((instance: any) => {
        instance.onLocationSelected({ lat: 40, lng: -3, address: 'Madrid' });
      });

      // 3. Hacemos Submit
      cy.get('form').submit();

      // 4. Verificaciones Asíncronas
      cy.then(() => {
        // Verifica que obtuvo la foto antes de guardar
        cy.wrap(photoServiceMock.getStoredPhoto).should('have.been.called');

        // Verifica la llamada a la API con la foto adjunta
        cy.wrap(playerServiceMock.createPlayer).should(
          'have.been.calledWithMatch',
          Cypress.sinon.match({
            displayName: 'Vinicius',
            number: 7,
            photoUrl: 'base64_or_url_string_mock', // Viene del Mock de photoService
          })
        );

        // Verifica que limpió la caché
        cy.wrap(photoServiceMock.clearPreviewCache).should(
          'have.been.calledOnce'
        );

        // Verifica que navegó al detalle del nuevo jugador (cuyo ID mockeado es '100')
        cy.wrap(navCtrlMock.navigateForward).should(
          'have.been.calledWith',
          '/player-detail/100'
        );
      });
    });
  });

  describe('2. Modo Edición: Precarga de Datos y Actualización', () => {
    beforeEach(() => {
      mountComponent('99'); // Pasamos un ID para forzar 'Editar Jugador'
    });

    it('debe cargar los datos del jugador desde el servicio e inyectarlos en el formulario', () => {
      // Verificamos banderas
      cy.get('@componentInstance').its('isEditMode').should('be.true');
      cy.get('@componentInstance').its('editingPlayerId').should('equal', '99');

      // Verificamos que el formulario se autocompletó con Mbappé
      cy.get('ion-input[formControlName="displayName"]').should(
        'have.value',
        'Mbappé'
      );
      cy.get('ion-input[formControlName="number"]').should('have.value', 9);

      // El formulario debe ser válido inmediatamente
      cy.get('@componentInstance').its('playerForm.valid').should('be.true');
    });

    it('debe actualizar el jugador existente en lugar de crear uno nuevo al hacer submit', () => {
      // Cambiamos el número de Mbappé
      cy.get('ion-input[formControlName="number"]').clear().type('10');

      cy.get('form').submit();

      cy.then(() => {
        // Aseguramos que llamó a updatePlayer (pasando ID y body) y NO a createPlayer
        cy.wrap(playerServiceMock.updatePlayer).should(
          'have.been.calledOnceWith',
          '99',
          Cypress.sinon.match({
            number: 10,
            displayName: 'Mbappé',
          })
        );

        cy.wrap(playerServiceMock.createPlayer).should('not.have.been.called');

        // Verifica navegación al detalle de vuelta
        cy.wrap(navCtrlMock.navigateForward).should(
          'have.been.calledWith',
          '/player-detail/99'
        );
      });
    });
  });

  describe('3. Manejo Crítico de Errores (Rollback)', () => {
    beforeEach(() => {
      mountComponent(null);
    });

    it('debe disparar rollback de la foto si el servidor falla al crear/guardar al jugador', () => {
      // Forzamos un error en la API de jugadores
      playerServiceMock.createPlayer = cy
        .stub()
        .rejects(new Error('Server Crash 500'));
      cy.spy(console, 'error').as('consoleError'); // Para el catch block

      // Forzamos datos válidos directamente en el instance para saltar el tipado manual
      cy.get('@componentInstance').then((instance: any) => {
        instance.playerForm.patchValue({
          displayName: 'Test',
          firstName: 'Test',
          lastName: 'Test',
          position: 'GK',
          number: 1,
        });
      });

      cy.get('form').submit();

      cy.then(() => {
        // El error fue atrapado por consola
        cy.get('@consoleError').should(
          'have.been.calledWithMatch',
          'Error guardando jugador:'
        );

        // CRÍTICO: Debe revertir la subida de la foto para no dejar archivos basura en storage
        cy.wrap(photoServiceMock.rollbackLastUpload).should(
          'have.been.calledOnce'
        );

        // No debe navegar ni limpiar caché limpia
        cy.wrap(navCtrlMock.navigateForward).should('not.have.been.called');
        cy.wrap(photoServiceMock.clearPreviewCache).should(
          'not.have.been.called'
        );
      });
    });
  });
});
