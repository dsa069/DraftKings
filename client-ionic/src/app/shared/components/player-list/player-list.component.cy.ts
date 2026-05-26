import { PlayerListComponent } from './player-list.component';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

describe('PlayerListComponent', () => {
  it('should render title', () => {
    cy.mount(PlayerListComponent, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar],
    });

    cy.get('ion-title').should('exist');
  });
});
