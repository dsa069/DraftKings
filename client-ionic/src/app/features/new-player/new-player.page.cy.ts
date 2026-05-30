import { NewPlayerPage } from './new-player.page';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PlayerService } from '../../core/services/abstract/player.service';
import { PhotoService } from '../../core/services/photo.service';
import { LocationService } from '../../core/services/location.service';
import { AuthService } from '../../core/services/abstract/auth.service';

describe('NewPlayerPage Component - Test Suite Exhaustivo (Crear y Editar)', () => {
  let playerServiceMock: any;
  let photoServiceMock: any;
  let locationServiceMock: any;
  let authServiceMock: any;
  let navCtrlMock: Partial<NavController>;

  const mockExistingPlayer = {
    id: '99',
    name: 'Mbappe',
    firstName: 'Kylian',
    lastName: 'Mbappe Lottin',
    age: 26,
    birthdate: '1998-12-20',
    nationality: 'France',
    height: 178,
    weight: 73,
    team: 'PSG',
    league: 'Ligue 1',
    position: 'fw',
    number: 9,
    latitude: 48.8566,
    longitude: 2.3522,
    photoUrl: 'https://example.com/mbappe.jpg',
  };

  beforeEach(() => {
    navCtrlMock = {
      navigateForward: cy.stub().resolves(true),
      navigateBack: cy.stub().resolves(true),
    };

    playerServiceMock = {
      getPlayerById: cy.stub().resolves(mockExistingPlayer),
      createPlayer: cy.stub().resolves({ id: '100', name: 'New Player' }),
      updatePlayer: cy.stub().resolves({ ...mockExistingPlayer, number: 10 }),
    };

    photoServiceMock = {
      currentPhotoPreview: cy.stub().returns(null),
      uploadCurrentImage: cy.stub().resolves('https://img/new-player.png'),
      updateUrlInput: cy.stub().resolves(),
      clearPreviewCache: cy.stub().resolves(),
      rollbackLastUpload: cy.stub().resolves(),
    };

    locationServiceMock = {
      requestDeviceCurrentPosition: cy
        .stub()
        .resolves({ lat: 40.4167, lng: -3.7032 }),
    };

    authServiceMock = {
      getToken: cy.stub().resolves('mock-token'),
    };
  });

  const mountComponent = (playerId: string | null = null) => {
    cy.mount(NewPlayerPage, {
      imports: [ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: { get: cy.stub().returns(playerId) },
            },
          },
        },
        { provide: NavController, useValue: navCtrlMock },
        { provide: PlayerService, useValue: playerServiceMock },
        { provide: PhotoService, useValue: photoServiceMock },
        { provide: LocationService, useValue: locationServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).then((wrapper) => {
      cy.wrap(wrapper.component).as('componentInstance');
    });
  };

  describe('1. Modo Creacion: Interfaz, Validaciones y Flujo Feliz', () => {
    beforeEach(() => {
      mountComponent(null);
    });

    it('debe iniciar en modo creacion y el formulario debe ser invalido por defecto', () => {
      cy.get('@componentInstance').its('isEditMode').should('be.false');
      cy.get('@componentInstance').its('playerForm.valid').should('be.false');
    });

    it('debe mostrar errores de validacion si los campos requeridos se tocan y se dejan vacios', () => {
      cy.get('form').submit();
      cy.get('ion-note[color="danger"]').should('be.visible');
      cy.wrap(playerServiceMock.createPlayer).should('not.have.been.called');
    });

    it('debe mostrar error especifico si el numero del jugador esta fuera del rango (1-99)', () => {
      cy.get('@componentInstance').then((instance: any) => {
        instance.playerForm.get('number').setValue(100);
        instance.playerForm.get('number').markAsTouched();
      });

      cy.get('ion-note[color="danger"]').should(
        'contain.text',
        'Required (1-99).'
      );
      cy.get('@componentInstance')
        .its('playerForm.controls.number.valid')
        .should('be.false');
    });

    it('debe completar el flujo de creacion exitosamente, limpiar cache y navegar', () => {
      cy.get('@componentInstance').then((instance: any) => {
        instance.playerForm.patchValue({
          displayName: 'Vinicius',
          firstName: 'Vinicius',
          lastName: 'Junior',
          age: 24,
          birthdate: '2000-07-12',
          nationality: 'Brazil',
          height: 176,
          weight: 73,
          team: 'Real Madrid',
          league: 'La Liga',
          position: 'fw',
          number: 7,
        });
        instance.onLocationSelected({ lat: 40, lng: -3 });
      });

      cy.get('form').submit();

      cy.wrap(playerServiceMock.createPlayer).should(
        'have.been.calledWithMatch',
        {
          name: 'Vinicius',
          number: 7,
          latitude: 40,
          longitude: -3,
        }
      );
      cy.wrap(photoServiceMock.clearPreviewCache).should('have.been.called');
      cy.wrap(navCtrlMock.navigateForward).should(
        'have.been.calledWith',
        '/player-detail/100'
      );
    });
  });

  describe('2. Modo Edicion: Precarga de Datos y Actualizacion', () => {
    beforeEach(() => {
      mountComponent('99');
    });

    it('debe cargar los datos del jugador desde el servicio e inyectarlos en el formulario', () => {
      cy.get('@componentInstance').its('isEditMode').should('be.true');
      cy.wrap(playerServiceMock.getPlayerById).should('have.been.called');
      cy.get('@componentInstance').then((instance: any) => {
        expect(instance.playerForm.value.displayName).to.equal('Mbappe');
        expect(instance.playerForm.value.number).to.equal(9);
      });
    });

    it('debe actualizar el jugador existente en lugar de crear uno nuevo al hacer submit', () => {
      cy.get('@componentInstance').then((instance: any) => {
        instance.playerForm.patchValue({ number: 10 });
      });

      cy.get('form').submit();

      cy.wrap(playerServiceMock.updatePlayer).should(
        'have.been.calledOnceWith',
        '99',
        Cypress.sinon.match({ number: 10 })
      );
      cy.wrap(playerServiceMock.createPlayer).should('not.have.been.called');
      cy.wrap(navCtrlMock.navigateForward).should(
        'have.been.calledWith',
        '/player-detail/99'
      );
    });
  });

  describe('3. Manejo Critico de Errores (Rollback)', () => {
    beforeEach(() => {
      mountComponent(null);
    });

    it('debe disparar rollback de la foto si el servidor falla al crear/guardar al jugador', () => {
      playerServiceMock.createPlayer = cy
        .stub()
        .rejects(new Error('Server Crash 500'));
      cy.spy(console, 'error').as('consoleError');

      cy.get('@componentInstance').then((instance: any) => {
        instance.playerForm.patchValue({
          displayName: 'Test',
          firstName: 'Test',
          lastName: 'Test',
          age: 25,
          birthdate: '1999-01-01',
          nationality: 'Spain',
          height: 180,
          weight: 75,
          team: 'Team',
          league: 'League',
          position: 'gk',
          number: 1,
        });
      });

      cy.get('form').submit();

      cy.get('@consoleError').should(
        'have.been.calledWithMatch',
        'Error guardando jugador:'
      );
      cy.wrap(photoServiceMock.rollbackLastUpload).should(
        'have.been.calledOnce'
      );
      cy.wrap(navCtrlMock.navigateForward).should('not.have.been.called');
    });
  });
});
