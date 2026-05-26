import { PlayersPage } from './players.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../shared/components/header/header.component';

describe('PlayersPage', () => {
  it('should render header', () => {
    cy.mount(PlayersPage, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar, HeaderComponent],
    });

    cy.get('app-header').should('exist');
  });
});
