import { Component, OnInit, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonBackButton,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonChip,
  IonButtons,
  ToastController,
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  lockClosedOutline,
  arrowForwardOutline,
  eyeOutline,
  eyeOffOutline,
  gameControllerOutline,
  ellipse,
} from 'ionicons/icons';
import { LoginCardComponent } from '../../shared/components/login-card/login-card.component';
import { ConfigService, BackendType } from '../../core/services/config.service';
import { AuthService } from '../../core/services/abstract/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
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
    IonCol,
    IonText,
    IonChip,
    IonButtons,
    IonBackButton,
    LoginCardComponent,
  ],
})
export class SignUpPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly navCtrl = inject(NavController);
  private readonly configService = inject(ConfigService);
  private readonly authService = inject(AuthService);
  private readonly toastCtrl = inject(ToastController);
  passwordMatchValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  signUpForm!: FormGroup;
  selectedBackend: BackendType = this.configService.selectedBackend();

  constructor() {
    addIcons({
      personOutline,
      mailOutline,
      lockClosedOutline,
      arrowForwardOutline,
      eyeOutline,
      eyeOffOutline,
      gameControllerOutline,
      ellipse,
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.signUpForm = this.formBuilder.group(
      {
        userName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            // 8 caracteres, 1 número y 1 símbolo
            Validators.pattern(
              /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: [this.passwordMatchValidator],
      }
    );
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // En sign-up.page.ts
  async onRegister(): Promise<void> {
    if (this.signUpForm.invalid) {
      const message = this.getFormErrorMessage();
      await this.showToast(message);
      return;
    }

    const { email, password, userName } = this.signUpForm.value;

    try {
      // 1. Bloqueamos al centinela temporalmente para que no interfiera en caliente
      localStorage.setItem('bypass_centinela', 'true');

      // 2. Registro en Firebase (Paso común)
      await this.authService.registerFirebase(email, password);

      // 3. ¿Hay cambio de backend?
      if (this.selectedBackend !== this.configService.selectedBackend()) {
        // Preparamos las banderas EXCLUSIVAS para el post-reload
        localStorage.setItem('pending_sync_data', JSON.stringify({ userName }));
        localStorage.setItem('execute_sync_on_reload', 'true');

        // Liberamos el bypass para que el centinela despierte al recargar
        localStorage.removeItem('bypass_centinela');

        // Provoca el window.location.reload()
        this.configService.applyBackendChange(this.selectedBackend);
        return;
      }

      // 4. Si es el mismo backend (Sin reload)
      await this.authService.registerBackend({ userName });

      // Limpieza total y navegación
      localStorage.removeItem('bypass_centinela');
      this.showToast('Registration successful!', 'success');
      this.navCtrl.navigateRoot('/tabs/players');
    } catch (error) {
      // Si falla CUALQUIER COSA de arriba, hacemos rollback y limiampos todo
      console.error('❌ Error en el registro, iniciando ROLLBACK:', error);
      await this.authService.deleteCurrentUser();
      this.showToast('Registration error. Please try again.');
      localStorage.removeItem('bypass_centinela');
      localStorage.removeItem('pending_sync_data');
      localStorage.removeItem('execute_sync_on_reload');
      console.error('Error en el registro:', error);
    }
  }

  gotoLogin(): void {
    this.navCtrl.navigateRoot('/login');
  }

  get isPasswordLongEnough(): boolean {
    const password = this.signUpForm.get('password')?.value || '';
    return password.length >= 8;
  }

  get hasNumber(): boolean {
    const password = this.signUpForm.get('password')?.value || '';
    return /\d/.test(password);
  }

  get hasSymbol(): boolean {
    const password = this.signUpForm.get('password')?.value || '';
    return /[!@#$%^&*]/.test(password);
  }

  // Nuevo método para identificar el error
  private getFormErrorMessage(): string {
    if (this.signUpForm.get('userName')?.hasError('required'))
      return 'Username is required.';
    if (this.signUpForm.get('userName')?.hasError('minlength'))
      return 'The username must be at least 3 characters.';
    if (this.signUpForm.get('email')?.invalid) return 'Invalid email format.';
    if (this.signUpForm.get('password')?.hasError('required'))
      return 'Password is required.';
    if (this.signUpForm.get('password')?.hasError('pattern'))
      return 'Password must be at least 8 characters, include 1 number and 1 symbol.';
    if (this.signUpForm.hasError('passwordMismatch'))
      return 'Passwords do not match.';
    return 'Please make sure all fields are correct.';
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
