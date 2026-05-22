import { HeaderSubmenuComponent } from './header-submenu.component';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

describe('HeaderSubmenuComponent', () => {
  it('should render title', () => {
    cy.mount(HeaderSubmenuComponent, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar],
    });

    cy.get('ion-title').should('exist');
  });
});
