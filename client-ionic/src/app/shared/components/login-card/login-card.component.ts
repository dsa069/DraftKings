import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
  inject, // <-- Añadido
} from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonFooter,
  IonText,
  IonItem, // <-- Añadido
  IonLabel, // <-- Añadido
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, serverOutline } from 'ionicons/icons'; // <-- serverOutline añadido
import { NavController } from '@ionic/angular'; // <-- Añadido

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
    IonItem, // <-- Añadido
    IonLabel, // <-- Añadido
  ],
  encapsulation: ViewEncapsulation.None,
})
export class LoginCardComponent {
  @Input() footerText: string = '';
  @Input() footerActionText: string = '';
  @Input() submitText: string = 'Confirm';
  @Input() formId: string = '';
  @Input() showBackendHint: boolean = true;

  // Nuevo Input para recibir el backend actual desde el padre
  @Input() currentBackend: string = 'node';

  @Output() footerActionClick = new EventEmitter<void>();

  // Inyectamos NavController para la redirección
  private navCtrl = inject(NavController);

  constructor() {
    addIcons({ arrowForwardOutline, serverOutline });
  }

  onFooterAction() {
    this.footerActionClick.emit();
  }

  // Método para ir a la página de selección de backend
  goToSwitchBack() {
    this.navCtrl.navigateForward('/switch-back');
  }
}
