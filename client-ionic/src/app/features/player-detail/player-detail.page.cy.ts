import { PlayerDetailPage } from './player-detail.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { HeaderSubmenuComponent } from '../../shared/components/header-submenu/header-submenu.component';

describe('PlayerDetailPage', () => {
  it('should render header submenu', () => {
    cy.mount(PlayerDetailPage, {
      imports: [
        IonContent,
        IonHeader,
        IonTitle,
        IonToolbar,
        HeaderSubmenuComponent,
      ],
    });

    cy.get('app-header-submenu').should('exist');
  });
});
