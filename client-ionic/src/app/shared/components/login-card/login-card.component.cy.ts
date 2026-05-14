import { LoginCardComponent } from './login-card.component';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

describe('LoginCardComponent', () => {
  it('should render card', () => {
    cy.mount(LoginCardComponent, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar],
    });

    cy.get('ion-card').should('exist');
  });
});
