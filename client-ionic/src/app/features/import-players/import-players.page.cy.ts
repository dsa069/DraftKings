import { ImportPlayersPage } from './import-players.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { HeaderSubmenuComponent } from '../../shared/components/header-submenu/header-submenu.component';
import { NavController } from '@ionic/angular';
import { PlayerService } from '../../core/services/abstract/player.service';
import { LocationService } from '../../core/services/abstract/location.service';

describe('ImportPlayersPage Component', () => {
  it('should render header submenu', () => {
    cy.mount(ImportPlayersPage, {
      imports: [
        IonContent,
        IonHeader,
        IonTitle,
        IonToolbar,
        HeaderSubmenuComponent,
      ],
      providers: [
        {
          provide: NavController,
          useValue: {
            navigateBack: async () => undefined,
          },
        },
        {
          provide: PlayerService,
          useValue: {
            getExternalApiPlayers: async () => [],
            importPlayers: async () => undefined,
          },
        },
        {
          provide: LocationService,
          useValue: {
            requestDeviceCurrentPosition: async () => ({ lat: 0, lng: 0 }),
          },
        },
      ],
    });

    cy.get('app-header-submenu').should('exist');
  });
});
