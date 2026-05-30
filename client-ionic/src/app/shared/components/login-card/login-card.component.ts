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
import { addIcons } from 'ionicons';
import { arrowForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login-card',
  templateUrl: './login-card.component.html',
  styleUrls: ['./login-card.component.scss'],
  standalone: true,
  imports: [IonCard, IonCardContent, IonButton, IonIcon, IonFooter, IonText],
  encapsulation: ViewEncapsulation.None,
})
export class LoginCardComponent {
  @Input() footerText: string = '';
  @Input() footerActionText: string = '';
  @Input() submitText: string = 'Confirm';
  @Input() formId: string = '';

  @Output() footerActionClick = new EventEmitter<void>();

  constructor() {
    addIcons({ arrowForwardOutline });
  }

  onFooterAction() {
    this.footerActionClick.emit();
  }
}
