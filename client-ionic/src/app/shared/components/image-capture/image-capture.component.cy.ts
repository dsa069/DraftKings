import { ImageCaptureComponent } from './image-capture.component';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

describe('ImageCaptureComponent', () => {
  it('should render title', () => {
    cy.mount(ImageCaptureComponent, {
      imports: [IonContent, IonHeader, IonTitle, IonToolbar],
    });

    cy.get('ion-title').should('exist');
  });
});
