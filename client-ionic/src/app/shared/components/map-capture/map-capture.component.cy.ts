import { MapCaptureComponent } from './map-capture.component';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

describe('MapCaptureComponent', () => {
  it('should render title', () => {
    cy.mount(MapCaptureComponent, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar],
    });

    cy.get('ion-title').should('exist');
  });
});
