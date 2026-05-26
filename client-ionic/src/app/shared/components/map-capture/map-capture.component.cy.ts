import { MapCaptureComponent } from './map-capture.component';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
} from '@ionic/angular/standalone';

describe('MapCaptureComponent', () => {
  it('should render ion-grid', () => {
    cy.mount(MapCaptureComponent, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonGrid],
    });

    cy.get('ion-grid').should('exist');
  });
});
