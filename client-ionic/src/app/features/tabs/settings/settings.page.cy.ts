import { SettingsPage } from './settings.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TeamService } from '../../../core/services/abstract/team.service';

describe('SettingsPage', () => {
  it('should render title', () => {
    cy.mount(SettingsPage, {
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
