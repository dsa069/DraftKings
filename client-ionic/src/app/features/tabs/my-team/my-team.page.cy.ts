import { MyTeamPage } from './my-team.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Subject } from 'rxjs';
import { TeamService } from '../../../core/services/abstract/team.service';

describe('MyTeamPage', () => {
  it('should render title', () => {
    cy.mount(MyTeamPage, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar],
      providers: [
        {
          provide: TeamService,
          useValue: {
            teamCleared$: new Subject<void>(),
            getTeam: async () => ({}),
            saveTeam: async () => undefined,
            clearTeam: async () => undefined,
            getAiRecommendations: async () => ({
              message: '',
              recommendations: {},
            }),
          },
        },
      ],
    });

    cy.get('ion-title').should('exist');
  });
});
