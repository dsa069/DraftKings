import { PlayersPage } from './players.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PlayerListComponent } from '../../../shared/components/player-list/player-list.component';
import { NavController } from '@ionic/angular';
import { PlayerService } from '../../../core/services/abstract/player.service';

describe('PlayersPage', () => {
  it('should render player list', () => {
    cy.mount(PlayersPage, {
      imports: [
        IonContent,
        IonHeader,
        IonTitle,
        IonToolbar,
        HeaderComponent,
        PlayerListComponent,
      ],
      providers: [
        {
          provide: NavController,
          useValue: {
            navigateForward: async () => undefined,
          },
        },
        {
          provide: PlayerService,
          useValue: {
            playerCreated$: {
              subscribe: () => ({ unsubscribe: () => undefined }),
            },
            playerUpdated$: {
              subscribe: () => ({ unsubscribe: () => undefined }),
            },
            playerDeleted$: {
              subscribe: () => ({ unsubscribe: () => undefined }),
            },
            getPlayers: async () => [],
          },
        },
      ],
    });

    cy.get('app-player-list').should('exist');
  });
});
