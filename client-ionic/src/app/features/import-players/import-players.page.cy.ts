import { ImportPlayersPage } from './import-players.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

describe('ImportPlayersPage Component', () => {
  it('should render ion-content', () => {
    cy.mount(ImportPlayersPage, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar],
    });

    cy.get('ion-content').should('exist');
  });
});
