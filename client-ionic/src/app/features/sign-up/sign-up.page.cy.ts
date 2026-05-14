import { SignUpPage } from './sign-up.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

describe('SignUpPage', () => {
  it('should render app login card', () => {
    cy.mount(SignUpPage, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar],
    });

    cy.get('app-login-card').should('exist');
  });
});
