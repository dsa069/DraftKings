import { ImportPlayersPage } from './import-players.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { HeaderSubmenuComponent } from '../../shared/components/header-submenu/header-submenu.component';

describe('ImportPlayersPage Component', () => {
  it('should render header submenu', () => {
    cy.mount(ImportPlayersPage, {
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
