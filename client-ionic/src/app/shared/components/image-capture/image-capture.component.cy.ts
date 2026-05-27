import { ImageCaptureComponent } from './image-capture.component';

import {
  IonGrid,
  IonRow,
  IonButton,
  IonIcon,
  IonImg,
  IonInput,
  IonLabel,
  IonText,
} from '@ionic/angular/standalone';
import { PhotoService } from '../../../core/services/abstract/photo.service';

describe('ImageCaptureComponent', () => {
  it('should render ion-grid', () => {
    cy.mount(ImageCaptureComponent, {
      imports: [
        IonGrid,
        IonRow,
        IonButton,
        IonIcon,
        IonImg,
        IonInput,
        IonLabel,
        IonText,
      ],
      providers: [
        {
          provide: PhotoService,
          useValue: {
            currentPhotoPreview: () => null,
            urlInputValue: () => '',
            takePhoto: async () => undefined,
            updateUrlInput: async () => undefined,
            updateLocalImageFile: async () => undefined,
          },
        },
      ],
    });

    cy.get('ion-grid').should('exist');
  });
});
