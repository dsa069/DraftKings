import { CreatePlayersNewsPage } from './create-players-news.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

describe('CreatePlayersNews Component', () => {
  it('should render title', () => {
    cy.mount(CreatePlayersNewsPage, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar],
    });

    cy.get('ion-title').should('exist');
  });
});
