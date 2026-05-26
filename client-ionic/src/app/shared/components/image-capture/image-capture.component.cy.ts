import { ImageCaptureComponent } from './image-capture.component';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonRow,
} from '@ionic/angular/standalone';

describe('ImageCaptureComponent', () => {
  it('should render ion-row', () => {
    cy.mount(ImageCaptureComponent, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonRow],
    });

    cy.get('ion-row').should('exist');
  });
});
