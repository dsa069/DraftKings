import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core';
import { IonCard, IonCardContent, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login-card',
  templateUrl: './login-card.component.html',
  styleUrls: ['./login-card.component.scss'],
  imports: [IonCard, IonCardContent, IonButton],
  encapsulation: ViewEncapsulation.None, // Permite que el SCSS de este componente estilice el contenido proyectado (<ng-content>)
})
export class LoginCardComponent {
  @Input() footerText: string = '';
  @Input() footerActionText: string = '';

  @Output() footerActionClick = new EventEmitter<void>();

  onFooterAction() {
    this.footerActionClick.emit();
  }
}
