import { NewPlayersNewsPage } from './new-players-news.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TeamService } from '../../core/services/abstract/team.service';

describe('NewPlayersNewsPage', () => {
  it('should render title', () => {
    cy.mount(NewPlayersNewsPage, {
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
