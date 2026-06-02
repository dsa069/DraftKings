import { Component, OnInit, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonHeader,
  IonText,
  IonButtons,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  lockClosedOutline,
  arrowForwardOutline,
  eyeOutline,
  eyeOffOutline,
  arrowBackOutline,
} from 'ionicons/icons';
import { NavController } from '@ionic/angular';
import { LoginCardComponent } from '../../shared/components/login-card/login-card.component';
import { AuthService } from '../../core/services/abstract/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonInput,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonHeader,
    IonText,
    IonButtons,
    LoginCardComponent,
  ],
})
export class LoginPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly navCtrl = inject(NavController);
  private readonly authService = inject(AuthService);
  private readonly toastCtrl = inject(ToastController);
  loginForm!: FormGroup;
  showPassword: boolean = false;

  constructor() {
    addIcons({
      mailOutline,
      lockClosedOutline,
      arrowForwardOutline,
      eyeOutline,
      eyeOffOutline,
      arrowBackOutline,
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      await this.showToast('The entered email is not valid');
      console.log('El email introducido no tiene un formato válido');
      return;
    }

    const { email, password } = this.loginForm.value;

    // 1. COMPROBAR CAMBIO DE BACKEND
    // Si el usuario eligió un backend distinto al que está activo, recargamos.
    try {
      // Paso 1: Logueamos en Firebase (común a todos)
      await this.authService.loginFirebase(email!, password!);

      // Paso 3: Si es el mismo backend, verificamos ya mismo
      await this.authService.verifyBackend();
      await this.showToast('Login successful!', 'success');
      this.navCtrl.navigateRoot(['/tabs/players']);
    } catch (error) {
      console.error('Login fallido:', error);
      await this.showToast('Login failed. Please check your credentials.');
    }
  }

  gotoSignUp(): void {
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur();
    this.navCtrl.navigateForward(['/sign-up']);
  }

  goToPlayers(): void {
    // Usamos navigateRoot para limpiar el historial de navegación si vas al inicio/tabs
    this.navCtrl.navigateRoot(['/tabs/players']);
  }

  private async showToast(
    message: string,
    color: string = 'danger'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }
}
