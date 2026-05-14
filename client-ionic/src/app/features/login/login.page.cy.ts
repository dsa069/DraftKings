import { LoginPage } from './login.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

describe('LoginPage', () => {
  it('should render app login card', () => {
    cy.mount(LoginPage, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar],
    });

    cy.get('app-login-card').should('exist');
  });
});
