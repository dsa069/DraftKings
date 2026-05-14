import { PlayerDetailPage } from './player-detail.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

describe('PlayerDetailPage', () => {
  it('should render app login card', () => {
    cy.mount(PlayerDetailPage, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar],
    });

    cy.get('app-login-card').should('exist');
  });
});
