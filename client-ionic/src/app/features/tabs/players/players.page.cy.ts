import { PlayersPage } from './players.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

describe('PlayersPage', () => {
  it('should render ion-content', () => {
    cy.mount(PlayersPage, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar],
    });

    cy.get('ion-content').should('exist');
  });
});
