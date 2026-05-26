import { PlayerListComponent } from './player-list.component';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
} from '@ionic/angular/standalone';

describe('PlayerListComponent', () => {
  it('should render ion-grid', () => {
    cy.mount(PlayerListComponent, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonGrid],
    });

    cy.get('ion-grid').should('exist');
  });
});
