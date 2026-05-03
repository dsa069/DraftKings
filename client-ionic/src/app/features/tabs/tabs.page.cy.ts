import { TabsPage } from './tabs.page';

import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';

describe('TabsPage Component', () => {
  it('should render tab bar', () => {
    cy.mount(TabsPage, {
      imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
    });

    cy.get('ion-tab-bar').should('exist');
  });

  it('should render exactly three tab buttons', () => {
    cy.mount(TabsPage, {
      imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
    });

    cy.get('ion-tab-button').should('have.length', 3);
  });
});
