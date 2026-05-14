import { PlayerDetailPage } from './player-detail.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

describe('PlayerDetailPage', () => {
  it('should render title', () => {
    cy.mount(PlayerDetailPage, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar],
    });

    cy.get('ion-title').should('exist');
  });
});
