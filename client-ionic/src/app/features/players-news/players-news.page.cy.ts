import { PlayersNewsPage } from './players-news.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TeamService } from '../../core/services/abstract/team.service';

describe('PlayersNews Component', () => {
  it('should render title', () => {
    cy.mount(PlayersNewsPage, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar],
      providers: [
        {
          provide: TeamService,
          useValue: {
            clearTeam: async () => undefined,
          },
        },
      ],
    });

    cy.get('ion-title').should('exist');
  });
});
