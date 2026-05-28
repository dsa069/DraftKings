import { HeaderComponent } from './header.component';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TeamService } from '../../../core/services/abstract/team.service';

describe('HeaderComponent', () => {
  it('should render title', () => {
    cy.mount(HeaderComponent, {
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
