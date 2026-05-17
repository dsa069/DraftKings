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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  lockClosedOutline,
  arrowForwardOutline,
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';
import { NavController } from '@ionic/angular';
import { LoginCardComponent } from '../../shared/components/login-card/login-card.component';
import { ConfigService, BackendType } from '../../core/services/config.service';
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
    LoginCardComponent,
  ],
})
export class LoginPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly navCtrl = inject(NavController);
  private readonly configService = inject(ConfigService);
  private readonly authService = inject(AuthService);

  loginForm!: FormGroup;
  showPassword: boolean = false;
  selectedBackend: BackendType = this.configService.selectedBackend();

  constructor() {
    addIcons({
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'arrow-forward-outline': arrowForwardOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      console.log('Formulario de login no válido');
      return;
    }

    // 1. COMPROBAR CAMBIO DE BACKEND
    // Si el usuario eligió un backend distinto al que está activo, recargamos.
    if (this.selectedBackend !== this.configService.selectedBackend()) {
      console.log('Cambiando backend y recargando...');
      this.configService.applyBackendChange(this.selectedBackend);
      return; // El código muere aquí por el window.location.reload()
    }

    // 2. LOGIN REAL (Solo llegamos aquí si el backend ya era el correcto)
    const { email, password } = this.loginForm.value;

    try {
      console.log('Autenticando en Firebase para:', this.selectedBackend);

      // Llamamos a la estrategia activa (Spring o Node)
      await this.authService.login(email!, password!);

      // 3. NAVEGACIÓN (Solo si el login fue exitoso)
      console.log('Login exitoso');
      this.navCtrl.navigateRoot(['/tabs/players']);
    } catch (error: any) {
      console.error('Error de autenticación:', error);
      // Aquí manejas los errores (contraseña mal, usuario no existe, etc)
    }
  }

  gotoSignUp(): void {
    this.navCtrl.navigateForward(['/sign-up']);
  }
}
