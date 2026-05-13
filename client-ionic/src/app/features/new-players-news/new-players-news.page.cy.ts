import { NewPlayersNewsPage } from './new-players-news.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

describe('NewPlayersNewsPage', () => {
  it('should render title', () => {
    cy.mount(NewPlayersNewsPage, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar],
    });

    cy.get('ion-title').should('exist');
  });
});
