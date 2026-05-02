import { mount } from '@cypress/angular';
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
    mount(TabsPage, {
      imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
    });

    cy.get('ion-tab-bar').should('exist');
  });

  it('should render exactly three tab buttons', () => {
    mount(TabsPage, {
      imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
    });

    cy.get('ion-tab-button').should('have.length', 3);
  });
});
