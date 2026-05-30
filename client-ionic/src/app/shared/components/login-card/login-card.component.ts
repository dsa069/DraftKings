import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonFooter,
  IonText,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, serverOutline } from 'ionicons/icons';
import { NavController } from '@ionic/angular';
import { ConfigService } from '../../../core/services/config.service';

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
    IonItem,
    IonLabel,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class LoginCardComponent {
  @Input() footerText: string = '';
  @Input() footerActionText: string = '';
  @Input() submitText: string = 'Confirm';
  @Input() formId: string = '';
  @Input() showBackendHint: boolean = true;

  @Output() footerActionClick = new EventEmitter<void>();

  private navCtrl = inject(NavController);
  private configService = inject(ConfigService);

  public currentBackend = this.configService.selectedBackend();

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
