import { PlayerDetailPage } from './player-detail.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { HeaderSubmenuComponent } from '../../shared/components/header-submenu/header-submenu.component';
import { MapCaptureComponent } from '../../shared/components/map-capture/map-capture.component';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { PlayerService } from '../../core/services/abstract/player.service';

describe('PlayerDetailPage', () => {
  it('should render header submenu', () => {
    cy.mount(PlayerDetailPage, {
      imports: [
        IonContent,
        IonHeader,
        IonTitle,
        IonToolbar,
        HeaderSubmenuComponent,
        MapCaptureComponent,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null,
              },
            },
          },
        },
        {
          provide: NavController,
          useValue: {
            navigateForward: async () => undefined,
            navigateRoot: async () => undefined,
          },
        },
        {
          provide: PlayerService,
          useValue: {
            getPlayerById: async () => null,
            deletePlayer: async () => undefined,
          },
        },
      ],
    });

    cy.get('app-header-submenu').should('exist');
  });
});
