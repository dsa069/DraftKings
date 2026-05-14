import { BackendToggleComponent } from './backend-toggle.component';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

describe('BackendToggleComponent', () => {
  it('should render title', () => {
    cy.mount(BackendToggleComponent, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar],
    });

    cy.get('ion-title').should('exist');
  });
});
