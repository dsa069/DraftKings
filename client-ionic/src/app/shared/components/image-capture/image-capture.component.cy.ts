import { ImageCaptureComponent } from './image-capture.component';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
} from '@ionic/angular/standalone';

describe('ImageCaptureComponent', () => {
  it('should render ion-grid', () => {
    cy.mount(ImageCaptureComponent, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonGrid],
    });

    cy.get('ion-grid').should('exist');
  });
});
