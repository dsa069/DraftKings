import { PlayerDetailPage } from './player-detail.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

describe('PlayerDetailPage', () => {
  it('should render ion-content', () => {
    cy.mount(PlayerDetailPage, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar],
    });

    cy.get('ion-content').should('exist');
  });
});
