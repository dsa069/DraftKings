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
    control: AbstractControl,
  ): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };

  showPassword: boolean = false;
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
              /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/,
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: [this.passwordMatchValidator],
      },
    );
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
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
      this.navCtrl.navigateRoot('/tabs/players');
    } catch (error) {
      // Si falla CUALQUIER COSA de arriba, hacemos rollback y limiampos todo
      console.error('❌ Error en el registro, iniciando ROLLBACK:', error);
      await this.authService.deleteCurrentUser();
      localStorage.removeItem('bypass_centinela');
      localStorage.removeItem('pending_sync_data');
      localStorage.removeItem('execute_sync_on_reload');
      console.error('Error en el registro:', error);
    }
  }

  gotoLogin(): void {
    this.navCtrl.navigateRoot('/login');
  }

  // Nuevo método para identificar el error
  private getFormErrorMessage(): string {
    if (this.signUpForm.get('userName')?.hasError('required'))
      return 'El nombre de usuario es obligatorio.';
    if (this.signUpForm.get('userName')?.hasError('minlength'))
      return 'El nombre debe tener al menos 3 caracteres.';
    if (this.signUpForm.get('email')?.invalid)
      return 'Formato de correo inválido.';
    if (this.signUpForm.get('password')?.hasError('required'))
      return 'La contraseña es obligatoria.';
    if (this.signUpForm.get('password')?.hasError('pattern'))
      return 'La contraseña debe tener 8 caracteres, 1 número y 1 símbolo.';
    if (this.signUpForm.hasError('passwordMismatch'))
      return 'Las contraseñas no coinciden.';
    return 'Por favor, revisa que todos los campos sean correctos.';
  }

  // Nuevo método para mostrar el toast
  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
    });
    await toast.present();
  }
}
