import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonFooter,
  IonText,
} from '@ionic/angular/standalone';
import { BackendToggleComponent } from '../backend-toggle/backend-toggle.component'; // Ajusta la ruta si es necesario
import { addIcons } from 'ionicons';
import { arrowForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login-card',
  templateUrl: './login-card.component.html',
  styleUrls: ['./login-card.component.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonFooter,
    IonText,
    BackendToggleComponent,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class LoginCardComponent {
  @Input() footerText: string = '';
  @Input() footerActionText: string = '';

  // Backend selection abstraction
  @Input() selectedBackend: 'node' | 'springboot' = 'node';
  @Input() submitText: string = 'Confirm';
  @Input() formId: string = ''; // ID del formulario en el padre

  @Output() footerActionClick = new EventEmitter<void>();
  @Output() backendChange = new EventEmitter<'node' | 'springboot'>();

  constructor() {
    addIcons({ arrowForwardOutline });
  }

  onFooterAction() {
    this.footerActionClick.emit();
  }

  onBackendChange(val: 'node' | 'springboot') {
    this.backendChange.emit(val);
  }
}
