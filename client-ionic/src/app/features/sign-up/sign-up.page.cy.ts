import { SignUpPage } from './sign-up.page';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

describe('SignUpPage', () => {
  it('should render title', () => {
    cy.mount(SignUpPage, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar],
    });

    cy.get('ion-title').should('exist');
  });
});
